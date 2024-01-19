import React, { useState } from 'react';

function Halls( { halls, sortByName, sortByCity, sortByProvince, sortByDistance, sortByRating } ) {
  const [visitedColour] = useState('#2f7531');

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
