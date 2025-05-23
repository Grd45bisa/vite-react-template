// components/dashboard/ReviewSection.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';

const ReviewSection = ({ recentReviews, hasData }) => {
  const navigate = useNavigate();
  const [displayedReviews, setDisplayedReviews] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fungsi untuk mengambil 6 review secara random
  const getRandomReviews = () => {
    if (!hasData(recentReviews) || recentReviews.length === 0) return [];
    
    // Jika jumlah review kurang dari 6, tampilkan semua
    if (recentReviews.length <= 6) return [...recentReviews];
    
    // Shuffling array menggunakan algoritma Fisher-Yates
    const shuffled = [...recentReviews];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Ambil 6 review pertama setelah di-shuffle
    return shuffled.slice(0, 6);
  };

  // Fungsi untuk refresh ulasan secara manual
  const refreshReviews = () => {
    setIsRefreshing(true);
    
    // Set timeout untuk efek visual loading
    setTimeout(() => {
      setDisplayedReviews(getRandomReviews());
      setIsRefreshing(false);
    }, 800);
  };

  // Set ulasan saat komponen dimuat atau recentReviews berubah
  useEffect(() => {
    setDisplayedReviews(getRandomReviews());
  }, [recentReviews]);

  // Function to render star rating based on ratingUlasan
  const renderRating = (rating) => {
    if (!rating) return null;
    
    // Make sure rating is a number between 1-5
    const ratingValue = Math.min(5, Math.max(1, parseInt(rating) || 0));
    
    // Create array of 5 stars
    const stars = [];
    for (let i = 0; i < 5; i++) {
      // Fill stars based on rating (i < ratingValue)
      stars.push(
        <span key={i} className={i < ratingValue ? "ds-star-filled" : "ds-star"}>★</span>
      );
    }
    
    return <div className="ds-rating">{stars}</div>;
  };

  // Helper function to get sentiment text in Indonesian
  const getSentimentText = (sentiment) => {
    switch(sentiment) {
      case 'positive':
        return 'Positif';
      case 'negative':
        return 'Negatif';
      default:
        return 'Netral';
    }
  };

  return (
    <div className="reviews-section">
      <div className="section-header">
        <h2 className="section-title">Ulasan Terbaru</h2>
        <div className="review-actions">
          
          <button className="view-all-btn" onClick={() => navigate('/ulasan')}>
            Lihat Semua
          </button>
        </div>
      </div>
      
      <div className="reviews-list">
        {hasData(displayedReviews) ? (
          displayedReviews.map((review, index) => (
            <div key={index} className={`review-card ${review.sentiment}`}>
              <div className="review-header">
                <div className="ds-product-info">
                  <h4 className="ds-product-name">{review.productName}</h4>
                  {renderRating(review.rating)}
                </div>
              </div>
              <p className="review-text">"{review.text}"</p>
              <div className="review-footer">
                <span className="customer-name">- {review.customer}</span>
                <span className={`sentiment-badge ${review.sentiment}`}>
                  {getSentimentText(review.sentiment)}
                </span>
              </div>
            </div>
          ))
        ) : isRefreshing ? (
          <div className="reviews-loading">
            <div className="loading-dots">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
            <p>Memuat ulasan...</p>
          </div>
        ) : (
          <div className="ds-no-reviews-message">
            <p>Belum ada ulasan yang tersedia</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;