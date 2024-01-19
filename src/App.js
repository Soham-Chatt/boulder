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
    setMyCoordinates({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    });
    setShowWarning(false);
    // Logic to update the hall list
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
            <div className={"col-md-7"}>
              <Warning message={"Location permissions denied. Try again with location permissions to get distances."} show={showWarning}/>
            </div>

            <div className={"col-md-8"}>

            </div>

          </div>
        </div>
      </div>
  );
}

export default App;
