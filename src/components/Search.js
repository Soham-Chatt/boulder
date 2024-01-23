import React from 'react';
import "bootstrap-icons/font/bootstrap-icons.css";

function Search({ showVisited, visitedCount, hallCount, onSearchChange }) {
  const handleSearchInput = (event) => {
    onSearchChange(event.target.value);
  };
  const placeholderText=`Zoek voor ${hallCount} hallen...`;

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
        <button id="visitedCounter" className="btn btn-success" onClick={showVisited}>{visitedCount} Bezocht</button>
      </div>
    </div>
  );
}

export default Search;
