// components/sidebar/Sidebar.js
import React from 'react';
import { PieChartIcon, Shirt, MessageCircle, BarChartIcon, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ activeSidebarItem, setActiveSidebarItem }) => {
  const navigate = useNavigate();

  // Fungsi untuk menangani logout
  const handleLogout = () => {
    // Di sini Anda bisa menambahkan logika logout seperti menghapus token dari localStorage
    // localStorage.removeItem('auth-token');
    
    // Arahkan pengguna ke beranda
    navigate('/');
  };

  return (
    <div className="sidebar">
      <div className="navbar-logo tambahan">
        <img src="/logo/Logo.png" alt="Logo" />
        <p className='ininama'>FashionHub</p>
      </div>
      <nav className="sidebar-nav">
        <div 
          className={`sidebar-item ${activeSidebarItem === 'Dashboard' ? 'active' : ''}`}
          onClick={() => setActiveSidebarItem('Dashboard')}
        >
          <span className="sidebar-icon"><PieChartIcon size={20} /></span>
          <span>Dashboard</span>
        </div>
        <div 
          className={`sidebar-item ${activeSidebarItem === 'Produk' ? 'active' : ''}`}
          onClick={() => setActiveSidebarItem('Produk')}
        >
          <span className="sidebar-icon"><Shirt size={20} /></span>
          <span>Produk</span>
        </div>
        <div 
          className={`sidebar-item ${activeSidebarItem === 'Ulasan' ? 'active' : ''}`}
          onClick={() => setActiveSidebarItem('Ulasan')}
        >
          <span className="sidebar-icon"><MessageCircle size={20} /></span>
          <span>Ulasan</span>
        </div>
        <div 
          className={`sidebar-item ${activeSidebarItem === 'Analisis' ? 'active' : ''}`}
          onClick={() => setActiveSidebarItem('Analisis')}
        >
          <span className="sidebar-icon"><BarChartIcon size={20} /></span>
          <span>Analisis</span>
        </div>
        <div 
          className={`sidebar-item ${activeSidebarItem === 'Pengaturan' ? 'active' : ''}`}
          onClick={() => setActiveSidebarItem('Pengaturan')}
        >
          <span className="sidebar-icon"><Settings size={20} /></span>
          <span>Pengaturan</span>
        </div>
      </nav>
      <button className="logout-btn" onClick={handleLogout}>
        <span className="sidebar-icon"><LogOut size={20} /></span> Keluar
      </button>
    </div>
  );
};

export default Sidebar;