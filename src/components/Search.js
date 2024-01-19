import React from 'react';

function Search({ visitedCount, onSearchChange }) {
  const handleSearchInput = (event) => {
    onSearchChange(event.target.value);
  };

  return (
    <div className="col-md">
      <div className="input-group mb-3">
        <span className="input-group-text" id="basic-addon1"><i className="bi bi-search"></i></span>
        <input
          type="text"
          id="searchInput"
          className="form-control"
          placeholder="Search..."
          aria-label="search"
          aria-describedby="basic-addon1"
          onInput={handleSearchInput}
        />
        <button id="visitedCounter" className="btn btn-success">{visitedCount} Visited</button>
        <button id="toggleMapButton" className="btn btn-primary border-start">Show Map</button>
      </div>
    </div>
  );
}

export default Search;
