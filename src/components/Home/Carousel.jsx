import { useEffect, useState, useRef } from 'react';
import { MessageCircle, ShoppingBag, Package } from 'lucide-react';
import axios from 'axios';
import '../style/carousel.css';
import FashionLoader from '../FashionLoader2'

const Carousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [products, setProducts] = useState({
    outfitRecommendation: [],
    popularProducts: [],
    loadingOutfit: true,
    loadingPopular: true
  });
  const intervalRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  
  // Predefined carousel items
  const carouselData = [
    {
      id: 'outfit-recommendation',
      bgImage: '/carousel/1.png',
      title: 'Rekomendasi Outfit',
      description: 'Dapatkan rekomendasi outfit yang cocok dengan gaya dan kebutuhan Anda',
      icon: <MessageCircle size={24} />,
      query: 'Rekomendasi outfit untuk acara casual weekend',
      buttonText: 'Lihat Rekomendasi',
      aiPrompt: 'Pilih 3 produk outfit yang cocok untuk digunakan pada casual weekend',
      productKey: 'outfitRecommendation',
      loadingKey: 'loadingOutfit',
      showPhotoCards: true
    },
    {
      id: 'popular-products',
      bgImage: '/carousel/2.png',
      title: 'Temukan Produk Terlaris',
      description: 'Produk fashion terpopuler minggu ini yang banyak dibeli customer',
      icon: <ShoppingBag size={24} />,
      query: 'Produk fashion terlaris minggu ini. Fokus pada produk-produk dengan rating tertinggi dan penjualan terbanyak.',
      buttonText: 'Lihat Produk Terlaris',
      aiPrompt: 'Pilih 3 Produk fashion terlaris minggu ini. Fokus pada produk-produk dengan rating tertinggi dan penjualan terbanyak.',
      productKey: 'popularProducts',
      loadingKey: 'loadingPopular',
      showPhotoCards: true
    },
    {
      id: 'shipping-info',
      bgImage: '/carousel/3.png',
      title: 'Informasi Pengiriman',
      description: 'Dapatkan informasi lengkap tentang metode pengiriman dan estimasi waktu. Kami menyediakan berbagai pilihan pengiriman untuk memenuhi kebutuhan Anda, dari pengiriman reguler hingga same-day delivery untuk area tertentu.',
      icon: <Package size={24} />,
      query: 'Informasi metode pengiriman',
      buttonText: 'Cek Info Pengiriman',
      showPhotoCards: false, // Flag untuk menunjukkan bahwa slide ini tidak menampilkan photo cards
    }
  ];

  // Fetch products directly using AI for each carousel item
  useEffect(() => {
    const fetchAIRecommendedProducts = async () => {
      try {
        // AI outfit recommendations
        setProducts(prev => ({ ...prev, loadingOutfit: true }));
        const outfitPrompt = carouselData[0].aiPrompt;
        
        try {
          // Call AI product recommendation API
          const outfitResponse = await axios.post('/api/ai/product-recommendation', {
            query: outfitPrompt,
            limit: 3
          });
          
          setProducts(prev => ({ 
            ...prev, 
            outfitRecommendation: outfitResponse.data.products || [], 
            loadingOutfit: false 
          }));
        } catch (outfitError) {
          console.error('Error fetching AI outfit recommendations:', outfitError);
          // Fallback to popular products
          try {
            const fallbackResponse = await axios.get('/api/produk/rekomendasi?limit=3');
            setProducts(prev => ({ 
              ...prev, 
              outfitRecommendation: fallbackResponse.data || [], 
              loadingOutfit: false 
            }));
          } catch (fallbackError) {
            console.error('Error fetching fallback outfit products:', fallbackError);
            setProducts(prev => ({ ...prev, loadingOutfit: false }));
          }
        }
        
        // AI popular products recommendations
        setProducts(prev => ({ ...prev, loadingPopular: true }));
        const popularPrompt = carouselData[1].aiPrompt;
        
        try {
          // Get popular products based on sales data
          const popularResponse = await axios.get('/api/produk/rekomendasi?limit=3');
          
          setProducts(prev => ({ 
            ...prev, 
            popularProducts: popularResponse.data || [], 
            loadingPopular: false 
          }));
        } catch (popularError) {
          console.error('Error fetching popular products:', popularError);
          // Fallback to random products
          try {
            // Get any products as fallback
            const fallbackResponse = await axios.get('/api/produk?limit=3');
            setProducts(prev => ({ 
              ...prev, 
              popularProducts: fallbackResponse.data || [], 
              loadingPopular: false 
            }));
          } catch (fallbackError) {
            console.error('Error fetching fallback popular products:', fallbackError);
            setProducts(prev => ({ ...prev, loadingPopular: false }));
          }
        }
      } catch (error) {
        console.error('General error in fetch products:', error);
        setProducts(prev => ({ 
          ...prev, 
          loadingOutfit: false,
          loadingPopular: false
        }));
      }
    };
    
    fetchAIRecommendedProducts();
  }, []);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
  }, [currentSlide]);

  const startAutoSlide = () => {
    stopAutoSlide();
    intervalRef.current = setInterval(() => {
      goToSlide(currentSlide + 1);
    }, 20000); // 20 seconds slide duration
  };

  const stopAutoSlide = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const goToSlide = (index) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const newSlideIndex = (index + carouselData.length) % carouselData.length;
    setCurrentSlide(newSlideIndex);
    
    // Reset animation flag after transition completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 800); // Match this with the CSS transition time
  };

  // Function to handle button click
  const handleButtonClick = (slide) => {
    window.dispatchEvent(new CustomEvent('open-chatbox'));
    
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('chatbot-ai-query', { 
        detail: { 
          query: slide.query,
          source: 'carousel',
          slideId: slide.id || Date.now().toString()
        }
      }));
    }, 300);
  };

  // Handle touch events for mobile swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 100) {
      // Swipe left
      goToSlide(currentSlide + 1);
    } else if (touchEndX.current - touchStartX.current > 100) {
      // Swipe right
      goToSlide(currentSlide - 1);
    }
  };

  // Function to render photo cards based on slide type
  const renderPhotoCards = (slide) => {
    // Skip photo cards for slides where showPhotoCards is false
    if (!slide.showPhotoCards) {
      return null;
    }
    
    // For product slides, use actual product data
    const productList = products[slide.productKey] || [];
    const isLoading = products[slide.loadingKey];
    
    if (isLoading || productList.length < 3) {
      // Show loading or placeholder if products aren't loaded yet
      return (
        <>
          <div className="fh-photo-main">
            <div className="fh-loading-card">
              <FashionLoader />
            </div>
          </div>
          <div className="fh-photo-stack">
            <div className="fh-photo-small">
              <div className="fh-loading-card">
              <div className="fh-spinner"></div>
              </div>
            </div>
            <div className="fh-photo-small">
              <div className="fh-loading-card">
              <div className="fh-spinner"></div></div>
            </div>
          </div>
        </>
      );
    }
    
    return (
      <>
        <div className="fh-photo-main">
          <img 
            src={productList[0]["link_Gambar 1"] || 'https://placehold.co/350x450/f5f5f5/333?text=Produk'} 
            alt={productList[0].nama_produk} 
            className="fh-photo-img"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/350x450/f5f5f5/333?text=No+Image';
            }}
          />
          <div className="fh-prod-info">
            <h3>{productList[0].nama_produk}</h3>
            <p className="fh-prod-price">Rp {productList[0].harga?.toLocaleString('id-ID')}</p>
          </div>
        </div>
        <div className="fh-photo-stack">
          <div className="fh-photo-small">
            <img 
              src={productList[1]["link_Gambar 1"] || 'https://placehold.co/200x250/f5f5f5/333?text=Produk'} 
              alt={productList[1].nama_produk} 
              className="fh-photo-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/200x250/f5f5f5/333?text=No+Image';
              }}
            />
            <div className="fh-prod-info-small">
              <p className="fh-prod-name-small">{productList[1].nama_produk}</p>
            </div>
          </div>
          <div className="fh-photo-small">
            <img 
              src={productList[2]["link_Gambar 1"] || 'https://placehold.co/200x250/f5f5f5/333?text=Produk'} 
              alt={productList[2].nama_produk} 
              className="fh-photo-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/200x250/f5f5f5/333?text=No+Image';
              }}
            />
            <div className="fh-prod-info-small">
              <p className="fh-prod-name-small">{productList[2].nama_produk}</p>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <section 
      id="home" 
      className="fh-carousel" 
      onMouseEnter={stopAutoSlide} 
      onMouseLeave={startAutoSlide}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="fh-carousel-slide">
        {carouselData.map((slide, index) => (
          <div
            key={index}
            className={`fh-carousel-item ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url('${slide.bgImage}')` }}
          >
            <div className="fh-carousel-overlay"></div>
            <div className={`fh-carousel-grid ${!slide.showPhotoCards ? 'fh-full-width' : ''}`}>
              {/* Left Column - Text Content */}
              <div className={`fh-carousel-text ${!slide.showPhotoCards ? 'fh-text-full' : ''}`}>
                <h2>{slide.title}</h2>
                <p>{slide.description}</p>
                
                
                <button 
                  onClick={() => handleButtonClick(slide)} 
                  className="fh-chat-btn"
                  aria-label={`Buka chatbot: ${slide.buttonText}`}
                >
                  <span className="fh-btn-icon">{slide.icon}</span>
                  <span className="fh-btn-text">{slide.buttonText}</span>
                </button>
              </div>
              
              {/* Right Column - Photo Cards - Only rendered if showPhotoCards is true */}
              {slide.showPhotoCards && (
                <div className="fh-carousel-photos">
                  {renderPhotoCards(slide)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Carousel indicators */}
      <div className="fh-carousel-indicators">
        {carouselData.map((_, index) => (
          <button
            key={index}
            className={`fh-indicator ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Pergi ke slide ${index + 1}`}
          ></button>
        ))}
      </div>
      
      {/* Progress bar for current slide */}
      <div className="fh-progress-container">
        <div 
          className="fh-progress-bar" 
          style={{ 
            width: `${(100 / carouselData.length) * (currentSlide + 1)}%`,
            transition: isAnimating ? 'width 0.8s ease-in-out' : 'width 20s linear'
          }}
        ></div>
      </div>
    </section>
  );
};

export default Carousel;