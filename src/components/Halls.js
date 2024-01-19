import React, { useState, useEffect } from 'react';
import hallsData from '../halls.json';

function Halls( {myCoordinates} ) {
  const [halls, setHalls] = useState([]);
  const [sortState, setSortState] = useState({
    name: 'asc',
    city: 'asc',
    province: 'asc',
    distance: 'asc',
    rating: 'asc'
  });
  const [visitedColour] = useState('#2f7531');

  useEffect(() => {
    console.log("Geolocation in halls: ", myCoordinates);
    const halls = hallsData.map(hall => ({
      ...hall,
      distance: myCoordinates ? calculateDistance(myCoordinates.latitude, myCoordinates.longitude, hall.latitude, hall.longitude) : null
    }));

    setHalls(halls);
    if (myCoordinates) sortByDistanceInitial(halls);
    else sortByNameInitial(halls);
  }, [myCoordinates]);

  const sortByDistanceInitial = (hallsWithDistance) => {
    const sortedHalls = [...hallsWithDistance].sort((a, b) => a.distance - b.distance);
    setHalls(sortedHalls);
  };

  const sortByNameInitial = (hallsWithDistance) => {
    const sortedHalls = [...hallsWithDistance].sort((a, b) => a.name.localeCompare(b.name));
    setHalls(sortedHalls);
  };

  const sortByName = () => {
    const sortedHalls = [...halls].sort((a, b) => {
      return sortState.name === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    });
    setHalls(sortedHalls);
    setSortState({ ...sortState, name: sortState.name === 'asc' ? 'desc' : 'asc' });
  };

  const sortByCity = () => {
    const sortedHalls = [...halls].sort((a, b) => {
      return sortState.city === 'asc' ? a.city.localeCompare(b.city) : b.city.localeCompare(a.city);
    });
    setHalls(sortedHalls);
    setSortState({ ...sortState, city: sortState.city === 'asc' ? 'desc' : 'asc' });
  };

  const sortByProvince = () => {
    const sortedHalls = [...halls].sort((a, b) => {
      return sortState.province === 'asc' ? a.province.localeCompare(b.province) : b.province.localeCompare(a.province);
    });
    setHalls(sortedHalls);
    setSortState({ ...sortState, province: sortState.province === 'asc' ? 'desc' : 'asc' });
  };

  const sortByDistance = () => {
    const sortedHalls = [...halls].sort((a, b) => {
      return sortState.distance === 'asc' ? a.distance - b.distance : b.distance - a.distance;
    });
    setHalls(sortedHalls);
    setSortState({ ...sortState, distance: sortState.distance === 'asc' ? 'desc' : 'asc' });
  };

  const sortByRating = () => {
    const sortedHalls = [...halls].sort((a, b) => {
      if (a.rating === "N/A") return 1;
      if (b.rating === "N/A") return -1;
      return sortState.rating === 'asc' ? a.rating - b.rating : b.rating - a.rating;
    });
    setHalls(sortedHalls);
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

  return (
    <div className="table-responsive">
      <table className="table table-striped border">
        <thead>
        <tr>
          <th className={"bg-dark"}><button className={"btn btn-secondary"} onClick={sortByName}>Name</button></th>
          <th className={"bg-dark"}><button className={"btn btn-secondary"} onClick={sortByCity}>City</button></th>
          <th className={"bg-dark"}><button className={"btn btn-secondary"} onClick={sortByProvince}>Province</button></th>
          <th className={"bg-dark"}><button className={"btn btn-secondary"} onClick={sortByDistance}>Distance</button></th>
          <th className={"bg-dark"}><button className={"btn btn-secondary"} onClick={sortByRating}>Rating</button></th>
        </tr>
        </thead>
        <tbody>
        {halls.map((hall, index) => (
          <tr key={index}>
            <td className={"text-white"} style={{ backgroundColor: hall.visited ? visitedColour : 'transparent' }}>{hall.name}</td>
            <td className={"text-white"} style={{ backgroundColor: hall.visited ? visitedColour : 'transparent' }}>{hall.city}</td>
            <td className={"text-white"} style={{ backgroundColor: hall.visited ? visitedColour : 'transparent' }}>{hall.province}</td>
            <td className={"text-white"} style={{ backgroundColor: hall.visited ? visitedColour : 'transparent' }}>{hall.distance ? `${hall.distance.toFixed(2)} km` : 'N/A'}</td>
            <td className={"text-white"} style={{ backgroundColor: hall.visited ? visitedColour : 'transparent' }}>{hall.rating}</td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
}

export default Halls;
