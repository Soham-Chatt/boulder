import { createContext, useContext } from 'react';

export const LANGS = ['nl', 'en'];

const strings = {
  nl: {
    title: 'Boulderhallen',
    tagline: 'Alle boulderhallen van Nederland',
    progress: (v, n) => `${v} van ${n} bezocht`,
    searchPlaceholder: 'Zoek op naam, stad of provincie',
    clearSearch: 'Zoekopdracht wissen',
    filterAll: 'Alle',
    filterVisited: 'Bezocht',
    filterClosed: 'Gesloten',
    map: 'Kaart',
    hideMap: 'Verberg kaart',
    results: (n) => `${n} ${n === 1 ? 'hal' : 'hallen'}`,
    colName: 'Naam',
    colCity: 'Stad',
    colProvince: 'Provincie',
    colDistance: 'Afstand',
    colRating: 'Rating',
    closed: 'Gesloten',
    visited: 'Bezocht',
    showOnMap: 'Toon op kaart',
    route: 'Route',
    noResults: 'Geen hallen gevonden',
    noResultsHint: 'Probeer een andere zoekterm of filter.',
    locationWarning: 'Geen toegang tot je locatie. Geef toegang en herlaad de pagina om afstanden te zien.',
    dismiss: 'Sluiten',
    lightMode: 'Lichte modus',
    darkMode: 'Donkere modus',
    language: 'Taal',
  },
  en: {
    title: 'Boulder Gyms',
    tagline: 'Every bouldering gym in the Netherlands',
    progress: (v, n) => `${v} of ${n} visited`,
    searchPlaceholder: 'Search by name, city or province',
    clearSearch: 'Clear search',
    filterAll: 'All',
    filterVisited: 'Visited',
    filterClosed: 'Closed',
    map: 'Map',
    hideMap: 'Hide map',
    results: (n) => `${n} ${n === 1 ? 'gym' : 'gyms'}`,
    colName: 'Name',
    colCity: 'City',
    colProvince: 'Province',
    colDistance: 'Distance',
    colRating: 'Rating',
    closed: 'Closed',
    visited: 'Visited',
    showOnMap: 'Show on map',
    route: 'Directions',
    noResults: 'No gyms found',
    noResultsHint: 'Try a different search or filter.',
    locationWarning: 'Location access was denied. Allow it and reload the page to see distances.',
    dismiss: 'Dismiss',
    lightMode: 'Light mode',
    darkMode: 'Dark mode',
    language: 'Language',
  },
};

// Saved choice wins; otherwise Dutch for Dutch-speaking browsers, English for everyone else.
export function detectLang() {
  try {
    const saved = localStorage.getItem('lang');
    if (LANGS.includes(saved)) return saved;
  } catch {}
  const prefs = navigator.languages?.length ? navigator.languages : [navigator.language || 'en'];
  for (const pref of prefs) {
    const code = pref.toLowerCase().slice(0, 2);
    if (LANGS.includes(code)) return code;
  }
  return 'en';
}

export function getStrings(lang) {
  return strings[lang] ?? strings.en;
}

export const LangContext = createContext(strings.en);
export const useT = () => useContext(LangContext);
