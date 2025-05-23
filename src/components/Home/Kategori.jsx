import React from 'react'
import { useNavigate } from 'react-router-dom';
import '../style/Kategori.css'; // Import your CSS file for styling

const categories = [
  { name: 'Semua Produk', value: 'all', icon: '/Icon-Kategori/All.svg' },
  { name: 'T-Shirt', value: 'T-Shirt', icon: '/Icon-Kategori/Tshirt.png' },
  { name: 'Celana', value: 'Pants', icon: '/Icon-Kategori/pants.png' },
  { name: 'Tas', value: 'Bag', icon: '/Icon-Kategori/Bag.png' },
  { name: 'Topi', value: 'Hat', icon: '/Icon-Kategori/Hat.png' },
];

const Kategori = () => {
  const navigate = useNavigate();

  const navigateToCategory = (category) => {
    navigate(`/product?category=${category}`);
  };

  return (
    <section className="categories">
      <div>
        <div className="categories-header" style={{ textAlign: 'center' }}>
          <h2>Jelajahi Berdasarkan Kategori</h2>
        </div>
        <div className="categories-grid" style={{justifyContent: 'center', flexWrap: 'wrap' }}>
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className="category-card"
              data-category={cat.value}
              onClick={() => navigateToCategory(cat.value)}
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              <img src={cat.icon} alt={cat.name} width="40" />
              <h3>{cat.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Kategori
