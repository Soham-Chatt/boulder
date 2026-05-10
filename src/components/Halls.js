import React from 'react';
import "bootstrap-icons/font/bootstrap-icons.css";

const VISITED_BG = '#2f7531';
const CLOSED_BG  = '#4b5563';

function rowBg(hall) {
  if (hall.closed)  return CLOSED_BG;
  if (hall.visited) return VISITED_BG;
  return 'transparent';
}

function SortBtn({ label, col, sortBy, lastSort }) {
  const active = lastSort?.col === col;
  const arrow  = active ? (lastSort.dir === 'asc' ? ' ↑' : ' ↓') : '';
  return (
    <button className="btn" onClick={() => sortBy(col)}>
      {label}{arrow && <span style={{ opacity: 0.7 }}>{arrow}</span>}
    </button>
  );
}

function Halls({ halls, sortBy, lastSort, focusHall }) {
  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th><SortBtn label="Naam"      col="name"     sortBy={sortBy} lastSort={lastSort} /></th>
            <th><SortBtn label="Stad"      col="city"     sortBy={sortBy} lastSort={lastSort} /></th>
            <th><SortBtn label="Provincie" col="province" sortBy={sortBy} lastSort={lastSort} /></th>
            <th><SortBtn label="Afstand"   col="distance" sortBy={sortBy} lastSort={lastSort} /></th>
            <th><SortBtn label="Rating"    col="rating"   sortBy={sortBy} lastSort={lastSort} /></th>
            <th style={{ width: 40 }} />
          </tr>
        </thead>
        <tbody>
          {halls.map((hall, index) => {
            const bg = rowBg(hall);
            const hasColoredBg = bg !== 'transparent';
            const cellStyle = { backgroundColor: bg, color: hasColoredBg ? '#fff' : undefined };
            return (
              <tr key={index}>
                <td style={cellStyle}>
                  {hall.name}
                  {hall.closed && (
                    <span className="badge bg-secondary ms-2" style={{ fontSize: '0.68em', verticalAlign: 'middle' }}>
                      Gesloten
                    </span>
                  )}
                </td>
                <td style={cellStyle}>{hall.city}</td>
                <td style={cellStyle}>{hall.province}</td>
                <td style={cellStyle}>{hall.distance ? `${hall.distance.toFixed(1)} km` : '—'}</td>
                <td style={cellStyle}>{hall.rating}</td>
                <td style={{ ...cellStyle, textAlign: 'center', padding: '0.4rem' }}>
                  {!hall.closed && (
                    <button
                      className="btn p-1"
                      style={{
                        color: hasColoredBg ? 'rgba(255,255,255,0.85)' : 'var(--bs-secondary-color)',
                        background: 'transparent',
                        border: 'none',
                        lineHeight: 1,
                      }}
                      onClick={() => focusHall(hall)}
                      title="Toon op kaart"
                    >
                      <i className="bi bi-geo-alt" style={{ fontSize: '0.95rem' }} />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Halls;
