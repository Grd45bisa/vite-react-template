import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, Camera, Image, ShoppingBag, Send, Plus, X, Package, Search } from 'lucide-react';
import { ProductRecommendation } from './ProductRecommendation';
import './style/Chatbox.css';
import axios from 'axios';

// Constants
const STORAGE_KEY = 'fashionhub_chat_memory';
// Updated API URL to use Vite proxy
const API_URL = '/api/chatbot';

// Quick replies for welcome message
const QUICK_REPLIES = [
  "Rekomendasi produk terlaris",
  "Panduan ukuran pakaian",
  "Rekomendasi outfit untuk acara formal",
  "Rekomendasi outfit untuk acara casual"
];

// Answer options for product inquiries
const ANSWER_OPTIONS = [
  { id: 'stock', text: 'Stok masih ada gk min?' },
  { id: 'details', text: 'Detail produk dan bahan?' },
  { id: 'size', text: 'Panduan ukuran?' },
  { id: 'shipping', text: 'Estimasi pengiriman?' },
  { id: 'custom', text: 'Pertanyaan lain...' }
];

// Answer options for order inquiries
const ORDER_OPTIONS = [
  { id: 'status', text: 'Update status pesanan?' },
  { id: 'delivery', text: 'Estimasi pengiriman?' },
  { id: 'cancel', text: 'Cara batalkan pesanan?' },
  { id: 'return', text: 'Cara return barang?' },
  { id: 'custom', text: 'Pertanyaan lain...' }
];

// Product Card Component
const ProductCardInChat = ({ product }) => {
  // Format price with Indonesian Rupiah
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Handle missing image
  const handleImageError = (e) => e.target.src = '/placeholder-product.png';

  // Render star rating (1-5)
  const renderRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`full-${i}`} className="star full">★</span>);
    }
    
    // Add half star if needed
    if (hasHalfStar) stars.push(<span key="half" className="star half">★</span>);
    
    // Add empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">☆</span>);
    }
    
    return stars;
  };

  return (
    <div className="chat-product-card">
      <div className="chat-product-image">
        <img 
          src={product["link_Gambar 1"] || '/placeholder-product.png'} 
          alt={product.nama_produk || 'Produk'}
          onError={handleImageError}
        />
      </div>
      <div className="chat-product-info">
        <h4 className="chat-product-name">{product.nama_produk || 'Nama Produk Tidak Tersedia'}</h4>
        <div className="chat-product-rating">{renderRating(product.rating || 0)}</div>
        <div className="chat-product-details">
          <p className="chat-product-price">{formatPrice(product.harga || 0)}</p>
          <span className="chat-product-stock">Stok: {product.stok || 'Habis'}</span>
        </div>
      </div>
    </div>
  );
};

// Main Chatbox Component
const Chatbox = () => {
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved
        ? JSON.parse(saved)
        : [{ 
            sender: 'bot', 
            text: 'Hai! Terima kasih sudah menghubungi FashionHub 😊 Ada yang bisa aku bantu hari ini?',
            timestamp: new Date().toISOString(),
            status: 'read',
            showQuickReplies: true
          }];
    } catch {
      return [{ 
        sender: 'bot', 
        text: 'Hai! Terima kasih sudah menghubungi FashionHub 😊 Ada yang bisa aku bantu hari ini?',
        timestamp: new Date().toISOString(),
        status: 'read',
        showQuickReplies: true
      }];
    }
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState('');
  
  // UI panel states
  const [activePanel, setActivePanel] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [produk, setProduk] = useState([]);
  const [pesanan, setPesanan] = useState([]);
  const [isLoadingProduk, setIsLoadingProduk] = useState(false);
  const [isLoadingPesanan, setIsLoadingPesanan] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [userId] = useState(() => {
    const existingId = localStorage.getItem('fashionhub_user_id');
    if (existingId) return existingId;
    
    const newId = `user_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('fashionhub_user_id', newId);
    return newId;
  });
  
  // Additional UI states
  const [copyNotification, setCopyNotification] = useState(false);
  const [scrollLocked, setScrollLocked] = useState(true);
  
  // Refs
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const panelRef = useRef(null);
  const chatInputRef = useRef(null);
  
  // Format text with basic markdown
  const formatText = text => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  };
  
  // Format timestamp
  const formatTimestamp = timestamp => {
    try {
      const date = new Date(timestamp);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch (e) {
      return '';
    }
  };
  
  // Scroll handling
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;
    
    setScrollLocked(isAtBottom);
  };
  
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setScrollLocked(true);
      setHasNewMessage(false);
    }
  };
  
  // Copy to clipboard
  const copyToClipboard = text => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyNotification(true);
      setTimeout(() => setCopyNotification(false), 2000);
    });
  };
  
  // Retry failed message
  const retryMessage = message => {
    const messageIndex = messages.findIndex(msg => 
      msg.text === message.text && 
      msg.timestamp === message.timestamp
    );
    
    if (messageIndex >= 0) {
      const updatedMessages = [...messages];
      updatedMessages[messageIndex] = { ...message, status: 'sending' };
      
      setMessages(updatedMessages);
      handleSend(null, message.text);
    }
  };

  // Handle sending messages
  const handleSend = async (e, customInput = null) => {
    e?.preventDefault?.();
    
    const userInput = customInput || input.trim();
    if (!userInput) return;
    
    setLastUserMessage(userInput);
    
    const userMessage = {
      sender: 'user',
      text: userInput,
      timestamp: new Date().toISOString(),
      status: 'sending',
      source: customInput ? 'carousel' : 'user'
    };
    
    setInput('');
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsTyping(true);
    
    // Close all panels
    setActivePanel(null);
    setActiveTab(null);
    setSelectedProduct(null);
    setSelectedOrder(null);
    
    try {
      const timestamp = new Date().toISOString();
      
      // Using fetch with relative URL for Vite proxy
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          input: userInput,
          timestamp,
          userId,
          source: customInput ? 'carousel' : 'user'
        }),
      });
      
      // Update message status to 'sent'
      setMessages(prevMessages => 
        prevMessages.map(msg => msg === userMessage ? { ...msg, status: 'sent' } : msg)
      );
      
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      // Update message status to 'read'
      setMessages(prevMessages => 
        prevMessages.map(msg => msg === userMessage ? { ...msg, status: 'read' } : msg)
      );
      
      // Check if this is a product recommendation request
      const isRecommendationRequest = 
        userInput.toLowerCase().includes('rekomendasi') || 
        userInput.toLowerCase().includes('sarankan') ||
        userInput.toLowerCase().includes('outfit') ||
        userInput.toLowerCase().includes('pakaian') ||
        userInput.toLowerCase().includes('terlaris') ||
        userInput.toLowerCase().includes('produk') ||
        userInput.toLowerCase().includes('pengiriman');
      
      // Handle structured response with product recommendations
      if (data.products && data.products.length > 0 && isRecommendationRequest) {
        // Process products to ensure we always have 1, 2, or 4 products (never 3)
        let recommendationProducts = [...data.products];
        if (recommendationProducts.length === 3) {
          console.log('Adjusting product count from 3 to 2 for better UI layout');
          recommendationProducts = recommendationProducts.slice(0, 2);
        }
        
        // Separate products into top and bottom if possible
        let topProduct = null;
        let bottomProduct = null;
        
        // Find top and bottom products
        for (const product of recommendationProducts) {
          const category = (product.kategori || '').toLowerCase();
          if (!topProduct && (
              category.includes('kaos') || 
              category.includes('kemeja') || 
              category.includes('jaket') || 
              category.includes('atasan')
            )) {
            topProduct = product;
          } else if (!bottomProduct && (
              category.includes('celana') || 
              category.includes('rok') || 
              category.includes('bawahan')
            )) {
            bottomProduct = product;
          }
          if (topProduct && bottomProduct) break;
        }
        
        // Fallback if specific top/bottom not found
        if (!topProduct && recommendationProducts.length > 0) {
          topProduct = recommendationProducts[0];
        }
        
        if (!bottomProduct && recommendationProducts.length > 1) {
          bottomProduct = recommendationProducts[1];
        } else if (!bottomProduct && topProduct) {
          bottomProduct = recommendationProducts.find(p => p !== topProduct) || null;
        }
        
        // Create recommendation cards
        const finalRecommendationProducts = [];
        if (topProduct) finalRecommendationProducts.push(topProduct);
        if (bottomProduct && bottomProduct !== topProduct) finalRecommendationProducts.push(bottomProduct);
        
        // Add message with recommendation
        setMessages(prevMessages => [
          ...prevMessages, 
          { 
            sender: 'bot', 
            text: 'Berikut rekomendasi outfit untuk Anda:',
            recommendationProducts: finalRecommendationProducts,
            timestamp: new Date().toISOString(),
            status: 'read'
          }
        ]);
        
        // Add details message
        setTimeout(() => {
          let detailText = 'Detail produk:\n\n';
          
          if (topProduct) {
            detailText += `**${topProduct.nama_produk}**\n`;
            detailText += `Kategori: ${topProduct.kategori || 'Atasan'}\n`;
            detailText += `Harga: ${new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(topProduct.harga)}\n`;
            detailText += `Stok: ${topProduct.stok}\n`;
            detailText += `Ukuran: ${topProduct.ukuran || 'M, L, XL'}\n\n`;
          }
          
          if (bottomProduct && bottomProduct !== topProduct) {
            detailText += `**${bottomProduct.nama_produk}**\n`;
            detailText += `Kategori: ${bottomProduct.kategori || 'Bawahan'}\n`;
            detailText += `Harga: ${new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(bottomProduct.harga)}\n`;
            detailText += `Stok: ${bottomProduct.stok}\n`;
            detailText += `Ukuran: ${bottomProduct.ukuran || 'M, L, XL'}\n\n`;
          }
          
          detailText += data.response || 'Outfit ini sangat cocok untuk dipakai sehari-hari. Kombinasi warna dan model yang tepat akan membuat Anda tampil lebih stylish.';
          
          setMessages(prevMessages => [...prevMessages, { 
            sender: 'bot', 
            text: detailText,
            timestamp: new Date().toISOString(),
            status: 'read'
          }]);
        }, 1000);
      } else if (data.products && data.products.length > 0) {
        // Regular product recommendations (not outfit)
        let productsToShow = [...data.products];
        
        // If we have exactly 3 products, reduce to 2
        if (productsToShow.length === 3) {
          productsToShow = productsToShow.slice(0, 2);
        }
        
        setMessages(prevMessages => [
          ...prevMessages, 
          { 
            sender: 'bot', 
            text: data.response || 'Berikut rekomendasi produk untuk Anda:',
            recommendationProducts: productsToShow,
            timestamp: new Date().toISOString(),
            status: 'read'
          }
        ]);
      } else {
        // Regular text response
        setMessages(prevMessages => [
          ...prevMessages, 
          { 
            sender: 'bot', 
            text: data.response || 'Maaf, saya tidak dapat memproses permintaan Anda saat ini. Silakan coba lagi nanti.',
            timestamp: new Date().toISOString(),
            status: 'read'
          }
        ]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Update message status to 'failed'
      setMessages(prevMessages => 
        prevMessages.map(msg => msg === userMessage ? { ...msg, status: 'failed' } : msg)
      );
      
      setMessages(prevMessages => [
        ...prevMessages, 
        { 
          sender: 'bot', 
          text: 'Maaf, terjadi kesalahan saat memproses pesan Anda. Silakan coba lagi nanti.',
          timestamp: new Date().toISOString(),
          status: 'read'
        }
      ]);
    } finally {
      setIsTyping(false);
      if (chatInputRef.current) chatInputRef.current.focus();
    }
  };

  // Handle sending with product
  const handleSendWithProduct = async (questionText, product) => {
    if (!product) return;
    
    const userMessage = {
      sender: 'user', 
      text: questionText,
      productCard: product,
      timestamp: new Date().toISOString(),
      status: 'sending'
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsTyping(true);
    
    // Close all panels
    setActivePanel(null);
    setActiveTab(null);
    setSelectedProduct(null);
    setSelectedOrder(null);
    
    try {
      const timestamp = new Date().toISOString();
      
      // Update message status to 'sent'
      setTimeout(() => {
        setMessages(prevMessages => 
          prevMessages.map(msg => msg === userMessage ? { ...msg, status: 'sent' } : msg)
        );
      }, 500);
      
      // Using fetch with relative URL for Vite proxy
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          input: `[Produk: ${product.nama_produk}] ${questionText}`,
          timestamp,
          userId,
          product: {
            id: product.product_id,
            name: product.nama_produk,
            category: product.kategori,
            price: product.harga,
            stock: product.stok
          }
        }),
      });
      
      // Update message status to 'read'
      setTimeout(() => {
        setMessages(prevMessages => 
          prevMessages.map(msg => msg === userMessage ? { ...msg, status: 'read' } : msg)
        );
      }, 1000);
      
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      // Bot response
      setMessages(prevMessages => [
        ...prevMessages, 
        { 
          sender: 'bot', 
          text: data.response || `Untuk produk ${product.nama_produk}, ${questionText.toLowerCase()} Ya, stok masih tersedia. Silakan melakukan pemesanan sekarang.`,
          timestamp: new Date().toISOString(),
          status: 'read'
        }
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      setMessages(prevMessages => 
        prevMessages.map(msg => msg === userMessage ? { ...msg, status: 'failed' } : msg)
      );
      
      setMessages(prevMessages => [
        ...prevMessages, 
        { 
          sender: 'bot', 
          text: 'Maaf, terjadi kesalahan saat memproses pesan Anda. Silakan coba lagi nanti.',
          timestamp: new Date().toISOString(),
          status: 'read'
        }
      ]);
    } finally {
      setIsTyping(false);
      if (chatInputRef.current) chatInputRef.current.focus();
    }
  };

  // Click handlers
  const handleSuggestionClick = suggestion => {
    setInput(suggestion);
    setTimeout(() => handleSend(), 100);
  };
  
  const handleCloseChatbox = e => {
    e?.preventDefault();
    setIsOpen(false);
  };
  
  const toggleChatbox = e => {
    e?.preventDefault();
    setIsOpen(!isOpen);
    if (!isOpen) setHasNewMessage(false);
  };
  
  const handleProductClick = product => {
    setActiveTab(null);
    setSelectedProduct(product);
    setActivePanel('answerOptions');
  };
  
  const handleOrderClick = order => {
    setActiveTab(null);
    setSelectedOrder(order);
    setActivePanel('orderOptions');
  };
  
  const handleAnswerOptionClick = option => {
    if (!selectedProduct) return;
    
    let questionText = '';
    
    switch (option.id) {
      case 'stock':
        questionText = 'Stok masih ada gk min?';
        break;
      case 'details':
        questionText = 'Detail produk dan bahan?';
        break;
      case 'size':
        questionText = 'Panduan ukuran?';
        break;
      case 'shipping':
        questionText = 'Estimasi pengiriman?';
        break;
      case 'custom':
        setInput(`Tentang ${selectedProduct.nama_produk}: `);
        setActivePanel(null);
        setSelectedProduct(null);
        if (chatInputRef.current) chatInputRef.current.focus();
        return;
      default:
        questionText = option.text;
    }
    
    handleSendWithProduct(questionText, selectedProduct);
  };
  
  const handleOrderOptionClick = option => {
    if (!selectedOrder) return;
    
    let questionText = '';
    
    switch (option.id) {
      case 'status':
        questionText = 'Update status pesanan?';
        break;
      case 'delivery':
        questionText = 'Estimasi pengiriman?';
        break;
      case 'cancel':
        questionText = 'Cara batalkan pesanan?';
        break;
      case 'return':
        questionText = 'Cara return barang?';
        break;
      case 'custom':
        setInput(`Tentang pesanan ${selectedOrder.nama_produk}: `);
        setActivePanel(null);
        setSelectedOrder(null);
        if (chatInputRef.current) chatInputRef.current.focus();
        return;
      default:
        questionText = option.text;
    }
    
    handleSendWithProduct(questionText, selectedOrder);
  };
  
  const handleTabClick = tab => {
    if (activeTab === tab && activePanel === 'tab') {
      setActivePanel(null);
      setActiveTab(null);
    } else {
      setActiveTab(tab);
      setActivePanel('tab');
    }
  };
  
  const toggleDropdownMenu = e => {
    e.preventDefault();
    e.stopPropagation();
    
    setActivePanel(activePanel === 'dropdown' ? null : 'dropdown');
    if (activePanel !== 'dropdown') setActiveTab(null);
  };

  // Fallback mock data
  const mockProduk = [
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
      stok: "8",
      "link_Gambar 1": "/images/products/jacket-black.jpg"
    }
  ];
  
  const mockPesanan = [
    {
      product_id: "TS001",
      nama_produk: "Erigo T-Shirt Skye Black",
      kategori: "T-Shirt",
      harga: 79000,
      ukuran: "L",
      stok: "Banyak barang",
      "link_Gambar 1": "/images/products/tshirt-black.jpg",
      rating: 4.8,
      status: "Dalam pengiriman"
    },
    {
      product_id: "DP001",
      nama_produk: "Erigo Denim Pants Edwin Medium Blue",
      kategori: "Celana",
      harga: 239000,
      ukuran: "32",
      stok: "Banyak barang",
      "link_Gambar 1": "/images/products/denim-blue.jpg",
      rating: 4.5,
      status: "Dikemas"
    },
    {
      product_id: "TS002",
      nama_produk: "Erigo T-Shirt Selkie Olive",
      kategori: "T-Shirt",
      harga: 79000,
      ukuran: "M",
      stok: "Banyak barang",
      "link_Gambar 1": "/images/products/tshirt-olive.jpg",
      rating: 4.7,
      status: "Selesai"
    }
  ];

  // Filter products and orders based on search query
  const filteredProduk = produk.filter(item => {
    const searchLower = searchQuery.toLowerCase();
    const namaProduk = item.nama_produk ? String(item.nama_produk).toLowerCase() : '';
    const kategori = item.kategori ? String(item.kategori).toLowerCase() : '';
    const productId = item.product_id !== undefined && item.product_id !== null 
      ? String(item.product_id).toLowerCase() 
      : '';
    
    return namaProduk.includes(searchLower) || 
          kategori.includes(searchLower) || 
          productId.includes(searchLower);
  });

  const filteredPesanan = pesanan.filter(item => {
    const searchLower = searchQuery.toLowerCase();
    const namaProduk = item.nama_produk ? String(item.nama_produk).toLowerCase() : '';
    const status = item.status ? String(item.status).toLowerCase() : '';
    const productId = item.product_id !== undefined && item.product_id !== null
      ? String(item.product_id).toLowerCase()
      : '';
    
    return namaProduk.includes(searchLower) || 
          status.includes(searchLower) || 
          productId.includes(searchLower);
  });

  // Effect hooks
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
  
  useEffect(() => {
    const handleOpenChatbox = () => {
      setIsOpen(true);
      setHasNewMessage(false);
    };
    
    window.addEventListener('open-chatbox', handleOpenChatbox);
    
    return () => {
      window.removeEventListener('open-chatbox', handleOpenChatbox);
    };
  }, []);
  
  useEffect(() => {
    // Handler for carousel AI query
    const handleCarouselAIQuery = (event) => {
      if (event.detail && event.detail.query) {
        // Set input value to the query
        setInput(event.detail.query);
        
        // Add a class to visually indicate the query came from carousel
        if (chatInputRef.current) {
          chatInputRef.current.classList.add('auto-filled');
          
          // Auto-send the message after a brief delay to simulate typing
          setTimeout(() => {
            handleSend(null, event.detail.query);
            chatInputRef.current.classList.remove('auto-filled');
          }, 1000);
        }
      }
    };
    
    window.addEventListener('chatbot-ai-query', handleCarouselAIQuery);
    
    return () => {
      window.removeEventListener('chatbot-ai-query', handleCarouselAIQuery);
    };
  }, []);
  
  useEffect(() => {
    if (location.pathname === '/chat' || location.hash === '#chat') {
      setIsOpen(true);
    }
    
    // Check if there's a carousel parameter in the URL
    if (isOpen && location.search.includes('source=carousel')) {
      // Add a highlight class to the chatbox container for visual emphasis
      const chatboxContainer = document.querySelector('.chatbox-container');
      if (chatboxContainer) {
        chatboxContainer.classList.add('from-carousel');
        chatboxContainer.classList.add('highlight');
        
        // Remove the highlight after animation completes
        setTimeout(() => {
          chatboxContainer.classList.remove('highlight');
        }, 2000);
      }
    }
  }, [location, isOpen]);
  
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);
  
  useEffect(() => {
    const fetchProduk = async () => {
      if (activeTab === 'produk' && activePanel === 'tab') {
        setIsLoadingProduk(true);
        setError(null);
        try {
          // Updated to use Vite proxy - relative URL
          const res = await axios.get('/api/produk/rekomendasi?limit=100');
          const produkTersedia = res.data.filter(item => parseInt(item.stok) > 0);
          setProduk(produkTersedia);
        } catch (err) {
          console.error('Gagal fetch produk', err);
          setError('Gagal memuat produk. Silakan coba lagi nanti.');
          setProduk(mockProduk);
        } finally {
          setIsLoadingProduk(false);
        }
      }
    };
    
    fetchProduk();
  }, [activeTab, activePanel]);
  
  useEffect(() => {
    const fetchPesanan = async () => {
      if (activeTab === 'pesanan' && activePanel === 'tab') {
        setIsLoadingPesanan(true);
        setError(null);
        try {
          // Mock API call with delay
          await new Promise(resolve => setTimeout(resolve, 500));
          setPesanan(mockPesanan);
        } catch (err) {
          console.error('Gagal fetch pesanan', err);
          setError('Gagal memuat pesanan. Silakan coba lagi nanti.');
          setPesanan(mockPesanan);
        } finally {
          setIsLoadingPesanan(false);
        }
      }
    };
    
    fetchPesanan();
  }, [activeTab, activePanel]);
  
  useEffect(() => {
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target) && 
          !event.target.closest('.tab-button') && 
          !event.target.closest('.attachment-button')) {
        setActivePanel(null);
        setActiveTab(null);
      }
    }
    
    if (activePanel) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activePanel]);
  
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    
    if (scrollLocked && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    
    if (!scrollLocked && messages.length > 0 && messages[messages.length - 1].sender === 'bot') {
      setHasNewMessage(true);
    }
  }, [messages, scrollLocked]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (activePanel) {
          e.preventDefault();
          setActivePanel(null);
          setActiveTab(null);
          if (chatInputRef.current) {
            chatInputRef.current.focus();
          }
        } else if (isOpen) {
          handleCloseChatbox(e);
        }
      } else if (e.shiftKey && e.key === 'Enter' && isOpen) {
        e.preventDefault();
        setInput((prev) => prev + '\n');
      } else if (e.key === 'Enter' && !e.shiftKey && isOpen && document.activeElement === chatInputRef.current) {
        e.preventDefault();
        handleSend();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activePanel]);

  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === 'bot') {
        setHasNewMessage(true);
      }
    }
  }, [messages, isOpen]);

  // Render toggle button (not on mobile)
  const renderChatboxToggle = () => {
    if (isMobile) return null;
    
    return (
      <Link to="#chat" className="chatbox-toggle" onClick={toggleChatbox}>
        <MessageCircle size={24} />
        {hasNewMessage && <div className="chatbox-notification-badge">1</div>}
      </Link>
    );
  };

  // Only render the chatbox if it's open
  if (!isOpen) {
    return renderChatboxToggle();
  }

  return (
    <>
      {renderChatboxToggle()}
      
      <div className={`chatbox-container ${isMobile ? 'mobile-view' : ''}`}>
        <div className="chatbox-header">
          <span>Chat dengan Asisten</span>
          <span className="chatbox-close" onClick={handleCloseChatbox}>✕</span>
        </div>
        
        <div className="chatbox-messages" ref={messagesContainerRef}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-message-container ${msg.sender}`}>
              {/* Product card in chat if available */}
              {msg.productCard && (
                <div className={`chat-product-card-container ${msg.sender}`}>
                  <ProductCardInChat product={msg.productCard} />
                </div>
              )}
              
              {/* Message text */}
              {msg.text && (
                <div className={`chat-msg ${msg.sender}`}>
                  <div dangerouslySetInnerHTML={{ __html: formatText(msg.text) }} />
                  
                  {/* Timestamp */}
                  {msg.timestamp && (
                    <div className="message-timestamp">
                      {formatTimestamp(msg.timestamp)}
                    </div>
                  )}
                </div>
              )}
              
              {/* Message status indicator */}
              {msg.sender === 'user' && msg.status && (
                <div className="message-status">
                  {msg.status === 'sending' && (
                    <div className="status-sending" title="Mengirim...">
                      <div className="sending-dot"></div>
                    </div>
                  )}
                  {msg.status === 'sent' && (
                    <div className="status-sent" title="Terkirim">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                  )}
                  {msg.status === 'read' && (
                    <div className="status-read" title="Terbaca">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                  )}
                  {msg.status === 'failed' && (
                    <div 
                      className="status-failed" 
                      title="Gagal terkirim. Klik untuk mencoba lagi."
                      onClick={() => retryMessage(msg)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                    </div>
                  )}
                </div>
              )}
              
              {/* Product recommendations */}
              {msg.recommendationProducts && (
                <div className="chat-product-recommendation">
                  <ProductRecommendation 
                    products={msg.recommendationProducts}
                    title=""
                    onAskClick={handleProductClick}
                  />
                </div>
              )}
              
              {/* Quick replies */}
              {msg.sender === 'bot' && msg.showQuickReplies && (
                <div className="quick-replies">
                  {QUICK_REPLIES.map((reply, replyIdx) => (
                    <button 
                      key={replyIdx}
                      className="quick-reply-button"
                      onClick={() => handleSuggestionClick(reply)}
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Orders display */}
              {msg.orders && (
                <div className="recommendation-cards-container">
                  {msg.orders.map((order, orderIdx) => (
                    <div key={orderIdx} className="order-card-message">
                      <div className="order-card-info">
                        <div className="order-card-name">{order.name}</div>
                        <div className="order-card-details">
                          <div className="order-card-detail-item">
                            <span className="order-card-label">Status:</span>
                            <span className="order-card-value order-status">{order.status}</span>
                          </div>
                          <div className="order-card-detail-item">
                            <span className="order-card-label">Harga:</span>
                            <span className="order-card-value">{order.formattedPrice}</span>
                          </div>
                          <div className="order-card-detail-item">
                            <span className="order-card-label">Ukuran:</span>
                            <span className="order-card-value">{order.size}</span>
                          </div>
                          <div className="order-card-detail-item">
                            <span className="order-card-label">Kategori:</span>
                            <span className="order-card-value">{order.category}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="chat-message-container bot">
              <div className="chat-msg bot typing">
                <div className="typing-loader">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          {/* Scroll to bottom button */}
          {!scrollLocked && hasNewMessage && (
            <button 
              className="scroll-to-bottom-button" 
              onClick={scrollToBottom}
              title="Scroll ke pesan terbaru"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
              <span>Pesan baru</span>
            </button>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Copy notification */}
        {copyNotification && (
          <div className="copy-notification">
            Teks disalin ke clipboard!
          </div>
        )}
        
        {/* PANELS */}
        {activePanel && (
          <div className={`chatbox-panel ${activePanel}-panel`} ref={panelRef}>
            {/* Answer Options Panel for Products */}
            {activePanel === 'answerOptions' && selectedProduct && (
              <>
                <div className="panel-header">
                  <h3 className="panel-title">Tanya tentang {selectedProduct.nama_produk}</h3>
                  <button className="panel-close" onClick={() => setActivePanel(null)}>
                    <X size={18} />
                  </button>
                </div>
                <div className="answer-options-list">
                  {ANSWER_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      className="answer-option-button"
                      onClick={() => handleAnswerOptionClick(option)}
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
              </>
            )}
            
            {/* Answer Options Panel for Orders */}
            {activePanel === 'orderOptions' && selectedOrder && (
              <>
                <div className="panel-header">
                  <h3 className="panel-title">Tanya tentang pesanan {selectedOrder.nama_produk}</h3>
                  <button className="panel-close" onClick={() => setActivePanel(null)}>
                    <X size={18} />
                  </button>
                </div>
                <div className="answer-options-list">
                  {ORDER_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      className="answer-option-button"
                      onClick={() => handleOrderOptionClick(option)}
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
              </>
            )}
            
            {/* Dropdown Menu */}
            {activePanel === 'dropdown' && (
              <div className="dropdown-menu-horizontal">
                <div className="dropdown-menu-item-horizontal" onClick={() => handleTabClick('camera')}>
                  <div className="dropdown-menu-icon">
                    <Camera size={20} />
                  </div>
                  <span>Kamera</span>
                </div>
                <div className="dropdown-menu-item-horizontal" onClick={() => handleTabClick('gambar')}>
                  <div className="dropdown-menu-icon">
                    <Image size={20} />
                  </div>
                  <span>Galeri</span>
                </div>
                <div className="dropdown-menu-item-horizontal" onClick={() => handleTabClick('produk')}>
                  <div className="dropdown-menu-icon">
                    <ShoppingBag size={20} />
                  </div>
                  <span>Produk</span>
                </div>
                <div className="dropdown-menu-item-horizontal" onClick={() => handleTabClick('pesanan')}>
                  <div className="dropdown-menu-icon">
                    <Package size={20} />
                  </div>
                  <span>Pesanan</span>
                </div>
              </div>
            )}
            
            {/* Tab Panel */}
            {activePanel === 'tab' && (
              <>
                <div className="panel-header">
                  <h3 className="panel-title">
                    {activeTab === 'camera' && 'Kamera'}
                    {activeTab === 'gambar' && 'Galeri'}
                    {activeTab === 'produk' && 'Produk'}
                    {activeTab === 'pesanan' && 'Pesanan'}
                  </h3>
                  
                  {(activeTab === 'produk' || activeTab === 'pesanan') && (
                    <div className="search-container">
                      <Search size={16} className="search-icon" />
                      <input
                        type="text"
                        className="search-input"
                        placeholder={`Cari ${activeTab === 'produk' ? 'produk' : 'pesanan'}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  )}
                  
                  <button className="panel-close" onClick={() => setActivePanel(null)}>
                    <X size={18} />
                  </button>
                </div>
                
                {/* Tab Contents */}
                {activeTab === 'camera' && (
                  <div className="camera-placeholder">
                    <Camera size={48} />
                    <p>Fitur kamera akan segera hadir</p>
                  </div>
                )}
                
                {activeTab === 'gambar' && (
                  <div className="gallery-placeholder">
                    <Image size={48} />
                    <p>Fitur galeri akan segera hadir</p>
                  </div>
                )}
                
                {activeTab === 'produk' && (
                  <div className="tab-panel-content">
                    {isLoadingProduk ? (
                      <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p className="loading-text">Memuat produk...</p>
                      </div>
                    ) : error ? (
                      <div className="error-container">
                        <p className="error-text">{error}</p>
                      </div>
                    ) : filteredProduk.length === 0 ? (
                      <div className="empty-results">
                        <p>Tidak ada produk yang sesuai dengan pencarian Anda.</p>
                      </div>
                    ) : (
                      <div className="product-tab-content">
                        <ProductRecommendation 
                          products={filteredProduk.slice(0, 10)}
                          title=""
                          onAskClick={handleProductClick}
                        />
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'pesanan' && (
                  <div className="tab-panel-content">
                    {isLoadingPesanan ? (
                      <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p className="loading-text">Memuat pesanan...</p>
                      </div>
                    ) : error ? (
                      <div className="error-container">
                        <p className="error-text">{error}</p>
                      </div>
                    ) : filteredPesanan.length === 0 ? (
                      <div className="empty-results">
                        <p>Tidak ada pesanan yang sesuai dengan pencarian Anda.</p>
                      </div>
                    ) : (
                      <div className="order-list">
                        {filteredPesanan.map((order, idx) => (
                          <div key={idx} className="order-card-message" onClick={() => handleOrderClick(order)}>
                            <div className="order-card-info">
                              <div className="order-card-name">{order.nama_produk}</div>
                              <div className="order-card-details">
                                <div className="order-card-detail-item">
                                  <span className="order-card-label">Status:</span>
                                  <span className="order-card-value order-status">{order.status}</span>
                                </div>
                                <div className="order-card-detail-item">
                                  <span className="order-card-label">Harga:</span>
                                  <span className="order-card-value">
                                    {new Intl.NumberFormat('id-ID', {
                                      style: 'currency',
                                      currency: 'IDR',
                                      minimumFractionDigits: 0,
                                      maximumFractionDigits: 0
                                    }).format(order.harga)}
                                  </span>
                                </div>
                                <div className="order-card-detail-item">
                                  <span className="order-card-label">Ukuran:</span>
                                  <span className="order-card-value">{order.ukuran}</span>
                                </div>
                                <div className="order-card-detail-item">
                                  <span className="order-card-label">Kategori:</span>
                                  <span className="order-card-value">{order.kategori}</span>
                                </div>
                              </div>
                              <button className="order-ask-btn">
                                Tanya
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
        
        {/* Input Area */}
        <div className="chatbox-input-container">
          <form className="chatbox-input" onSubmit={handleSend}>
            <button 
              type="button" 
              className="attachment-button"
              onClick={toggleDropdownMenu}
            >
              <Plus size={20} />
            </button>
            
            <input
              type="text"
              placeholder="Ketik pesan... "
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                } else if (e.key === 'Enter' && e.shiftKey) {
                  e.preventDefault();
                  setInput((prev) => prev + '\n');
                }
              }}
              ref={chatInputRef}
            />
            <button type="submit" className="send-button">
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Chatbox;