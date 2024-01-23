import React, { useState } from 'react';

function Halls( { halls, sortBy } ) {
  const [visitedColour] = useState('#2f7531');

  return (
    <div className="table-responsive">
      <table className="table table-striped border">
        <thead>
        <tr>
          <th className={"bg-dark"}><button className={"btn btn-secondary"} onClick={() => sortBy('name')}>Naam</button></th>
          <th className={"bg-dark"}><button className={"btn btn-secondary"} onClick={() => sortBy('city')}>Stad</button></th>
          <th className={"bg-dark"}><button className={"btn btn-secondary"} onClick={() => sortBy('province')}>Provincie</button></th>
          <th className={"bg-dark"}><button className={"btn btn-secondary"} onClick={() => sortBy('distance')}>Afstand</button></th>
          <th className={"bg-dark"}><button className={"btn btn-secondary"} onClick={() => sortBy('rating')}>Rating</button></th>
        </tr>
        </thead>
        <tbody>
        {halls.map((hall, index) => (
          <tr key={index}>
            <td className={"text-white"} style={{ backgroundColor: hall.visited ? visitedColour : 'transparent' }}>{hall.name}</td>
            <td className={"text-white"} style={{ backgroundColor: hall.visited ? visitedColour : 'transparent' }}>{hall.city}</td>
            <td className={"text-white"} style={{ backgroundColor: hall.visited ? visitedColour : 'transparent' }}>{hall.province}</td>
            <td className={"text-white"} style={{ backgroundColor: hall.visited ? visitedColour : 'transparent' }}>{hall.distance ? `${hall.distance.toFixed(2)} km` : '-'}</td>
            <td className={"text-white"} style={{ backgroundColor: hall.visited ? visitedColour : 'transparent' }}>{hall.rating}</td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
}

export default Halls;
