import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from 'react-bootstrap'

function Warning({ message, show, onClose }) {
  if (!show) {
    return null;
  }

  return (
    <div className="col-md-7">
      <div id="warning" className="alert alert-warning alert-dismissible text-center" role="alert">
        {message}
        <Button variant="close custom-close" onClick={onClose} aria-label="Close">
        </Button>
      </div>
    </div>
  );
}

export default Warning;
