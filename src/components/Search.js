import React from 'react';

function Search({ showVisited, visitedCount, hallCount, onSearchChange }) {
  const handleSearchInput = (event) => {
    onSearchChange(event.target.value);
  };
  const placeholderText=`Search ${hallCount} halls...`;

  return (
    <div className="col-md">
      <div className="input-group mb-3">
        <span className="input-group-text" id="basic-addon1"><i className="bi bi-search"></i></span>
        <input
          type="text"
          id="searchInput"
          className="form-control"
          placeholder={placeholderText}
          aria-label="search"
          aria-describedby="basic-addon1"
          onInput={handleSearchInput}
        />
        <button id="visitedCounter" className="btn btn-success" onClick={showVisited}>{visitedCount} Visited</button>
      </div>
    </div>
  );
}

export default Search;
