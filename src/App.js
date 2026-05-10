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
  const [showClosed, setShowClosed] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved !== null) return saved === 'dark';
    } catch {}
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // ---------------------- Theme ---------------------- //
  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Follow system preference when the user hasn't manually overridden
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      try { if (localStorage.getItem('theme') !== null) return; } catch {}
      setIsDark(e.matches);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch {}
      return next;
    });
  };

  // ---------------------- Basic set-up ---------------------- //
  useEffect(() => {
    setHalls(hallsData);
    setDisplayedHalls(hallsData.filter(h => !h.closed));
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
    if (!halls.length) return;
    const base = halls.filter(h => showClosed || !h.closed);
    if (myCoordinates) {
      const updatedHalls = base.map(hall => ({
        ...hall,
        distance: calculateDistance(myCoordinates.latitude, myCoordinates.longitude, hall.latitude, hall.longitude)
      }));
      sortByDistanceInitial(updatedHalls);
    } else {
      setDisplayedHalls(base);
    }
  }, [halls, myCoordinates, showClosed]);


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
    const base = halls.filter(h => showClosed || !h.closed);
    if (sortState.visited) {
      if (myCoordinates) {
        const hallsWithDistance = base.map(hall => ({
          ...hall,
          distance: calculateDistance(myCoordinates.latitude, myCoordinates.longitude, hall.latitude, hall.longitude)
        }));
        sortByDistanceInitial(hallsWithDistance);
      } else {
        setDisplayedHalls(base);
      }
    } else {
      const visitedHalls = base.filter(hall => hall.visited);
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

  const toggleShowClosed = () => setShowClosed(prev => !prev);


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
    const base = halls.filter(h => showClosed || !h.closed);

    const filteredHalls = base.filter(hall =>
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
              isDark={isDark}
            />}
            <Search
              showVisited={showVisited}
              showMap={toggleMapVisibility}
              visitedCount={visitedCount}
              hallCount={displayedHalls.length}
              onSearchChange={handleSearchChange}
              showClosed={showClosed}
              toggleShowClosed={toggleShowClosed}
              closedCount={halls.filter(h => h.closed).length}
              isDark={isDark}
              toggleTheme={toggleTheme}
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
