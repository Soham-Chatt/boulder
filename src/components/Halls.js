import React from 'react';

const VISITED_BG = '#2f7531';
const CLOSED_BG  = '#4b5563';

function rowBg(hall) {
  if (hall.closed)  return CLOSED_BG;
  if (hall.visited) return VISITED_BG;
  return 'transparent';
}

function Halls({ halls, sortBy }) {
  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th><button className="btn" onClick={() => sortBy('name')}>Naam</button></th>
            <th><button className="btn" onClick={() => sortBy('city')}>Stad</button></th>
            <th><button className="btn" onClick={() => sortBy('province')}>Provincie</button></th>
            <th><button className="btn" onClick={() => sortBy('distance')}>Afstand</button></th>
            <th><button className="btn" onClick={() => sortBy('rating')}>Rating</button></th>
          </tr>
        </thead>
        <tbody>
          {halls.map((hall, index) => {
            const bg = rowBg(hall);
            const hasColoredBg = bg !== 'transparent';
            return (
              <tr key={index}>
                <td style={{ backgroundColor: bg, color: hasColoredBg ? '#fff' : undefined }}>
                  {hall.name}
                  {hall.closed && (
                    <span className="badge bg-secondary ms-2" style={{ fontSize: '0.68em', verticalAlign: 'middle' }}>
                      Gesloten
                    </span>
                  )}
                </td>
                <td style={{ backgroundColor: bg, color: hasColoredBg ? '#fff' : undefined }}>{hall.city}</td>
                <td style={{ backgroundColor: bg, color: hasColoredBg ? '#fff' : undefined }}>{hall.province}</td>
                <td style={{ backgroundColor: bg, color: hasColoredBg ? '#fff' : undefined }}>
                  {hall.distance ? `${hall.distance.toFixed(1)} km` : '—'}
                </td>
                <td style={{ backgroundColor: bg, color: hasColoredBg ? '#fff' : undefined }}>{hall.rating}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Halls;
