import React, { useState, useEffect, useMemo } from 'react';
import "bootstrap-icons/font/bootstrap-icons.css";
import Halls from './components/Halls';
import Search from './components/Search';
import Warning from './components/Warning';
import Map from './components/Map';
import hallsData from './halls.json';
import { LANGS, LangContext, detectLang, getStrings } from './i18n';

// Columns whose first click sorts high-to-low
const DESC_FIRST = new Set(['rating']);

function App() {
  const [myCoordinates, setMyCoordinates] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [locationSet, setLocationSet] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'visited' | 'closed'
  const [sort, setSort] = useState({ col: null, dir: 'asc' });
  const [showMap, setShowMap] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const [focusRequest, setFocusRequest] = useState(null);
  const [lang, setLang] = useState(detectLang);
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved !== null) return saved === 'dark';
    } catch {}
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const t = getStrings(lang);

  // ---------------------- Language ---------------------- //
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t.title;
  }, [lang, t]);

  const toggleLang = () => {
    setLang(prev => {
      const next = LANGS[(LANGS.indexOf(prev) + 1) % LANGS.length];
      try { localStorage.setItem('lang', next); } catch {}
      return next;
    });
  };

  // ---------------------- Theme ---------------------- //
  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      try { if (localStorage.getItem('theme') !== null) return; } catch {}
      setIsDark(e.matches);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Remount the map when the theme changes so colorScheme applies reliably
  useEffect(() => {
    if (showMap) setMapKey(k => k + 1);
  }, [isDark]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch {}
      return next;
    });
  };

  // ---------------------- Geolocation ---------------------- //
  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      return;
    }
    const showPosition = (position) => {
      const { latitude, longitude } = position.coords;
      setMyCoordinates({ latitude, longitude });
      setLocationSet(true);
      setShowWarning(false);
    };
    const showError = (error) => {
      console.error("Geolocation error:", error.message);
      setShowWarning(true);
      setLocationSet(true);
    };

    if (locationSet) return;
    navigator.geolocation.getCurrentPosition(showPosition, showError);
    const geoId = navigator.geolocation.watchPosition(showPosition, showError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
    return () => navigator.geolocation.clearWatch(geoId);
  }, [locationSet]);

  // ---------------------- Derived data ---------------------- //
  const halls = useMemo(() => hallsData.map(hall => ({
    ...hall,
    rating: hall.rating === 'N/A' ? null : Number(hall.rating),
    distance: myCoordinates
      ? calculateDistance(myCoordinates.latitude, myCoordinates.longitude, hall.latitude, hall.longitude)
      : null,
  })), [myCoordinates]);

  const visitedCount = halls.filter(h => h.visited).length;
  const closedCount = halls.filter(h => h.closed).length;

  const displayedHalls = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = halls.filter(hall => {
      if (filter === 'visited' && !hall.visited) return false;
      if (filter === 'closed' && !hall.closed) return false;
      if (!q) return true;
      return hall.name.toLowerCase().includes(q) ||
        hall.city.toLowerCase().includes(q) ||
        hall.province.toLowerCase().includes(q);
    });

    const col = sort.col ?? (myCoordinates ? 'distance' : null);
    if (!col) return filtered;
    const dir = sort.col ? sort.dir : 'asc';
    const sign = dir === 'asc' ? 1 : -1;

    return [...filtered].sort((a, b) => {
      const valA = a[col], valB = b[col];
      // Missing ratings/distances always sink to the bottom
      if (valA == null && valB == null) return 0;
      if (valA == null) return 1;
      if (valB == null) return -1;
      if (typeof valA === 'number') return sign * (valA - valB);
      return sign * valA.localeCompare(valB, lang);
    });
  }, [halls, query, filter, sort, myCoordinates, lang]);

  const sortBy = (col) => {
    setSort(prev => prev.col === col
      ? { col, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
      : { col, dir: DESC_FIRST.has(col) ? 'desc' : 'asc' });
  };

  // ---------------------- Map ---------------------- //
  const focusHallOnMap = (hall) => {
    setFocusRequest(prev => ({ hall, seq: (prev?.seq ?? 0) + 1 }));
    if (!showMap) {
      setShowMap(true);
      setMapKey(k => k + 1);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleMapVisibility = () => {
    setShowMap(prevShow => {
      const nextShow = !prevShow;
      if (nextShow) setMapKey(prevKey => prevKey + 1);
      return nextShow;
    });
  };

  const progress = halls.length ? Math.round((visitedCount / halls.length) * 100) : 0;

  return (
    <LangContext.Provider value={t}>
      <div className="App">
        <nav className="topbar">
          <div className="topbar-inner">
            <div className="brand">
              <span className="brand-mark" aria-hidden="true"><i className="bi bi-triangle-fill" /></span>
              <span className="brand-name">{t.title}</span>
            </div>
            <div className="topbar-actions">
              <button
                className="icon-btn lang-btn"
                onClick={toggleLang}
                title={t.language}
                aria-label={`${t.language}: ${lang.toUpperCase()}`}
              >
                <i className="bi bi-translate" />
                <span>{lang.toUpperCase()}</span>
              </button>
              <button
                className="icon-btn"
                onClick={toggleTheme}
                title={isDark ? t.lightMode : t.darkMode}
                aria-label={isDark ? t.lightMode : t.darkMode}
              >
                <i className={`bi ${isDark ? 'bi-sun' : 'bi-moon'}`} />
              </button>
            </div>
          </div>
        </nav>

        <main className="page">
          <header className="hero">
            <h1 className="hero-title">{t.tagline}</h1>
            <div className="progress-card">
              <div className="progress-text">
                <span>{t.progress(visitedCount, halls.length)}</span>
                <span className="progress-pct">{progress}%</span>
              </div>
              <div className="progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </header>

          <Warning
            message={t.locationWarning}
            show={showWarning}
            onClose={() => setShowWarning(false)}
          />

          <Search
            query={query}
            onQueryChange={setQuery}
            filter={filter}
            onFilterChange={setFilter}
            visitedCount={visitedCount}
            closedCount={closedCount}
            hallCount={displayedHalls.length}
            onToggleMap={toggleMapVisibility}
            mapVisible={showMap}
          />

          {showMap && (
            <div className="map-wrapper">
              <Map
                key={mapKey}
                data={displayedHalls}
                coords={myCoordinates}
                isDark={isDark}
                focusRequest={focusRequest}
              />
            </div>
          )}

          <Halls
            halls={displayedHalls}
            sortBy={sortBy}
            sort={sort}
            hasDistance={!!myCoordinates}
            focusHall={focusHallOnMap}
          />
        </main>
      </div>
    </LangContext.Provider>
  );
}

// ---------------------- Helper functions ---------------------- //
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const toRadians = degree => degree * Math.PI / 180;
  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default App;
