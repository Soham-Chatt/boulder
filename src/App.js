import React, {useState, useEffect} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Halls from './components/Halls';
import hallsData from './halls.json';
import Map from './components/Map';
import Search from './components/Search';
import Warning from './components/Warning';

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
  }, [halls, myCoordinates, sortState]);

  const sortByDistanceInitial = (hallsWithDistance) => {
    const sortedHalls = [...hallsWithDistance].sort((a, b) => a.distance - b.distance);
    setDisplayedHalls(sortedHalls);
  };

  const sortByName = () => {
    const sortedHalls = [...halls].sort((a, b) => {
      return sortState.name === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    });
    setDisplayedHalls(sortedHalls);
    setSortState({ ...sortState, name: sortState.name === 'asc' ? 'desc' : 'asc' });
  };

  const sortByCity = () => {
    const sortedHalls = [...halls].sort((a, b) => {
      return sortState.city === 'asc' ? a.city.localeCompare(b.city) : b.city.localeCompare(a.city);
    });
    setDisplayedHalls(sortedHalls);
    setSortState({ ...sortState, city: sortState.city === 'asc' ? 'desc' : 'asc' });
  };

  const sortByProvince = () => {
    const sortedHalls = [...halls].sort((a, b) => {
      return sortState.province === 'asc' ? a.province.localeCompare(b.province) : b.province.localeCompare(a.province);
    });
    setDisplayedHalls(sortedHalls);
    setSortState({ ...sortState, province: sortState.province === 'asc' ? 'desc' : 'asc' });
  };

  const sortByDistance = () => {
    const sortedHalls = [...halls].sort((a, b) => {
      return sortState.distance === 'asc' ? a.distance - b.distance : b.distance - a.distance;
    });
    setDisplayedHalls(sortedHalls);
    setSortState({ ...sortState, distance: sortState.distance === 'asc' ? 'desc' : 'asc' });
  };

  const sortByRating = () => {
    const sortedHalls = [...halls].sort((a, b) => {
      if (a.rating === "N/A") return 1;
      if (b.rating === "N/A") return -1;
      return sortState.rating === 'asc' ? a.rating - b.rating : b.rating - a.rating;
    });
    setDisplayedHalls(sortedHalls);
    setSortState({ ...sortState, rating: sortState.rating === 'asc' ? 'desc' : 'asc' });
  };

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
    return hallsData.filter(hall => hall.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }

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

  return (
      <div className="App">
        <div className={"container py-5"}>
          <h1 className={"text-center mb-4"}>Boulder Halls</h1>
          <div className={"row justify-content-center"}>
            <Warning message={"Location permissions denied. Try again with location permissions to get distances."} show={showWarning}/>

            <div className={"col-md-8"}>
              {/* Map component goes here as <Map coords={myCoordinates}/> */}
              <Search visitedCount={visitedCount} onSearchChange={handleSearchChange}/>
              <Halls
                halls={displayedHalls}
                sortByName={sortByName}
                sortByCity={sortByCity}
                sortByProvince={sortByProvince}
                sortByDistance={sortByDistance}
                sortByRating={sortByRating}
              />
            </div>

          </div>
        </div>
      </div>
  );
}

export default App;
