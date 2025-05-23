import React from 'react';
import { Shirt } from 'lucide-react';
import './style/fashionLoader2.css';

const FashionLoader = () => {
  return (
    <div className="fh-simple-loader">
      <div className="fh-loader-panel">
        <div className="fh-loader-brand">
          <img src="/logo/Logo.png" alt="FashionHub Logo" className="fh-loader-logo" />
          <h2>FashionHub</h2>
        </div>
        
        <div className="fh-loader-animation">
          <div className="fh-shirt-container">
            <Shirt className="fh-shirt-icon" size={40} />
          </div>
        </div>
        
        <p className="fh-loading-text">Memuat data...</p>
        
        <div className="fh-loader-bar">
          <div className="fh-loader-progress"></div>
        </div>
      </div>
    </div>
  );
};

export default FashionLoader;