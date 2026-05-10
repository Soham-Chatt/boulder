import React from 'react';
import "bootstrap-icons/font/bootstrap-icons.css";

function Search({ showVisited, visitedFiltered, showOnlyClosed, closedFiltered, showMap, mapVisible, visitedCount, hallCount, onSearchChange, closedCount }) {
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
      <button
        className={`btn ${visitedFiltered ? 'btn-success' : 'btn-outline-success'}`}
        onClick={showVisited}
        style={{ flexShrink: 0 }}
      >
        {visitedCount} <span className="d-none d-sm-inline">bezocht</span>
      </button>
      {closedCount > 0 && (
        <button
          className={`btn ${closedFiltered ? 'btn-secondary' : 'btn-outline-secondary'}`}
          onClick={showOnlyClosed}
          title={closedFiltered ? 'Toon alle hallen' : 'Toon alleen gesloten'}
          style={{ flexShrink: 0 }}
        >
          {closedCount} <span className="d-none d-sm-inline">gesloten</span>
        </button>
      )}
      <button
        className={`btn ${mapVisible ? 'btn-secondary' : 'btn-outline-secondary'}`}
        onClick={showMap}
        title="Kaart"
        style={{ flexShrink: 0 }}
      >
        <i className="bi bi-map" />
      </button>
    </div>
  );
}

export default Search;
