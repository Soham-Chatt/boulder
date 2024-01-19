import React from 'react';

function Warning({ message, show }) {
  if (!show) {
    return null;
  }

  return (
    <div className="col-md-7">
      <div id="warning" className="alert alert-warning text-center" role="alert">
        {message}
      </div>
    </div>
  );
}

export default Warning;
