import React, { useEffect, useState } from 'react';
import '../style/Rekomendasi.css';
import axios from 'axios';

const Rekomendasi = () => {
  const [produk, setProduk] = useState([]);
  const [allProduk, setAllProduk] = useState([]);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRekomendasi = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/produk/rekomendasi?limit=100');
        const produkTersedia = res.data.filter(item => parseInt(item.stok) > 0);
        setAllProduk(produkTersedia);
        setProduk(produkTersedia.slice(0, limit));
      } catch (err) {
        console.error('Gagal fetch rekomendasi', err);
        setError('Gagal memuat produk. Silakan coba lagi nanti.');
      } finally {
        setLoading(false);
      }
    };
    fetchRekomendasi();
  }, []);

  useEffect(() => {
    // When limit changes, update the displayed products
    // This doesn't need to show loading since it's just slicing local data
    setProduk(allProduk.slice(0, limit));
  }, [limit, allProduk]);

  // Format price to Indonesian Rupiah format
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID').format(price);
  };

  // Handle potential null/undefined values in terjual
  const formatTerjual = (terjual) => {
    if (!terjual) return "0 terjual";
    return `${terjual} terjual`;
  };

  // Render loading state
  const renderLoading = () => (
    <div className="produk-loading-container">
      <div className="produk-loading-spinner"></div>
      <p>Memuat produk terpopuler...</p>
    </div>
  );

  // Render error state
  const renderError = () => (
    <div className="produk-error-container">
      <p>{error}</p>
    </div>
  );

  // Render empty state
  const renderEmpty = () => (
    <div className="produk-empty-container">
      <p>Tidak ada produk tersedia.</p>
    </div>
  );

  return (
    <div className="rekomendasi-container terpopuler-section">
      <h2>Terpopuler</h2>

      {loading ? (
        renderLoading()
      ) : error ? (
        renderError()
      ) : produk.length === 0 ? (
        renderEmpty()
      ) : (
        <>
          <div className="produk-grid">
            {produk.map((item, index) => (
              <div className="produk-card" key={index}>
                <img 
                  src={item['link_Gambar 1'] || item['link_Gambar 2'] || '/placeholder-product.png'} 
                  alt={item.nama_produk} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-product.png';
                  }}
                />
                <h3>{item.nama_produk}</h3>
                <p className="harga">Rp {formatPrice(item.harga)}</p>
                <p className="terjual">{formatTerjual(item.terjual)}</p>
                <a href={`/product/${item.product_id}`} className="btn-lihat">
                  Lihat Produk
                </a>
              </div>
            ))}
          </div>
          <div className="lihat-selengkapnya-wrapper">
            <a className="lihat-selengkapnya-btn" href="/product">
              Lihat Selengkapnya
            </a>
          </div>
        </>
      )}
    </div>
  );
};

export default Rekomendasi;