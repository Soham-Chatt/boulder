import React, {useState, useEffect} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Halls from './components/Halls';
import Search from './components/Search';
import Warning from './components/Warning';
import Map from './components/Map';
import hallsData from './halls.json';

function App() {
  const [halls, setHalls] = useState([]);
  const [displayedHalls, setDisplayedHalls] = useState([]);
  const [showWarning, setShowWarning] = useState(false);
  const [myCoordinates, setMyCoordinates] = useState(null);
  const [visitedCount, setVisitedCount] = useState(0);
  const [mapKey, setMapKey] = useState(0);
  const [sortState, setSortState] = useState({
    name: 'asc',
    city: 'asc',
    province: 'asc',
    distance: 'asc',
    rating: 'asc',
    visited: false
  });
  const [showMap, setShowMap] = useState(false);
  const [locationSet, setLocationSet] = useState(false);

  // ---------------------- Basic set-up ---------------------- //
  useEffect(() => {
    setHalls(hallsData);
    setDisplayedHalls(hallsData);
    setVisitedCount(hallsData.filter(hall => hall.visited).length);

    const showPosition = (position) => {
      const {latitude, longitude} = position.coords;
      setMyCoordinates({latitude, longitude});
      setLocationSet(true);
      setShowWarning(false);
    };

    const showError = (error) => {
      console.error("Geolocation error:", error.message);
      setShowWarning(true);
      setLocationSet(true);
    };

    navigator.geolocation ? navigator.geolocation.getCurrentPosition(showPosition, showError) : console.error("Geolocation is not supported by this browser.");
  }, []);


  useEffect(() => {
    if (!locationSet) {
      const showPosition = (position) => {
        const {latitude, longitude} = position.coords;
        setMyCoordinates({latitude, longitude});
        setLocationSet(true);
        setShowWarning(false);
      };

      const showError = (error) => {
        console.error("Geolocation error:", error.message);
        setShowWarning(true);
        setLocationSet(true);
      };

      const geoId = navigator.geolocation.watchPosition(showPosition, showError, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });

      return () => navigator.geolocation.clearWatch(geoId);
    }
  }, [locationSet]);


  useEffect(() => {
    if (myCoordinates) {
      const updatedHalls = halls.map(hall => ({
        ...hall,
        distance: calculateDistance(myCoordinates.latitude, myCoordinates.longitude, hall.latitude, hall.longitude)
      }));
      sortByDistanceInitial(updatedHalls);
    }
  }, [halls, myCoordinates]);


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
    if (sortState.visited) {
      if (myCoordinates) {
        const hallsWithDistance = halls.map(hall => ({
          ...hall,
          distance: calculateDistance(myCoordinates.latitude, myCoordinates.longitude, hall.latitude, hall.longitude)
        }));
        sortByDistanceInitial(hallsWithDistance);
      } else {
        setDisplayedHalls(halls);
      }
    } else {
      const visitedHalls = halls.filter(hall => hall.visited);
      if (myCoordinates) {
        const hallsWithDistance = visitedHalls.map(hall => ({
          ...hall,
          distance: calculateDistance(myCoordinates.latitude, myCoordinates.longitude, hall.latitude, hall.longitude)
        }));
        sortByDistanceInitial(hallsWithDistance);
      } else {
        setDisplayedHalls(visitedHalls);
      }
    }
    setSortState(prevState => ({
      ...prevState,
      visited: !prevState.visited
    }));
  }


  const toggleMapVisibility = () => {
    setShowMap(prevShow => {
      const nextShow = !prevShow;
      if (nextShow) {
        setMapKey(prevKey => prevKey + 1);
      }
      return nextShow;
    });
  };

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

    if (myCoordinates) {
      const hallsWithDistance = filteredHalls.map(hall => ({
        ...hall,
        distance: calculateDistance(myCoordinates.latitude, myCoordinates.longitude, hall.latitude, hall.longitude)
      }));
      setDisplayedHalls(hallsWithDistance);
    } else {
      setDisplayedHalls(filteredHalls);
    }
  };

  return (
    <div className="App">
      <div className={"container py-5"}>
        <h1 className={"text-center mb-4"}>Boulderhallen</h1>
        <div className={"row justify-content-center"}>
          <Warning
            message={"Je hebt geen toegang gegeven voor je locatie. Herlaad de pagina met toegang om ook de afstanden te zien."}
            show={showWarning}
            onClose={() => setShowWarning(false)}
          />
          <div className={"col-md-8"}>
            {showMap && <Map
              key={mapKey}
              data={displayedHalls}
              coords={myCoordinates}
            />}
            <Search
              showVisited={showVisited}
              showMap={toggleMapVisibility}
              visitedCount={visitedCount}
              hallCount={displayedHalls.length}
              onSearchChange={handleSearchChange}
            />
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
