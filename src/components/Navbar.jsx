import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, ShoppingCart, User, Home, Heart, MessageCircle, List, FileText, Phone, BookOpen, Search } from 'lucide-react';
import './Navbar.css';

/**
 * Advanced Navigation Component with Heterogeneous Viewport Optimization
 * Implements bifurcated dimensional calibration algorithm with viewport-conditional execution
 * 
 * @param {Object} props - Component properties
 * @param {boolean} props.isLoggedIn - Authentication state tensor
 * @param {string} props.userName - User identity vector
 * @returns {JSX.Element} - Rendered component with optimized dimensional characteristics
 */
const Navbar = ({ isLoggedIn, userName }) => {
  // State management vectors
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const [isDesktopViewport, setIsDesktopViewport] = useState(window.innerWidth > 768);
  
  // Reference nodes for dimensional calculation and event management
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const navbarRef = useRef(null);
  
  // Router hooks for navigation state transformations
  const navigate = useNavigate();
  const location = useLocation();

  // Viewport dimension vector monitoring
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setViewportWidth(width);
      setIsDesktopViewport(width > 768);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Conditional compensatory dimension calculation for desktop viewports
  useEffect(() => {
    // Skip dimensional compensation for mobile viewport domains
    if (!isDesktopViewport) return;
    
    // DOM reference acquisition
    const navbarElement = navbarRef.current;
    
    if (navbarElement) {
      // Dimensional tensor extraction
      const navbarHeight = navbarElement.offsetHeight;
      
      // Establish spatial compensation
      document.documentElement.style.setProperty('--navbar-height', `${navbarHeight}px`);
      
      // Register mutation observer for dimensional recalculation
      const resizeObserver = new ResizeObserver(() => {
        const updatedHeight = navbarElement.offsetHeight;
        document.documentElement.style.setProperty('--navbar-height', `${updatedHeight}px`);
        document.body.style.paddingTop = `75px`;
      });
      
      resizeObserver.observe(navbarElement);
      
      // Resource deallocation protocol
      return () => {
        resizeObserver.disconnect();
        document.body.style.paddingTop = '0';
      };
    }
  }, [isDesktopViewport]);

  // Scroll vector monitoring and state transition calculation
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Binary state classification based on threshold function
      setIsScrolled(currentScrollY > 80);
      
      // Directional vector calculation with hysteresis
      if (currentScrollY > lastScrollY && currentScrollY > 300) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }
      
      // State persistence
      setLastScrollY(currentScrollY);
    };

    // Event registration with performance optimization
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Cleanup method invocation
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Initialize search input with URL parameter if on product page
  useEffect(() => {
    if (location.pathname === '/product') {
      const params = new URLSearchParams(location.search);
      const searchParam = params.get('search');
      if (searchParam) {
        setSearchQuery(searchParam);
      }
    }
  }, [location]);

  // State transition functions
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleDropdown = (e) => {
    e.stopPropagation(); // Prevent event propagation
    setDropdownOpen(!dropdownOpen);
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    setDropdownOpen(false); // Close dropdown
    navigate('/admin/dashboard'); // Navigate to login page
  };

  // Search query vector transformation
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Navigation state transformation
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Conditional navigation based on query validity
    if (searchQuery.trim() !== '') {
      navigate(`/product?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Custom event dispatch for external component communication
  const openChatbox = (e) => {
    e.preventDefault();
    window.dispatchEvent(new Event('open-chatbox'));
  };

  // Outside click detection for dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current && 
        !buttonRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    }

    // Conditional event registration
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // CSS class determination through state composition
  const navbarClasses = `navbar ${isScrolled ? 'navbar-scrolled' : ''} ${isHidden ? 'navbar-hidden' : ''}`;

  return (
    <>
      <nav className={navbarClasses} ref={navbarRef}>
        <div className="navbar-top">
          {/* Desktop View */}
          <div className="desktop-view">
            {/* Menu Toggle Button */}
            <div className="menu-toggle" onClick={toggleMenu}>
              <span></span>
              <span></span>
              <span></span>
            </div>

            {/* Left Navigation Section */}
            <div className={`navbar-left ${menuOpen ? 'active' : ''}`}>
              <Link to="/" className="navbar-logo">
                <img src="/logo/Logo.png" alt="Logo" />
                <span>FashionHub</span>
              </Link>
              <Link to="/product" className="navbar-kategori">Produk</Link>
            </div>

            {/* Center Navigation Section */}
            <div className="navbar-center">
              <form className="search-container" onSubmit={handleSearchSubmit}>
                <div className="search-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                <input 
                  type="text" 
                  placeholder="Cari di FashionHub" 
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </form>
            </div>

            {/* Right Navigation Section */}
            <div className="navbar-right">
              <div className="icon-container">
                <ShoppingCart className="icon" />
              </div>
              <div className="icon-container">
                <Bell className="icon" />
              </div>
              {isLoggedIn ? (
                <div className="user-info">
                  <User className="icon" />
                  <span>{userName}</span>
                </div>
              ) : (
                <div className="user-dropdown-container">
                  <Link to="#"
                    onClick={handleLoginClick}
                    ref={buttonRef}
                    className="login-button"
                  >
                    <span>Login</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile View */}
          <div className="mobile-view">
            {/* Search Input */}
            <form className="mobile-search" onSubmit={handleSearchSubmit}>
              <input 
                type="text" 
                placeholder="Cari Produk ..." 
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <button type="submit" className="mobile-search-button">
                <Search className="search-icon-button" />
              </button>
            </form>

            {/* Icons */}
            <div className="mobile-icons">
              <Bell className="icon" />
              <ShoppingCart className="icon" />
              <User className="icon" 
                  onClick={toggleDropdown}
                  ref={buttonRef} />
              <div className="user-dropdown-container">
                  
                {/* User Dropdown */}
                {dropdownOpen && (
                  <div className="user-dropdown" ref={dropdownRef}>
                    <div className="dropdown-header">
                      <div className="dropdown-logo">
                        <img src="/logo/Logo.png" alt="Logo" />
                      </div>
                      <div className="user-profile">
                        <p>Haii... User</p>
                      </div>
                      <div className="auth-buttons">
                        <Link to="/register" className="register-button" onClick={() => setDropdownOpen(false)}>REGISTER</Link>
                        <a href="#" className="login-dropdown-button" onClick={handleLoginClick}>LOGIN</a>
                      </div>
                      <div className="dropdown-menu">
                        <Link to="/transactions" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                          <List className="dropdown-icon" />
                          <span>Daftar Transaksi</span>
                        </Link>
                        <Link to="/products" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                          <FileText className="dropdown-icon" />
                          <span>Produk</span>
                        </Link>
                        <Link to="/contact" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                          <Phone className="dropdown-icon" />
                          <span>Contact</span>
                        </Link>
                        <Link to="/blogs" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                          <BookOpen className="dropdown-icon" />
                          <span>Blogs (coming soon)</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Search History - Desktop Only */}
        <div className="navbar-bottom desktop-only">
          <span onClick={() => navigate('/product?search=Celana%20Cargo')}>Celana Cargo</span>
          <span onClick={() => navigate('/product?search=Jaket%20Oversize')}>Jaket Oversize</span>
          <span onClick={() => navigate('/product?search=Kaos%20Streetwear')}>Kaos Streetwear</span>
          <span onClick={() => navigate('/product?search=Tote%20Bag')}>Tote Bag</span>
          <span onClick={() => navigate('/product?search=Sneakers%20Lokal')}>Sneakers Lokal</span>
        </div>
      </nav>

      {/* Mobile Bottom Menu */}
      <div className="mobile-bottom-menu">
        <Link to="/" className="bottom-menu-item">
          <Home className="bottom-icon" />
          <span>Home</span>
        </Link>
        <Link to="/product" className="bottom-menu-item">
          <ShoppingCart className="bottom-icon" />
          <span>Produk</span>
        </Link>
        <Link to="/wishlist" className="bottom-menu-item">
          <Heart className="bottom-icon" />
          <span>Wishlist</span>
        </Link>
        {/* Chat button uses onClick handler */}
        <div onClick={openChatbox} className="bottom-menu-item">
          <MessageCircle className="bottom-icon" />
          <span>Chat</span>
        </div>
      </div>
    </>
  );
};

export default Navbar;