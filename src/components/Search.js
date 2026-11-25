import React from 'react';
import "bootstrap-icons/font/bootstrap-icons.css";
import { useT } from '../i18n';

function Search({ query, onQueryChange, filter, onFilterChange, visitedCount, closedCount, hallCount, onToggleMap, mapVisible }) {
  const t = useT();
  const filters = [
    { key: 'all', label: t.filterAll },
    { key: 'visited', label: t.filterVisited, count: visitedCount },
    ...(closedCount > 0 ? [{ key: 'closed', label: t.filterClosed, count: closedCount }] : []),
  ];

  return (
    <div className="toolbar">
      <div className="search-field">
        <i className="bi bi-search search-icon" aria-hidden="true" />
        <input
          type="search"
          value={query}
          placeholder={t.searchPlaceholder}
          aria-label={t.searchPlaceholder}
          onChange={(e) => onQueryChange(e.target.value)}
        />
        {query && (
          <button className="search-clear" onClick={() => onQueryChange('')} aria-label={t.clearSearch}>
            <i className="bi bi-x-circle-fill" />
          </button>
        )}
      </div>

      <div className="toolbar-row">
        <div className="segmented" role="tablist">
          {filters.map(f => (
            <button
              key={f.key}
              role="tab"
              aria-selected={filter === f.key}
              className={filter === f.key ? 'active' : ''}
              onClick={() => onFilterChange(f.key)}
            >
              {f.label}
              {f.count != null && <span className="seg-count">{f.count}</span>}
            </button>
          ))}
        </div>

        <div className="toolbar-right">
          <span className="result-count">{t.results(hallCount)}</span>
          <button
            className={`pill-btn ${mapVisible ? 'active' : ''}`}
            onClick={onToggleMap}
            aria-pressed={mapVisible}
          >
            <i className={`bi ${mapVisible ? 'bi-map-fill' : 'bi-map'}`} />
            <span>{mapVisible ? t.hideMap : t.map}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Search;
