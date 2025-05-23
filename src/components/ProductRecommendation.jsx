import React, { useState, useEffect } from 'react';
import './style/ProductCard.css';

export const ProductRecommendation = ({ products, title = "Terpopuler", onAskClick, onClose }) => {
  const [loading, setLoading] = useState(!products || products.length === 0);
  const [displayProducts, setDisplayProducts] = useState([]);

  // Pastikan kita menampilkan 1, 2, atau 4 produk, tidak pernah 3
  useEffect(() => {
    if (products && products.length > 0) {
      let validProducts = [...products];

      // Jika kita memiliki tepat 3 produk, hapus yang terakhir untuk menjadikannya 2
      if (validProducts.length === 3) {
        validProducts = validProducts.slice(0, 2);
        console.log('Menyesuaikan jumlah produk dari 3 menjadi 2 untuk mempertahankan layout UI');
      }

      setDisplayProducts(validProducts);
      setLoading(false);
    }
  }, [products]);

  // Render rating bintang (1-5)
  const renderRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Tambahkan bintang penuh
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`full-${i}`} className="star full">★</span>);
    }
    
    // Tambahkan setengah bintang jika diperlukan
    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }
    
    // Tambahkan bintang kosong
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">☆</span>);
    }
    
    return stars;
  };

  // Tangani gambar yang hilang
  const handleImageError = (e) => {
    e.target.src = '/placeholder-product.png'; // Gambar fallback
  };

  // Format harga dengan Rupiah Indonesia
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Tentukan kelas grid berdasarkan jumlah produk
  const getGridClass = () => {
    if (displayProducts.length === 1) {
      return 'product-single'; // Satu produk, tanpa grid
    } else {
      return 'product-grid2'; // Dua atau lebih produk, gunakan grid
    }
  };

  if (loading) {
    return (
      <div className="product-recommendation terpopuler-section">
        {title && (
          <div className="product-category-header">
            <h3 className="product-category-title">{title}</h3>
            {onClose && (
              <span className="product-category-close" onClick={onClose}>✕</span>
            )}
          </div>
        )}
        
        <div className="products-loading-container">
          <div className="loading-product-grid">
            {[1, 2].map((item) => (
              <div key={item} className="loading-product-card">
                <div className="loading-product-image"></div>
                <div className="loading-product-info">
                  <div className="loading-product-title"></div>
                  <div className="loading-product-rating"></div>
                  <div className="loading-product-price"></div>
                  <div className="loading-product-button"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!displayProducts || displayProducts.length === 0) return null;

  return (
    <div className="product-recommendation terpopuler-section">
      {title && (
        <div className="product-category-header">
          <h3 className="product-category-title">{title}</h3>
          {onClose && (
            <span className="product-category-close" onClick={onClose}>✕</span>
          )}
        </div>
      )}
      
      <div className={`product-list ${getGridClass()}`}>
        {displayProducts.map((product, index) => (
          <div key={index} className="product-card2">
            <div className="product-image2">
              <img 
                src={product["link_Gambar 1"] || '/placeholder-product.png'} 
                alt={product.nama_produk || 'Produk'}
                onError={handleImageError}
              />
            </div>
            <div className="product-info2">
              <h4 className="product-name2">{product.nama_produk || 'Nama Produk Tidak Tersedia'}</h4>
              <div className="product-rating2">
                {renderRating(product.rating || 0)}
              </div>
              <div className="product-price-stock">
                <p className="product-price2">{formatPrice(product.harga || 0)}</p>
                <span className="product-stock2">Stok: {product.stok || 'Habis'}</span>
              </div>
              <a 
                  className="product-ask-btn"
                  href={product.link || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Lihat Produk
                </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};