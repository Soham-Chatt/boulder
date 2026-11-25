import React from 'react';
import "bootstrap-icons/font/bootstrap-icons.css";
import { useT } from '../i18n';

function ratingTone(rating) {
  if (rating >= 8) return 'high';
  if (rating >= 6) return 'mid';
  return 'low';
}

function SortHeader({ label, col, sortBy, sort, className = '' }) {
  const active = sort.col === col;
  const icon = active ? (sort.dir === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down') : 'bi-arrow-down-up';
  return (
    <th className={className} aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button className={`sort-btn ${active ? 'active' : ''}`} onClick={() => sortBy(col)}>
        {label}
        <i className={`bi ${icon} sort-icon`} aria-hidden="true" />
      </button>
    </th>
  );
}

function Rating({ value }) {
  if (value == null) return <span className="muted">—</span>;
  return <span className={`rating rating-${ratingTone(value)}`}>{value}</span>;
}

function Halls({ halls, sortBy, sort, hasDistance, focusHall }) {
  const t = useT();

  if (!halls.length) {
    return (
      <div className="empty-state">
        <i className="bi bi-search" aria-hidden="true" />
        <p className="empty-title">{t.noResults}</p>
        <p className="empty-hint">{t.noResultsHint}</p>
      </div>
    );
  }

  return (
    <div className="list-card">
      <table className="halls-table">
        <thead>
          <tr>
            <SortHeader label={t.colName}     col="name"     sortBy={sortBy} sort={sort} className="col-name" />
            <SortHeader label={t.colCity}     col="city"     sortBy={sortBy} sort={sort} className="col-city" />
            <SortHeader label={t.colProvince} col="province" sortBy={sortBy} sort={sort} className="col-province" />
            <SortHeader label={t.colRating}   col="rating"   sortBy={sortBy} sort={sort} className="col-rating" />
            {hasDistance && (
              <SortHeader label={t.colDistance} col="distance" sortBy={sortBy} sort={sort} className="col-distance" />
            )}
            <th className="col-action" aria-hidden="true" />
          </tr>
        </thead>
        <tbody>
          {halls.map((hall) => (
            <tr
              key={`${hall.name}-${hall.city}`}
              className={hall.closed ? 'is-closed' : hall.visited ? 'is-visited' : ''}
            >
              <td className="col-name">
                <div className="hall-name">
                  {hall.visited && !hall.closed && (
                    <i className="bi bi-check-circle-fill visited-icon" title={t.visited} aria-label={t.visited} />
                  )}
                  <span>{hall.name}</span>
                  {hall.closed && <span className="tag">{t.closed}</span>}
                </div>
                <div className="hall-sub">{hall.city} · {hall.province}</div>
              </td>
              <td className="col-city">{hall.city}</td>
              <td className="col-province muted">{hall.province}</td>
              <td className="col-rating"><Rating value={hall.rating} /></td>
              {hasDistance && (
                <td className="col-distance muted">
                  {hall.distance != null ? `${hall.distance.toFixed(hall.distance < 10 ? 1 : 0)} km` : '—'}
                </td>
              )}
              <td className="col-action">
                {!hall.closed && (
                  <button
                    className="row-icon-btn"
                    onClick={() => focusHall(hall)}
                    title={t.showOnMap}
                    aria-label={`${t.showOnMap}: ${hall.name}`}
                  >
                    <i className="bi bi-geo-alt" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Halls;
