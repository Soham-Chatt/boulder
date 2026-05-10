import React from 'react';

const VISITED_BG = '#2f7531';
const CLOSED_BG  = '#555';

function rowBg(hall) {
  if (hall.closed)  return CLOSED_BG;
  if (hall.visited) return VISITED_BG;
  return 'transparent';
}

function Halls({ halls, sortBy }) {
  return (
    <div className="table-responsive">
      <table className="table table-striped border">
        <thead>
        <tr>
          <th className={"bg-dark text-white"}><button className={"btn btn-secondary"} onClick={() => sortBy('name')}>Naam</button></th>
          <th className={"bg-dark text-white"}><button className={"btn btn-secondary"} onClick={() => sortBy('city')}>Stad</button></th>
          <th className={"bg-dark text-white"}><button className={"btn btn-secondary"} onClick={() => sortBy('province')}>Provincie</button></th>
          <th className={"bg-dark text-white"}><button className={"btn btn-secondary"} onClick={() => sortBy('distance')}>Afstand</button></th>
          <th className={"bg-dark text-white"}><button className={"btn btn-secondary"} onClick={() => sortBy('rating')}>Rating</button></th>
        </tr>
        </thead>
        <tbody>
        {halls.map((hall, index) => {
          const bg = rowBg(hall);
          const hasColoredBg = bg !== 'transparent';
          return (
            <tr key={index}>
              <td style={{ backgroundColor: bg, color: hasColoredBg ? 'white' : undefined }}>
                {hall.name}
                {hall.closed && <span className="badge bg-secondary ms-2" style={{ fontSize: '0.7em' }}>Gesloten</span>}
              </td>
              <td style={{ backgroundColor: bg, color: hasColoredBg ? 'white' : undefined }}>{hall.city}</td>
              <td style={{ backgroundColor: bg, color: hasColoredBg ? 'white' : undefined }}>{hall.province}</td>
              <td style={{ backgroundColor: bg, color: hasColoredBg ? 'white' : undefined }}>{hall.distance ? `${hall.distance.toFixed(2)} km` : '-'}</td>
              <td style={{ backgroundColor: bg, color: hasColoredBg ? 'white' : undefined }}>{hall.rating}</td>
            </tr>
          );
        })}
        </tbody>
      </table>
    </div>
  );
}

export default Halls;
