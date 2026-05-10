import React from 'react';
import "bootstrap-icons/font/bootstrap-icons.css";

function Search({ showVisited, showMap, visitedCount, hallCount, onSearchChange, showClosed, toggleShowClosed, closedCount, isDark, toggleTheme }) {
  const handleSearchInput = (event) => {
    onSearchChange(event.target.value);
  };
  const placeholderText = `Zoek door ${hallCount} hallen...`;

  return (
    <div className="col-md">
      <div className="input-group mb-3">
        <button id="displayedHallsCounter" className="btn btn-info disabled d-md-inline-block">{hallCount}</button>
        <input
          type="text"
          id="searchInput"
          className="form-control"
          placeholder={placeholderText}
          aria-label="search"
          aria-describedby="basic-addon1"
          onInput={handleSearchInput}
        />
        <button id="visitedCounter" className="btn btn-success d-md-inline-block" onClick={showVisited}>
          {visitedCount} <span className="d-none d-sm-inline">bezocht</span>
        </button>
        {closedCount > 0 && (
          <button
            id="closedToggle"
            className={`btn ${showClosed ? 'btn-secondary active' : 'btn-outline-secondary'}`}
            onClick={toggleShowClosed}
            title={showClosed ? 'Gesloten verbergen' : 'Gesloten tonen'}
          >
            {closedCount} <span className="d-none d-sm-inline">gesloten</span>
          </button>
        )}
        <button id="mapToggle" className="btn btn-warning" onClick={showMap}>
          <i className="bi bi-geo-alt-fill"></i>
        </button>
        <button
          id="themeToggle"
          className="btn btn-outline-secondary"
          onClick={toggleTheme}
          title={isDark ? 'Schakel naar lichtmodus' : 'Schakel naar donkermodus'}
        >
          <i className={isDark ? 'bi bi-sun-fill' : 'bi bi-moon-fill'} />
        </button>
      </div>
    </div>
  );
}

export default Search;
