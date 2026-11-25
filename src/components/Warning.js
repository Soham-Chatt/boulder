import React from 'react';
import { useT } from '../i18n';

function Warning({ message, show, onClose }) {
  const t = useT();
  if (!show) {
    return null;
  }

  return (
    <div className="notice" role="alert">
      <i className="bi bi-geo-alt notice-icon" aria-hidden="true" />
      <span className="notice-text">{message}</span>
      <button className="notice-close" onClick={onClose} aria-label={t.dismiss}>
        <i className="bi bi-x-lg" />
      </button>
    </div>
  );
}

export default Warning;
