// components/dashboard/SummaryCard.js
import React from 'react';

const SummaryCard = ({ icon, title, value, className }) => {
  return (
    <div className={`summary-card ${className || ''}`}>
      <div className="summary-icon">{icon}</div>
      <div className="summary-details">
        <p className="summary-title">{title}</p>
        <p className="summary-value">{value}</p>
      </div>
    </div>
  );
};

export default SummaryCard;