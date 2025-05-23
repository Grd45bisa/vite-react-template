import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Component to display a notification when a search was auto-corrected
 * Shows the original query and corrected query with an option to revert
 * 
 * @param {Object} props
 * @param {string} props.originalQuery - The user's original (misspelled) query
 * @param {string} props.correctedQuery - The corrected query used for search
 * @param {Function} props.onReset - Optional function to revert to original query
 * @returns {JSX.Element}
 */
const TypoCorrectionBanner = ({ originalQuery, correctedQuery, onReset }) => {
  // Animation states
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Slight delay before showing to allow for animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`search-correction-notice ${isVisible ? 'visible' : ''}`}>
      <AlertCircle size={18} className="search-correction-icon" />
      <div className="search-correction-content">
        <span>
          Menampilkan hasil untuk <strong>{correctedQuery}</strong> alih-alih "{originalQuery}"
        </span>
        {onReset && (
          <button 
            onClick={onReset} 
            className="search-original-button"
          >
            Cari "{originalQuery}" saja
          </button>
        )}
      </div>
    </div>
  );
};

export default TypoCorrectionBanner;