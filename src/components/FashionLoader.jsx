import React from 'react';
import { Shirt } from 'lucide-react';
import './style/fashionLoader.css';

const FashionLoader = () => {
  return (
    <div className="simple-loader">
      <div className="loader-panel">
        <div className="loader-brand">
          <img src="/logo/Logo.png" alt="FashionHub Logo" className="loader-logo" />
          <h2>FashionHub</h2>
        </div>
        
        <div className="loader-animation">
          <div className="shirt-container">
            <Shirt className="shirt-icon" size={40} />
          </div>
        </div>
        
        <p className="loading-text">Memuat data...</p>
        
        <div className="loader-bar">
          <div className="loader-progress"></div>
        </div>
      </div>
    </div>
  );
};

export default FashionLoader;