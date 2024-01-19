import React, { useState } from 'react';

function Halls( { halls, sortBy } ) {
  const [visitedColour] = useState('#2f7531');

  return (
    <div className="table-responsive">
      <table className="table table-striped border">
        <thead>
        <tr>
          <th className={"bg-dark"}><button className={"btn btn-secondary"} onClick={() => sortBy('name')}>Name</button></th>
          <th className={"bg-dark"}><button className={"btn btn-secondary"} onClick={() => sortBy('city')}>City</button></th>
          <th className={"bg-dark"}><button className={"btn btn-secondary"} onClick={() => sortBy('province')}>Province</button></th>
          <th className={"bg-dark"}><button className={"btn btn-secondary"} onClick={() => sortBy('distance')}>Distance</button></th>
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
