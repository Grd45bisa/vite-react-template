import React, { useEffect, useState, useRef } from 'react';
import '../style/UlasanBintangLima.css';
import { fetchUlasan } from '../../services/apiClient';

const renderStars = (rating) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} className={i <= rating ? 'star filled' : 'star'}>⭐️</span>
    );
  }
  return stars;
};

const UlasanCarousel = () => {
  const [ulasan, setUlasan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const timeoutRef = useRef(null);

  // For auto-scrolling
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [autoScrollDirection, setAutoScrollDirection] = useState('right');
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchUlasanData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Gunakan fungsi fetchUlasan dari apiClient
        const response = await fetchUlasan();
        
        if (!isMounted) return;

        // Filter to only 5-star reviews (handle string/number conversion)
        const bintangLima = response.filter(u => Number(u.rating) === 5);
  
        if (bintangLima.length === 0) {
          setUlasan([]); // Empty array if no 5-star reviews
          setError('Belum ada ulasan bintang 5 saat ini.');
        } else {
          const shuffled = bintangLima.sort(() => 0.5 - Math.random());
          const selected = shuffled.slice(0, 10);
          setUlasan([...selected, ...selected]); // Duplicate for infinite scrolling
        }
        
        setLoading(false);
      } catch (err) {
        if (!isMounted) return;
        
        console.error('Gagal ambil ulasan:', err);
        setError('Gagal memuat testimoni pelanggan.');
        
        // Use mock data as fallback
        const mockData = [
          { 
            produk: "Erigo T-Shirt Skye Black", 
            rating: 5, 
            komentar: "Bahannya nyaman dan desainnya keren banget! Worth it.",
            pengguna: "Alex"
          },
          { 
            produk: "Erigo Denim Pants Edwin Medium Blue", 
            rating: 5, 
            komentar: "Jahitannya rapi, model dan warnanya bagus. Recommended!",
            pengguna: "Budi"
          },
          { 
            produk: "Erigo T-Shirt Selkie Olive", 
            rating: 5, 
            komentar: "Suka banget sama warnanya, di badan juga nyaman. Kualitas bagus.",
            pengguna: "Citra"
          }
        ];
        
        // Duplicate mock data for infinite scrolling
        setUlasan([...mockData, ...mockData]);
        setLoading(false);
      }
    };

    fetchUlasanData();
    
    // Cleanup function
    return () => {
      isMounted = false;
      
      // Clear any existing auto-scroll timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Auto-scrolling effect
  useEffect(() => {
    // Only auto-scroll if there are reviews and auto-scrolling is enabled
    if (ulasan.length > 0 && isAutoScrolling && !isPaused && !loading) {
      timeoutRef.current = setTimeout(() => {
        const container = scrollRef.current;
        if (!container) return;
        
        const scrollDistance = 160; // Adjusted for smoother scrolling
        
        if (autoScrollDirection === 'right') {
          container.scrollBy({
            left: scrollDistance,
            behavior: 'smooth'
          });
          
          // Check if we reached the end and need to change direction
          if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 100) {
            setAutoScrollDirection('left');
          }
        } else {
          container.scrollBy({
            left: -scrollDistance,
            behavior: 'smooth'
          });
          
          // Check if we reached the beginning and need to change direction
          if (container.scrollLeft <= 100) {
            setAutoScrollDirection('right');
          }
        }
      }, 3000); // Scroll every 3 seconds
      
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [ulasan, isAutoScrolling, isPaused, loading, autoScrollDirection]);

  const handleScroll = (direction) => {
    // Temporarily pause auto-scrolling when user manually scrolls
    setIsPaused(true);
    
    const container = scrollRef.current;
    if (!container) return;

    const scrollDistance = 300;
    container.scrollBy({
      left: direction === 'left' ? -scrollDistance : scrollDistance,
      behavior: 'smooth'
    });
    
    // Resume auto-scrolling after a delay
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 5000); // Resume after 5 seconds of inactivity
  };

  return (
    <div className="ulasan-wrapper">
      <h2 className="ulasan-title">Testimoni Pelanggan</h2>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Memuat testimoni pelanggan...</p>
        </div>
      ) : error && ulasan.length === 0 ? (
        <div className="error-container">
          <p className="error-text">{error}</p>
        </div>
      ) : (
        <div className="carousel-with-buttons">
          <button 
            className="scroll-button left" 
            onClick={() => handleScroll('left')}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            &lt;
          </button>
          <div 
            className="ulasan-container" 
            ref={scrollRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {ulasan.length === 0 ? (
              <p>Belum ada ulasan bintang 5</p>
            ) : (
              ulasan.map((u, i) => (
                <div key={i} className="ulasan-card">
                  <div className="ulasan-header">
                    <h3 className="produk-nama">{u.produk}</h3>
                    <div className="ulasan-rating">{renderStars(u.rating)}</div>
                  </div>
                  <p className="ulasan-komentar">{u.komentar}</p>
                  <p className="ulasan-pengguna">- {u.pengguna}</p>
                </div>
              ))
            )}
          </div>
          <button 
            className="scroll-button right" 
            onClick={() => handleScroll('right')}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default UlasanCarousel;