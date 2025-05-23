// COMPLETE IMPLEMENTATION
// This is how you would implement the entire AI recommendation functionality in your Product.jsx file

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle, Lightbulb, ThumbsUp } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TypoCorrectionBanner from '../components/TypoCorrectionBanner';
import '../components/Product/ProductPage.css';
// Import the additional styles for AI recommendations
import './ai-recommendations-styles.css';

const Product = () => {
  // Original state variables
  const [products, setProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [productsPerPage] = useState(12);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Typo correction state variables
  const [originalQuery, setOriginalQuery] = useState('');
  const [correctedQuery, setCorrectedQuery] = useState('');
  const [usedCorrection, setUsedCorrection] = useState(false);
  
  // New AI recommendation state variables
  const [isSubjectiveQuery, setIsSubjectiveQuery] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [aiQueryAnalysis, setAiQueryAnalysis] = useState('');
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  
  const filterDropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if a query is subjective/descriptive
  const isQuerySubjective = (query) => {
    if (!query) return false;
    
    // List of subjective/descriptive terms in Indonesian
    const subjectiveTerms = [
      'keren', 'bagus', 'cantik', 'stylish', 'trendi', 'trendy', 'modern',
      'casual', 'elegant', 'elegan', 'mewah', 'simple', 'simpel', 'unik',
      'vintage', 'retro', 'klasik', 'minimalis', 'populer', 'terbaru',
      'hits', 'terbaik', 'favorit', 'recommended', 'murah', 'mahal',
      'terjangkau', 'branded', 'original', 'berkualitas', 'premium'
    ];
    
    // Check if query contains any subjective terms
    const queryWords = query.toLowerCase().split(/\s+/);
    return subjectiveTerms.some(term => queryWords.includes(term));
  };

  // Fetch AI recommendations for subjective queries
  const fetchAiRecommendations = async (query) => {
    if (!query || !isQuerySubjective(query)) return;
    
    setLoadingRecommendations(true);
    
    try {
      const response = await axios.post('/api/ai/search-suggestions/ai-recommendations', {
        query: query,
        limit: 10
      });
      
      if (response.data) {
        setAiRecommendations(response.data.recommendedProducts || []);
        setAiQueryAnalysis(response.data.queryAnalysis || '');
        setIsSubjectiveQuery(true);
      }
    } catch (error) {
      console.error('Error fetching AI recommendations:', error);
      setIsSubjectiveQuery(false);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  useEffect(() => {
    // Parse query parameters from URL
    const queryParams = new URLSearchParams(location.search);
    const categoryParam = queryParams.get('category');
    const searchParam = queryParams.get('search');
    const sortParam = queryParams.get('sort');
    const pageParam = queryParams.get('page');
    
    if (categoryParam) setSelectedCategory(categoryParam);
    
    // Handle search query and check for corrections and subjective queries
    if (searchParam && searchParam.trim() !== '') {
      setSearchQuery(searchParam);
      
      // Check if this is a subjective query
      if (isQuerySubjective(searchParam)) {
        fetchAiRecommendations(searchParam);
      } else {
        setIsSubjectiveQuery(false);
      }
      
      // Check if we used a correction
      const correctionUsed = localStorage.getItem('usedCorrection') === 'true';
      if (correctionUsed) {
        setUsedCorrection(true);
        setCorrectedQuery(searchParam);
        
        // Try to get original query from localStorage
        const originalSearchQuery = localStorage.getItem('originalQuery');
        if (originalSearchQuery) {
          setOriginalQuery(originalSearchQuery);
        }
        
        // Clean up localStorage
        localStorage.removeItem('usedCorrection');
        localStorage.removeItem('originalQuery');
      }
    }
    
    if (sortParam) setSortBy(sortParam);
    if (pageParam) setCurrentPage(parseInt(pageParam) || 1);
    
    fetchProducts();
  }, [location.search]);

  // Update URL when filters change
  useEffect(() => {
    const queryParams = new URLSearchParams();
    
    if (selectedCategory !== 'all') queryParams.set('category', selectedCategory);
    if (searchQuery && searchQuery.trim() !== '') queryParams.set('search', searchQuery);
    if (sortBy !== 'popularity') queryParams.set('sort', sortBy);
    if (currentPage > 1) queryParams.set('page', currentPage.toString());
    
    const queryString = queryParams.toString();
    navigate({
      pathname: '/product',
      search: queryString ? `?${queryString}` : ''
    }, { replace: true });
  }, [selectedCategory, searchQuery, sortBy, currentPage]);

  // Handle clicking outside filter dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    }

    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterOpen]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Updated to use Vite proxy - relative URL
      const response = await axios.post('/api/ai/search-suggestions/ai-recommendations', {
        query: query,
        limit: 10
      });
      
      // Add search parameter if it exists
      if (searchParam) {
        queryParams.push(`search=${encodeURIComponent(searchParam)}`);
      }
      
      // Add category filter if selected
      if (selectedCategory && selectedCategory !== 'all') {
        queryParams.push(`category=${encodeURIComponent(selectedCategory)}`);
      }
      
      // Add sort parameter
      queryParams.push(`sort=${sortBy}`);
      
      // Add pagination
      queryParams.push(`page=${currentPage}`);
      queryParams.push(`limit=${productsPerPage}`);
      
      // Add correction flag if we're using a corrected search term
      if (usedCorrection) {
        queryParams.push('ai_corrected=true');
      }
      
      // Build the final URL
      if (queryParams.length > 0) {
        apiUrl += `?${queryParams.join('&')}`;
      }
      
      // Fetch products from API
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error('Gagal mengambil data produk');
      
      const data = await res.json();
      
      // Keep all products for complete display
      const allProducts = data.products || data;
      
      // Create recommended products array (products with stock > 0, sorted by popularity)
      const recommended = allProducts
        .filter(product => parseInt(product.stok) > 0)
        .sort((a, b) => parseInt(b.terjual || 0) - parseInt(a.terjual || 0))
        .slice(0, 8); // Get top 8 recommended products
      
      setRecommendedProducts(recommended);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(allProducts.map(product => product.kategori))]
        .filter(category => category) // Remove undefined/null
        .sort();
      
      setCategories(['all', ...uniqueCategories]);
      setProducts(allProducts);
      
      // Calculate total pages
      setTotalPages(Math.ceil(
        filterProducts(allProducts, selectedCategory, searchQuery, sortBy).length / 
        productsPerPage
      ));
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Gagal memuat produk. Silakan coba kembali nanti.');
      
      // Use mock data if API fails
      const mockData = getMockProducts();
      
      // Create recommended products from mock data
      const recommended = mockData
        .filter(product => parseInt(product.stok) > 0)
        .sort((a, b) => parseInt(b.terjual || 0) - parseInt(a.terjual || 0))
        .slice(0, 8);
      
      setRecommendedProducts(recommended);
      setProducts(mockData);
      
      // Extract unique categories from mock data
      const uniqueCategories = [...new Set(mockData.map(product => product.kategori))]
        .filter(category => category)
        .sort();
      
      setCategories(['all', ...uniqueCategories]);
      
      // Calculate total pages for mock data
      setTotalPages(Math.ceil(
        filterProducts(mockData, selectedCategory, searchQuery, sortBy).length / 
        productsPerPage
      ));
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort products based on current filters
  const filterProducts = (productsArray, category, query, sort) => {
    let filtered = [...productsArray];
    
    // Apply category filter
    if (category && category !== 'all') {
      filtered = filtered.filter(product => 
        product.kategori && product.kategori.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Apply search filter
    if (query) {
      const searchLower = query.toLowerCase();
      filtered = filtered.filter(product => 
        (product.nama_produk && product.nama_produk.toLowerCase().includes(searchLower)) ||
        (product.deskripsi && product.deskripsi.toLowerCase().includes(searchLower)) ||
        (product.kategori && product.kategori.toLowerCase().includes(searchLower))
      );
    }
    
    // First, separate products with stock > 0 and those out of stock
    const inStockProducts = filtered.filter(product => parseInt(product.stok) > 0);
    const outOfStockProducts = filtered.filter(product => parseInt(product.stok) <= 0);
    
    // Apply sorting to in-stock products
    switch (sort) {
      case 'newest':
        inStockProducts.sort((a, b) => (b.product_id || '').localeCompare(a.product_id || ''));
        outOfStockProducts.sort((a, b) => (b.product_id || '').localeCompare(a.product_id || ''));
        break;
      case 'price-low':
        inStockProducts.sort((a, b) => (a.harga || 0) - (b.harga || 0));
        outOfStockProducts.sort((a, b) => (a.harga || 0) - (b.harga || 0));
        break;
      case 'price-high':
        inStockProducts.sort((a, b) => (b.harga || 0) - (a.harga || 0));
        outOfStockProducts.sort((a, b) => (b.harga || 0) - (a.harga || 0));
        break;
      case 'rating':
        inStockProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        outOfStockProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'popularity':
      default:
        inStockProducts.sort((a, b) => parseInt(b.terjual || 0) - parseInt(a.terjual || 0));
        outOfStockProducts.sort((a, b) => parseInt(b.terjual || 0) - parseInt(a.terjual || 0));
        break;
    }
    
    // Combine the arrays, with in-stock products first
    return [...inStockProducts, ...outOfStockProducts];
  };

  // Get current page products
  const getCurrentPageProducts = () => {
    const filteredProducts = filterProducts(products, selectedCategory, searchQuery, sortBy);
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    
    return filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  };

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5; // Maximum number of page buttons to show
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate start and end of middle section
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if we're near the beginning
      if (currentPage <= 3) {
        end = Math.min(totalPages - 1, 4);
      }
      
      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - 3);
      }
      
      // Add ellipsis if needed at beginning
      if (start > 2) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed at end
      if (end < totalPages - 1) {
        pages.push('...');
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setIsFilterOpen(false); // Close dropdown after selection
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Format price to Indonesian Rupiah format
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID').format(price);
  };

  // Handle potential null/undefined values in terjual
  const formatTerjual = (terjual) => {
    if (!terjual) return "0 terjual";
    return `${terjual} terjual`;
  };

  // Toggle filter dropdown
  const toggleFilterDropdown = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  // Check if product is in stock
  const isInStock = (product) => {
    return product.stok && parseInt(product.stok) > 0;
  };

  // Handle reset to original search query
  const handleResetToOriginal = () => {
    if (originalQuery) {
      setSearchQuery(originalQuery);
      setCorrectedQuery('');
      setUsedCorrection(false);
      
      // Navigate to the original search query
      navigate(`/product?search=${encodeURIComponent(originalQuery.trim())}`);
    }
  };

  // UPDATED renderProductGrid to show AI recommendations in the empty container
  const renderProductGrid = () => {
    const currentProducts = getCurrentPageProducts();
    
    if (loading) {
      return (
        <div className="product-loading-container">
          <div className="product-loading-spinner"></div>
          <p>Memuat produk...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="product-error-container">
          <p>{error}</p>
        </div>
      );
    }
    
    // If there are no matching products but we have AI recommendations for subjective queries
    if (currentProducts.length === 0) {
      // If AI is still loading recommendations
      if (loadingRecommendations) {
        return (
          <div className="product-empty-container">
            <div className="ai-loading-spinner"></div>
            <p>AI sedang mencari produk yang sesuai...</p>
          </div>
        );
      }
      
      // If AI found recommendations for subjective query
      if (isSubjectiveQuery && aiRecommendations.length > 0) {
        return (
          <div className="product-empty-container ai-recommendations-container">
            <div className="ai-recommendations-header">
              <Lightbulb size={20} className="ai-icon" />
              <h2>Rekomendasi AI untuk "{searchQuery}"</h2>
            </div>
            
            {aiQueryAnalysis && (
              <div className="ai-query-analysis">
                <p>{aiQueryAnalysis}</p>
              </div>
            )}
            
            <div className="ai-products-grid">
              {aiRecommendations.map((product, index) => (
                <div key={`ai-recommendation-${index}`} className="ai-product-card">
                  <div className="ai-badge">AI Pick</div>
                  {renderProductCard(product)}
                  {product.aiReason && (
                    <div className="ai-recommendation-reason">
                      <ThumbsUp size={14} className="reason-icon" />
                      <p>{product.aiReason}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }
      
      // If no regular matches and no AI recommendations
      return (
        <div className="product-empty-container">
          <p>Tidak ada produk yang sesuai dengan kriteria pencarian Anda.</p>
        </div>
      );
    }
    
    // Normal case - display the found products
    return (
      <div className="product-items-grid">
        {currentProducts.map((product, index) => (
          <div key={`product-${index}`}>
            {renderProductCard(product)}
          </div>
        ))}
      </div>
    );
  };

  // Mock products data if API fails
  const getMockProducts = () => {
    return [
      {
        product_id: "TS001",
        nama_produk: "Erigo T-Shirt Skye Black",
        kategori: "T-Shirt",
        terjual: "120",
        rating: 4.8,
        harga: 79000,
        ukuran: "M,L,XL",
        kondisi: "Baru",
        stok: "10",
        "link_Gambar 1": "/images/products/tshirt-black.jpg"
      },
      {
        product_id: "DP001",
        nama_produk: "Erigo Denim Pants Edwin Medium Blue",
        kategori: "Celana",
        terjual: "85",
        rating: 4.5,
        harga: 239000,
        ukuran: "30,32,34",
        kondisi: "Baru",
        stok: "5",
        "link_Gambar 1": "/images/products/denim-blue.jpg"
      },
      {
        product_id: "TS002",
        nama_produk: "Erigo T-Shirt Selkie Olive",
        kategori: "T-Shirt",
        terjual: "95",
        rating: 4.7,
        harga: 79000,
        ukuran: "M,L,XL",
        kondisi: "Baru",
        stok: "15",
        "link_Gambar 1": "/images/products/tshirt-olive.jpg"
      },
      {
        product_id: "JK001",
        nama_produk: "Erigo Jacket Harrington Black",
        kategori: "Jaket",
        terjual: "65",
        rating: 4.9,
        harga: 199000,
        ukuran: "M,L,XL",
        kondisi: "Baru",
        stok: "0",
        "link_Gambar 1": "/images/products/jacket-black.jpg"
      }
    ];
  };

  const renderProductCard = (product) => {
    const stockAvailable = isInStock(product);
    
    return (
      <div 
        className={`product-item-card ${!stockAvailable ? 'product-out-of-stock' : ''}`}
      >
        <img 
          src={product['link_Gambar 1'] || product['link_Gambar 2'] || '/placeholder-product.png'} 
          alt={product.nama_produk} 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/placeholder-product.png';
          }}
        />
        <h3 className="product-item-title">{product.nama_produk}</h3>
        <p className="product-item-price">Rp {formatPrice(product.harga)}</p>
        <p className="product-item-sold">{formatTerjual(product.terjual)}</p>
        
        {!stockAvailable && (
          <div className="product-stock-badge">Stok Habis</div>
        )}
        
        <a 
          href={`/product/${product.product_id}`} 
          className={`product-item-button ${!stockAvailable ? 'disabled' : ''}`}
        >
          {stockAvailable ? 'Lihat Produk' : 'Stok Habis'}
        </a>
      </div>
    );
  };

  const renderFilterSidebar = () => (
    <div className="product-filters-sidebar">
      <div className="filter-section">
        <h3>Kategori</h3>
        <ul className="category-list">
          {categories.map((category, index) => (
            <li key={index} className={selectedCategory === category ? 'active' : ''}>
              <button onClick={() => handleCategoryChange(category)}>
                {category === 'all' ? 'Semua Produk' : category}
              </button>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="filter-section">
        <h3>Harga</h3>
        <ul className="price-list">
          <li>
            <button onClick={() => setSortBy('price-low')}>
              Harga: Rendah ke Tinggi
            </button>
          </li>
          <li>
            <button onClick={() => setSortBy('price-high')}>
              Harga: Tinggi ke Rendah
            </button>
          </li>
        </ul>
      </div>
    </div>
  );

  const renderFilterDropdown = () => (
    <div className="product-filter-dropdown-container" ref={filterDropdownRef}>
      <button 
        className="product-filter-dropdown-button"
        onClick={toggleFilterDropdown}
      >
        Filter
        <span className={`dropdown-arrow ${isFilterOpen ? 'open' : ''}`}>&#9662;</span>
      </button>
      
      {isFilterOpen && (
        <div className="product-filter-dropdown-content">
          {renderFilterSidebar()}
        </div>
      )}
    </div>
  );

  const renderRecommendedProducts = () => {
    if (recommendedProducts.length === 0) return null;
    
    return (
      <div className="recommended-products-section">
        <h2 className="recommended-title">Rekomendasi Untukmu</h2>
        <div className="recommended-products-grid">
          {recommendedProducts.slice(0, 4).map((product, index) => (
            <div key={`recommended-${index}`}>
              {renderProductCard(product)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const paginationNumbers = getPaginationNumbers();
    
    return (
      <div className="product-pagination">
        <button
          className="product-pagination-prev"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          &laquo; Prev
        </button>
        
        {paginationNumbers.map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="product-pagination-ellipsis">...</span>
          ) : (
            <button
              key={`page-${page}`}
              className={`product-pagination-number ${currentPage === page ? 'active' : ''}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          )
        ))}
        
        <button
          className="product-pagination-next"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next &raquo;
        </button>
      </div>
    );
  };

  return (
    <div className="product-page">
      <Navbar />
    
      
      <div className="product-page-content container">
        {/* Show typo correction banner if applicable */}
        {usedCorrection && originalQuery && correctedQuery && (
          <TypoCorrectionBanner
            originalQuery={originalQuery}
            correctedQuery={correctedQuery}
            onReset={handleResetToOriginal}
          />
        )}
        
        
        <div className="product-top-controls">
          <div className="product-controls-container">
            {/* Render filter dropdown or sidebar based on screen size */}
            <div className="product-filter-wrapper">
              {renderFilterDropdown()}
            </div>
            
            <div className="product-sort">
              <label htmlFor="sort-select">Urutkan: </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={handleSortChange}
              >
                <option value="popularity">Terpopuler</option>
                <option value="price-low">Harga: Rendah ke Tinggi</option>
                <option value="price-high">Harga: Tinggi ke Rendah</option>
                <option value="rating">Rating Tertinggi</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="product-main-content">
          {/* Show sidebar on large screens */}
          <div className="product-filters-sidebar-desktop">
            {renderFilterSidebar()}
          </div>
          
          <div className="product-grid-container">
            <h2 className="product-grid-title">
              {selectedCategory === 'all' ? 'Semua Produk' : selectedCategory}
            </h2>
            
            {/* This now handles both normal product display AND AI recommendations */}
            {renderProductGrid()}
            
            {/* Only show pagination if there are normal search results */}
            {getCurrentPageProducts().length > 0 && renderPagination()}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Product;