import React, { useState, useEffect } from 'react';
import '../style/RatingSummary.css';
import { fetchUlasan } from '../../services/apiClient';

const RatingSummary = () => {
  const [ulasan, setUlasan] = useState([]);
  const [average, setAverage] = useState(null);
  const [ratingCounts, setRatingCounts] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [totalRating, setTotalRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchRatings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Gunakan fungsi fetchUlasan dari apiClient
        const data = await fetchUlasan();
        
        // Hanya update state jika komponen masih mounted
        if (isMounted) {
          setUlasan(data);

          const ratingMap = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
          let total = 0;

          data.forEach(item => {
            // Convert rating ke number jika dalam format string
            const rating = Number(item.rating);
            if (rating >= 1 && rating <= 5) {
              ratingMap[rating] = (ratingMap[rating] || 0) + 1;
              total += rating;
            }
          });

          setRatingCounts(ratingMap);
          setTotalRating(data.length);
          setAverage(data.length > 0 ? (total / data.length).toFixed(1) : '0.0');
          setLoading(false);
        }
      } catch (err) {
        console.error('Gagal ambil ulasan:', err);
        
        // Hanya update state jika komponen masih mounted
        if (isMounted) {
          setError('Gagal memuat data rating');
          setLoading(false);
        }
      }
    };

    fetchRatings();

    return () => {
      isMounted = false; // Prevent state updates after component unmount
    };
  }, []);

  const getPercentage = (count) => {
    return totalRating > 0 ? ((count / totalRating) * 100).toFixed(1) : 0;
  };

  const totalUlasan = ulasan.length;
  const puasPercent = totalRating > 0 ? Math.round(((ratingCounts[5] + ratingCounts[4]) / totalRating) * 100) : 0;

  if (loading) {
    return (
      <>
        <h2 className="rating-title">Rating & Ulasan</h2>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Memuat data rating...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <h2 className="rating-title">Rating & Ulasan</h2>
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      <div className="rating-summary-box">
        <div className="left-summary">
          <div className="rating-star">⭐</div>
          <div className="rating-score">
            <span className="score">{average || '0.0'}</span> <span className="out-of">/ 5.0</span>
          </div>
          <div className="puas">{puasPercent}% pembeli merasa puas</div>
          <div className="counts">
            {totalRating} rating • {totalUlasan} ulasan
          </div>
        </div>

        <div className="right-breakdown">
          {[5, 4, 3, 2, 1].map(star => (
            <div key={star} className="bar-row">
              <span className="star-label">⭐ {star}</span>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ width: `${getPercentage(ratingCounts[star])}%` }}
                ></div>
              </div>
              <span className="rating-count">({ratingCounts[star] || 0})</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default RatingSummary;