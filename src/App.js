import React, {useState, useEffect} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Halls from './components/Halls';
import Map from './components/Map';
import Search from './components/Search';
import Warning from './components/Warning';

function App() {
  const [showWarning, setShowWarning] = React.useState(false);
  const [myCoordinates, setMyCoordinates] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  function showPosition(position) {
    const newCoordinates = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };

    setMyCoordinates(newCoordinates);
    setShowWarning(false);

    console.log("New Geolocation:", newCoordinates);
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
              {/* Search component goes here as <Search/> */}
              <Halls myCoordinates={myCoordinates}/>
            </div>

          </div>
        </div>
      </div>
  );
}

export default App;
