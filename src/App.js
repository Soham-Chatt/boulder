import React, {useState, useEffect} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Halls from './components/Halls';
import Search from './components/Search';
import Warning from './components/Warning';
import hallsData from './halls.json';

function App() {
  const [halls, setHalls] = useState([]);
  const [displayedHalls, setDisplayedHalls] = useState([]);
  const [showWarning, setShowWarning] = React.useState(false);
  const [myCoordinates, setMyCoordinates] = useState(null);
  const [visitedCount, setVisitedCount] = useState(0);
  const [sortState, setSortState] = useState({
    name: 'asc',
    city: 'asc',
    province: 'asc',
    distance: 'asc',
    rating: 'asc'
  });

  // ---------------------- Basic set-up ---------------------- //
  useEffect(() => {
    setHalls(hallsData);
    setDisplayedHalls(hallsData);
    setVisitedCount(hallsData.filter(hall => hall.visited).length);
    navigator.geolocation ? navigator.geolocation.getCurrentPosition(showPosition, showError) : console.error("Geolocation is not supported by this browser.");
  }, []);

  useEffect(() => {
    if (myCoordinates) {
      const updatedHalls = halls.map(hall => ({
        ...hall,
        distance: calculateDistance(myCoordinates.latitude, myCoordinates.longitude, hall.latitude, hall.longitude)
      }));
      sortByDistanceInitial(updatedHalls);
    }
  }, [halls, myCoordinates]);

  function showPosition(position) {
    const newCoordinates = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };

    setMyCoordinates(newCoordinates);
    setShowWarning(false);
  }

  function showError(error) {
    console.error("Geolocation error:", error.message);
    setShowWarning(true);
  }

  // ---------------------- Sorting functions ---------------------- //
  const sortByDistanceInitial = (hallsWithDistance) => {
    const sortedHalls = [...hallsWithDistance].sort((a, b) => a.distance - b.distance);
    setDisplayedHalls(sortedHalls);
  };

  const sortBy = (type) => {
    const sortedHalls = [...displayedHalls].sort((a, b) => {
      if (type === 'distance' || type === 'rating') {
        let valA = type === 'rating' && a[type] === "N/A" ? -Infinity : a[type];
        let valB = type === 'rating' && b[type] === "N/A" ? -Infinity : b[type];
        return sortState[type] === 'asc' ? valA - valB : valB - valA;
      } else {
        return sortState[type] === 'asc' ? a[type].localeCompare(b[type]) : b[type].localeCompare(a[type]);
      }
    });

    setDisplayedHalls(sortedHalls);
    setSortState(prevState => ({
      ...prevState,
      [type]: prevState[type] === 'asc' ? 'desc' : 'asc'
    }));
  };

  const showVisited = () => {
    const sortedHalls = [...displayedHalls].sort((a, b) => {
      if (a.visited === b.visited) return 0;
      return a.visited ? -1 : 1;
    });
    setDisplayedHalls(sortedHalls);
  }

  // ---------------------- Helper functions ---------------------- //
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;

    const toRadians = degree => degree * Math.PI / 180;
    let R = 6371;
    let dLat = toRadians(lat2 - lat1);
    let dLon = toRadians(lon2 - lon1);
    let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  const handleSearchChange = (searchQuery) => {
    const lowerCaseQuery = searchQuery.toLowerCase();

    const filteredHalls = halls.filter(hall =>
      hall.name.toLowerCase().includes(lowerCaseQuery) ||
      hall.city.toLowerCase().includes(lowerCaseQuery) ||
      hall.province.toLowerCase().includes(lowerCaseQuery) ||
      (hall.rating && hall.rating.toString().toLowerCase().includes(lowerCaseQuery))
    );
    setDisplayedHalls(filteredHalls);
  }


  return (
    <div className="App">
      <div className={"container py-5"}>
        <h1 className={"text-center mb-4"}>Boulderhallen</h1>
        <div className={"row justify-content-center"}>
          <Warning message={"Location permissions denied. Try again with location permissions to get distances."}
                   show={showWarning}/>

          <div className={"col-md-8"}>
            {/* Map component goes here as <Map coords={myCoordinates}/> */}
            <Search
              showVisited={showVisited}
              visitedCount={visitedCount}
              hallCount={halls.length}
              onSearchChange={handleSearchChange}/>
            <Halls
              halls={displayedHalls}
              sortBy={sortBy}
            />
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
