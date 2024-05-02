import React from 'react';
import "bootstrap-icons/font/bootstrap-icons.css";

function Search({showVisited, showMap, visitedCount, hallCount, onSearchChange}) {
  const handleSearchInput = (event) => {
    onSearchChange(event.target.value);
  };
  const placeholderText = `Zoek door ${hallCount} hallen...`;

  return (
    <div className="col-md">
      <div className="input-group mb-3">
        <button id="displayedHallsCounter" className="btn btn-info disabled">{hallCount}</button>
        <input
          type="text"
          id="searchInput"
          className="form-control"
          placeholder={placeholderText}
          aria-label="search"
          aria-describedby="basic-addon1"
          onInput={handleSearchInput}
        />
        <button id="visitedCounter" className="btn btn-success" onClick={showVisited}>{visitedCount} bezocht</button>
        <button id="mapToggle" className="btn btn-warning" onClick={showMap}>Toon kaart</button>
      </div>
    </div>
  );
}

export default Search;
