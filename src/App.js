import React, {useState, useEffect} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import "bootstrap-icons/font/bootstrap-icons.css";
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
    visited: false,
    closed: false,
  });
  const [showMap, setShowMap] = useState(false);
  const [locationSet, setLocationSet] = useState(false);
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

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      try { if (localStorage.getItem('theme') !== null) return; } catch {}
      setIsDark(e.matches);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Remount the map when the theme changes so colorScheme applies reliably
  useEffect(() => {
    if (showMap) setMapKey(k => k + 1);
  }, [isDark]); // eslint-disable-line react-hooks/exhaustive-deps

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

    navigator.geolocation
      ? navigator.geolocation.getCurrentPosition(showPosition, showError)
      : console.error("Geolocation is not supported by this browser.");
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
    if (myCoordinates) {
      const updatedHalls = halls.map(hall => ({
        ...hall,
        distance: calculateDistance(myCoordinates.latitude, myCoordinates.longitude, hall.latitude, hall.longitude)
      }));
      sortByDistanceInitial(updatedHalls);
    } else {
      setDisplayedHalls(halls);
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
      visited: !prevState.visited,
      closed: false,
    }));
  };

  const showOnlyClosed = () => {
    if (sortState.closed) {
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
      const closedHalls = halls.filter(hall => hall.closed);
      if (myCoordinates) {
        const hallsWithDistance = closedHalls.map(hall => ({
          ...hall,
          distance: calculateDistance(myCoordinates.latitude, myCoordinates.longitude, hall.latitude, hall.longitude)
        }));
        sortByDistanceInitial(hallsWithDistance);
      } else {
        setDisplayedHalls(closedHalls);
      }
    }
    setSortState(prevState => ({
      ...prevState,
      closed: !prevState.closed,
      visited: false,
    }));
  };

  const toggleMapVisibility = () => {
    setShowMap(prevShow => {
      const nextShow = !prevShow;
      if (nextShow) setMapKey(prevKey => prevKey + 1);
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
  };

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

  const closedCount = halls.filter(h => h.closed).length;

  return (
    <div className="App">
      <div className="container">
        <header className="site-header">
          <button
            className="btn btn-outline-secondary theme-toggle"
            onClick={toggleTheme}
            title={isDark ? 'Lichtmodus' : 'Donkermodus'}
          >
            <i className={`bi ${isDark ? 'bi-sun-fill' : 'bi-moon-fill'}`} />
          </button>
          <h1 className="site-title">Boulderhallen</h1>
          <p className="site-subtitle">
            <strong>{visitedCount}</strong> van {halls.length} hallen bezocht
          </p>
        </header>
        <div className="row justify-content-center">
          <Warning
            message={"Je hebt geen toegang gegeven voor je locatie. Herlaad de pagina met toegang om ook de afstanden te zien."}
            show={showWarning}
            onClose={() => setShowWarning(false)}
          />
          <div className="col-lg-10 col-xl-9">
            {showMap && (
              <div className="map-wrapper">
                <Map
                  key={mapKey}
                  data={displayedHalls}
                  coords={myCoordinates}
                  isDark={isDark}
                />
              </div>
            )}
            <Search
              showVisited={showVisited}
              visitedFiltered={sortState.visited}
              showOnlyClosed={showOnlyClosed}
              closedFiltered={sortState.closed}
              showMap={toggleMapVisibility}
              mapVisible={showMap}
              visitedCount={visitedCount}
              hallCount={displayedHalls.length}
              onSearchChange={handleSearchChange}
              closedCount={closedCount}
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
