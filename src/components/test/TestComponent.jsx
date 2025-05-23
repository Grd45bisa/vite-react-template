import React from 'react';
import { ProductRecommendation } from '../ProductRecommendation';
import '../style/Chatbox.css';
import '../style/ProductCard.css';

const TestComponent = () => {
  // Mock products data
  const products = [
    {
      SKU: "TS001",
      Nama_Produk: "Erigo T-Shirt Skye Black",
      Kategori: "T-Shirt",
      Terjual: 120,
      Rating: 4.8,
      Harga: 79000,
      Ukuran: "M,L,XL",
      Kondisi: "Baru",
      Stok: 10,
      "Link_Gambar 1": "https://via.placeholder.com/150"
    },
    {
      SKU: "DP001",
      Nama_Produk: "Erigo Denim Pants Edwin Medium Blue",
      Kategori: "Celana",
      Terjual: 85,
      Rating: 4.5,
      Harga: 239000,
      Ukuran: "30,32,34",
      Kondisi: "Baru",
      Stok: 5,
      "Link_Gambar 1": "https://via.placeholder.com/150"
    },
    {
      SKU: "TS002",
      Nama_Produk: "Erigo T-Shirt Selkie Olive",
      Kategori: "T-Shirt",
      Terjual: 95,
      Rating: 4.7,
      Harga: 79000,
      Ukuran: "M,L,XL",
      Kondisi: "Baru",
      Stok: 15,
      "Link_Gambar 1": "https://via.placeholder.com/150"
    },
    {
      SKU: "JK001",
      Nama_Produk: "Erigo Jacket Harrington Black",
      Kategori: "Jaket",
      Terjual: 65,
      Rating: 4.9,
      Harga: 199000,
      Ukuran: "M,L,XL",
      Kondisi: "Baru",
      Stok: 8,
      "Link_Gambar 1": "https://via.placeholder.com/150"
    }
  ];

  const handleProductClick = (product) => {
    console.log('Product clicked:', product);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Test Component</h1>
      
      <h2>Product Recommendation (Normal)</h2>
      <ProductRecommendation 
        products={products}
        title="Terpopuler"
        onAskClick={handleProductClick}
      />
      
      <h2>Product Recommendation (In Chat)</h2>
      <div className="chat-message-container bot">
        <div className="chat-msg bot">
          Berikut rekomendasi outfit untuk Anda:
        </div>
        <div className="chat-product-recommendation">
          <ProductRecommendation 
            products={products.slice(0, 2)}
            title=""
            onAskClick={handleProductClick}
          />
        </div>
      </div>
      
      <h2>Product Recommendation (In Tab Panel)</h2>
      <div className="chatbox-tab-panel" style={{ position: 'relative', maxHeight: 'none' }}>
        <div className="tab-panel-header">
          <h3 className="tab-panel-title">Produk</h3>
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Cari produk..."
            />
          </div>
          <button className="tab-panel-close">✕</button>
        </div>
        <div className="product-tab-content">
          <ProductRecommendation 
            products={products}
            title=""
            onAskClick={handleProductClick}
          />
        </div>
      </div>
    </div>
  );
};

export default TestComponent;
