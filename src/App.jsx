import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ProductPage from './pages/Product';
import Chatbox from './components/Chatbox';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product" element={<ProductPage />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        {/* Add other routes as needed */}
      </Routes>
      <Chatbox />
    </div>
  );
}

export default App;