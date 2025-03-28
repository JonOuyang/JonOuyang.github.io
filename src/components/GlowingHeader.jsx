import React from 'react';
import './GlowingHeader.css';

const GlowingHeader = ({ children }) => { // Accept children prop
  return (
    <div className="glowing-text-container"> {/* Renamed class for clarity */}
      <h1 className="glowing-text"> {/* Renamed class */}
        {children} {/* Render whatever is passed inside the component tags */}
      </h1>
    </div>
  );
};

export default GlowingHeader;