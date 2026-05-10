import React from 'react';
import "bootstrap-icons/font/bootstrap-icons.css";

function Search({ showVisited, showMap, visitedCount, hallCount, onSearchChange, showClosed, toggleShowClosed, closedCount, isDark, toggleTheme }) {
  return (
    <div className="filter-bar">
      <span className="btn btn-info" style={{ flexShrink: 0 }}>{hallCount}</span>
      <input
        type="text"
        className="form-control"
        placeholder="Zoeken..."
        aria-label="search"
        onInput={(e) => onSearchChange(e.target.value)}
      />
      <button className="btn btn-success" onClick={showVisited} style={{ flexShrink: 0 }}>
        {visitedCount} <span className="d-none d-sm-inline">bezocht</span>
      </button>
      {closedCount > 0 && (
        <button
          className={`btn btn-outline-secondary${showClosed ? ' active' : ''}`}
          onClick={toggleShowClosed}
          title={showClosed ? 'Gesloten verbergen' : 'Gesloten tonen'}
          style={{ flexShrink: 0 }}
        >
          {closedCount} <span className="d-none d-sm-inline">gesloten</span>
        </button>
      )}
      <button className="btn btn-warning" onClick={showMap} title="Kaart" style={{ flexShrink: 0 }}>
        <i className="bi bi-geo-alt-fill" />
      </button>
      <button
        className="btn btn-outline-secondary"
        onClick={toggleTheme}
        title={isDark ? 'Lichtmodus' : 'Donkermodus'}
        style={{ flexShrink: 0 }}
      >
        <i className={isDark ? 'bi bi-sun-fill' : 'bi bi-moon-fill'} />
      </button>
    </div>
  );
}

export default Search;
