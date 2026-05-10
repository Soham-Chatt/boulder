#!/usr/bin/env node
// Scrapes pofzak.nl for Dutch boulder halls, geocodes new ones via Google Places,
// and marks halls that have disappeared as closed. Coordinates for existing halls
// are never changed (stable by design). Planned/cancelled halls are skipped.
'use strict';

const fs = require('fs');
const path = require('path');
const { load } = require('cheerio');

const HALLS_PATH = path.join(__dirname, '../src/halls.json');
const POFZAK_URL = 'https://pofzak.nl/overzicht-alle-boulderhallen-nederland/';
const PLACES_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json';

// Hall names containing these substrings (case-insensitive) are skipped —
// they indicate planned, cancelled, on-hold, or already-closed halls that
// pofzak.nl tracks for reference but we don't want in our list.
const SKIP_KEYWORDS = ['gesloten', 'geannuleerd', 'on hold', 'onbekend'];

// Also skip halls whose name contains a year >= current year in parentheses,
// indicating a future planned opening: e.g. "Foo (Luchthaven 2026)".
const SKIP_YEAR_RE = /\(.*?(\d{4}).*?\)/;
const CURRENT_YEAR = new Date().getFullYear();

function normalize(s) {
  return s.toLowerCase().trim().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ');
}

function shouldSkip(hall) {
  const lower = hall.name.toLowerCase();
  if (SKIP_KEYWORDS.some((kw) => lower.includes(kw))) return true;
  const m = hall.name.match(SKIP_YEAR_RE);
  if (m && parseInt(m[1], 10) >= CURRENT_YEAR) return true;
  return false;
}

async function scrapeHalls() {
  const res = await fetch(POFZAK_URL, {
    headers: { 'User-Agent': 'BoulderHallsNL-updater/1.0 (personal site; contact via github)' },
  });
  if (!res.ok) throw new Error(`Failed to fetch ${POFZAK_URL}: ${res.status}`);

  const html = await res.text();
  const $ = load(html);
  const halls = [];

  $('table').each((_, table) => {
    const headers = [];
    $(table).find('thead th, thead td, tr:first-child th, tr:first-child td').each((_, th) => {
      headers.push($(th).text().trim().toLowerCase());
    });

    const nameIdx = headers.findIndex((h) => h.includes('naam') || h.includes('hal'));
    const cityIdx = headers.findIndex((h) => h.includes('stad') || h.includes('plaats') || h.includes('gemeente'));
    const provIdx = headers.findIndex((h) => h.includes('provin'));

    const ni = nameIdx >= 0 ? nameIdx : 0;
    const ci = cityIdx >= 0 ? cityIdx : 1;
    const pi = provIdx >= 0 ? provIdx : 2;

    $(table).find('tbody tr').each((_, row) => {
      const cells = $(row).find('td');
      if (cells.length < 3) return;

      const name = $(cells[ni]).text().trim();
      const city = $(cells[ci]).text().trim();
      const province = $(cells[pi]).text().trim();

      if (name && city && province) {
        halls.push({ name, city, province });
      }
    });

    if (halls.length > 0) return false;
  });

  return halls;
}

async function geocode(name, city, apiKey) {
  const query = `${name} ${city} Netherlands`;
  const url = `${PLACES_URL}?query=${encodeURIComponent(query)}&key=${apiKey}&language=nl&region=nl`;

  const r = await fetch(url);
  if (!r.ok) throw new Error(`Google Places error: ${r.status}`);
  const data = await r.json();

  if (data.status === 'OK' && data.results.length > 0) {
    const loc = data.results[0].geometry.location;
    return { lat: loc.lat, lon: loc.lng };
  }
  if (data.status === 'ZERO_RESULTS') return null;
  throw new Error(`Google Places API error: ${data.status} — ${data.error_message || ''}`);
}

async function main() {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error('GOOGLE_MAPS_API_KEY is not set. Aborting.');
    process.exit(1);
  }

  // Load existing halls and ensure new fields exist (idempotent migration)
  const existing = JSON.parse(fs.readFileSync(HALLS_PATH, 'utf-8'));
  existing.forEach((h) => {
    if (h.closed === undefined) h.closed = false;
    if (h.geocodeSource === undefined) h.geocodeSource = 'manual';
  });

  // Re-geocode halls with imprecise coordinates
  const needsRegeocoding = existing.filter(
    (h) => h.geocodeSource === 'city-fallback' || h.geocodeSource === 'failed'
  );
  if (needsRegeocoding.length > 0) {
    console.log(`Re-geocoding ${needsRegeocoding.length} hall(s) with imprecise coordinates...`);
    for (const hall of needsRegeocoding) {
      try {
        const result = await geocode(hall.name, hall.city, apiKey);
        if (result) {
          console.log(`  ✓ ${hall.name}: (${result.lat.toFixed(4)}, ${result.lon.toFixed(4)})`);
          hall.latitude = result.lat;
          hall.longitude = result.lon;
          hall.geocodeSource = 'google-places';
        } else {
          console.log(`  ~ ${hall.name}: no result, keeping existing coords`);
        }
      } catch (err) {
        console.warn(`  ! ${hall.name}: ${err.message}`);
      }
    }
  }

  // Scrape pofzak.nl
  console.log(`\nFetching ${POFZAK_URL}...`);
  let scraped;
  try {
    scraped = await scrapeHalls();
  } catch (err) {
    console.error(`Scrape failed: ${err.message}`);
    fs.writeFileSync(HALLS_PATH, JSON.stringify(existing, null, 2) + '\n');
    console.log(`Wrote migrated fields for ${existing.length} halls (scrape skipped).`);
    process.exit(0);
  }

  // Filter out planned/cancelled halls
  const skipped = scraped.filter(shouldSkip);
  const active = scraped.filter((h) => !shouldSkip(h));
  if (skipped.length) {
    console.log(`Skipped ${skipped.length} planned/cancelled: ${skipped.map((h) => h.name).join(', ')}`);
  }
  console.log(`Scraped ${active.length} active halls`);

  const existingByNorm = new Map(existing.map((h) => [normalize(h.name), h]));
  const scrapedByNorm = new Map(active.map((h) => [normalize(h.name), h]));

  // Mark halls no longer on the site as closed; reopen ones that came back
  let closedCount = 0;
  let reopenedCount = 0;
  for (const [norm, hall] of existingByNorm) {
    if (!scrapedByNorm.has(norm)) {
      if (!hall.closed) {
        hall.closed = true;
        closedCount++;
        console.log(`  ! Marked closed: ${hall.name}`);
      }
    } else if (hall.closed) {
      hall.closed = false;
      reopenedCount++;
      console.log(`  ~ Reopened: ${hall.name}`);
    }
    // Intentionally not propagating province from scrape — pofzak.nl data has errors.
  }

  // Geocode and add new halls
  const newHalls = [];
  for (const [norm, s] of scrapedByNorm) {
    if (existingByNorm.has(norm)) continue;

    console.log(`  + New hall: ${s.name} (${s.city}) — geocoding...`);
    let coords = null;
    try {
      coords = await geocode(s.name, s.city, apiKey);
    } catch (err) {
      console.error(`    Failed: ${err.message}`);
    }

    if (coords) {
      console.log(`    → (${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)})`);
    } else {
      console.log(`    → not found, coordinates need manual entry`);
    }

    newHalls.push({
      name: s.name,
      city: s.city,
      province: s.province,
      latitude: coords?.lat ?? 0,
      longitude: coords?.lon ?? 0,
      visited: false,
      rating: 'N/A',
      closed: false,
      geocodeSource: coords ? 'google-places' : 'failed',
    });
  }

  const updated = [...existing, ...newHalls];
  fs.writeFileSync(HALLS_PATH, JSON.stringify(updated, null, 2) + '\n');

  console.log(`\nDone. ${updated.length} halls total.`);
  if (closedCount)   console.log(`  ${closedCount} marked as closed`);
  if (reopenedCount) console.log(`  ${reopenedCount} reopened`);
  if (newHalls.length) {
    console.log(`  ${newHalls.length} new halls added`);
    const failed = newHalls.filter((h) => h.geocodeSource === 'failed');
    if (failed.length) {
      console.log(`  ⚠ ${failed.length} hall(s) need manual coordinates:`);
      failed.forEach((h) => console.log(`    - ${h.name} (${h.city})`));
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
