// components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Shirt, MessageCircle } from 'lucide-react';
import axios from 'axios';
import '../components/style/dashboard/Dashboard.css';
import FashionLoader from '../components/FashionLoader'; 

// Import the new components
import Sidebar from './dashboard/Sidebar';
import SummaryCard from './dashboard/SummaryCard';
import ChartContainer from './dashboard/ChartContainer';
import ReviewSection from './dashboard/ReviewSection';
import AnalysisSection from './dashboard/AnalysisSection';

const Dashboard = () => {
  const [activeSidebarItem, setActiveSidebarItem] = useState('Dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    totalReviews: 0,
    sentimentDistribution: [],
    keywordsData: [],
    recentReviews: [],
    analysis: {
      recommendation: "Memuat rekomendasi analisis..."
    }
  });
  
  // Fungsi untuk mengacak array
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Fetch data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Use Promise.allSettled to fetch data in parallel and handle errors better
        const [
          productsResponse, 
          sentimentResponse, 
          reviewsResponse, 
          keywordsResponse, 
          analysisResponse,
          allProductsResponse
        ] = await Promise.allSettled([
          // Fetch total products count - Updated to use Vite proxy
          axios.get('/api/sentimen/produk-count').catch(() => {
            // Fallback to product count
            return axios.get('/api/produk/count');
          }),
          
          // Fetch sentiment stats - Updated to use Vite proxy
          axios.get('/api/sentimen/stats'),
          
          // Fetch recent reviews (get more to allow for random selection) - Updated to use Vite proxy
          axios.get('/api/sentimen/recent'),
          
          // Fetch top keywords by sentiment - Updated to use Vite proxy
          axios.get('/api/sentimen/top-keywords'),
          
          // Fetch analysis recommendation - Updated to use Vite proxy
          axios.get('/api/sentimen/analysis'),
          
          // Fetch all products for names - Updated to use Vite proxy
          axios.get('/api/produk')
        ]);
        
        // Prepare data from responses, handling potential failures
        const products = productsResponse.status === 'fulfilled' ? productsResponse.value.data.count : 0;
        
        const sentimentData = sentimentResponse.status === 'fulfilled' 
          ? sentimentResponse.value.data 
          : { totalUlasan: 0, sentimentDistribution: [] };
          
        const reviews = reviewsResponse.status === 'fulfilled' 
          ? reviewsResponse.value.data 
          : [];
          
        const keywords = keywordsResponse.status === 'fulfilled' 
          ? keywordsResponse.value.data 
          : [];
          
        const analysis = analysisResponse.status === 'fulfilled' 
          ? analysisResponse.value.data 
          : { recommendation: "Data analisis belum tersedia" };
          
        const allProducts = allProductsResponse.status === 'fulfilled'
          ? allProductsResponse.value.data
          : [];
          
        // Create product ID to name mapping
        const productMap = {};
        if (Array.isArray(allProducts)) {
          allProducts.forEach(product => {
            productMap[product.product_id] = product.nama_produk;
          });
        } else if (allProducts && allProducts.data && Array.isArray(allProducts.data)) {
          allProducts.data.forEach(product => {
            productMap[product.product_id] = product.nama_produk;
          });
        }
        
        // Calculate sentiment percentages directly from label data
        const totalReviews = sentimentData.totalUlasan || 0;
        let positiveCount = 0;
        let negativeCount = 0;
        let neutralCount = 0;
        
        if (sentimentData.sentimentDistribution && sentimentData.sentimentDistribution.length > 0) {
          sentimentData.sentimentDistribution.forEach(item => {
            if (item.name === 'positive') {
              positiveCount = item.count || 0;
            } else if (item.name === 'negative') {
              negativeCount = item.count || 0;
            } else if (item.name === 'neutral') {
              neutralCount = item.count || 0;
            }
          });
        }
        
        // Calculate percentages
        const positivePercent = totalReviews > 0 ? parseFloat(((positiveCount / totalReviews) * 100).toFixed(1)) : 0;
        const negativePercent = totalReviews > 0 ? parseFloat(((negativeCount / totalReviews) * 100).toFixed(1)) : 0;
        const neutralPercent = totalReviews > 0 ? parseFloat(((neutralCount / totalReviews) * 100).toFixed(1)) : 0;
        
        // Create consistent sentiment distribution with distinct colors
        const formattedSentimentDistribution = [
          { name: 'Positive', value: positivePercent, color: '#8B5A2B' },  // Coffee brown
          { name: 'Neutral', value: neutralPercent, color: '#BBAA88' },    // Distinctly lighter tan
          { name: 'Negative', value: negativePercent, color: '#A0522D' }   // Sienna
        ];
        
        // Process and randomize reviews
        const processedReviews = reviews.map(review => {
          // Get product name from the map
          const productName = productMap[review.produkId] || 'Produk';
          
          return {
            id: review.id,
            produkId: review.produkId,
            productName: productName,
            text: review.text || '',
            customer: review.customer || 'Pelanggan',
            sentiment: review.sentiment || 'neutral',
            rating: review.ratingUlasan || 0  // Use ratingUlasan from the sentimen data
          };
        });
        
        // Shuffle and take 3 random reviews
        const shuffledReviews = shuffleArray([...processedReviews]);
        const randomReviews = shuffledReviews.slice(0, Math.min(3, shuffledReviews.length));
        
        // Combined and sorted keywords by frequency regardless of sentiment - limit to 7
        const sortedKeywords = [...keywords].sort((a, b) => b.value - a.value).slice(0, 7);
        
        // Set dashboard data with handled responses
        setDashboardData({
          totalProducts: products || 0,
          totalReviews: totalReviews,
          sentimentDistribution: formattedSentimentDistribution,
          // Format keywords with sentiment-based properties but sorted by count
          keywordsData: sortedKeywords.map(keyword => ({
            name: keyword.name ? (keyword.name.charAt(0).toUpperCase() + keyword.name.slice(1)) : '',
            value: keyword.value || 0,
            sentiment: keyword.sentiment || 'positive',
            fill: keyword.sentiment === 'positive' ? '#8B5A2B' : '#A0522D'
          })),
          recentReviews: randomReviews,
          analysis: analysis,
          // Store raw percentages for direct access
          sentimentPercentages: {
            positive: positivePercent,
            neutral: neutralPercent,
            negative: negativePercent
          }
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Gagal memuat data dashboard. Silakan coba lagi nanti.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Get percentages for summary cards - directly from calculated percentages
  const getPercentage = (sentiment) => {
    if (!dashboardData.sentimentPercentages) return 0;
    return dashboardData.sentimentPercentages[sentiment.toLowerCase()] || 0;
  };
  
  // Function to check if data arrays have content
  const hasData = (dataArray) => {
    return Array.isArray(dataArray) && dataArray.length > 0;
  };

  // Use the new FashionLoader component for loading state
  if (loading) {
    return <FashionLoader />;
  }

  if (error) {
    return <div className="ds-error">{error}</div>;
  }

  return (
    <div className="dashboard">
      {/* Sidebar Component */}
      <Sidebar 
        activeSidebarItem={activeSidebarItem} 
        setActiveSidebarItem={setActiveSidebarItem} 
      />

      {/* Main Content */}
      <div className="main-content">
        <header className="header">
          <h1>Dashboard Analisis Sentimen</h1>
          <div className="header-tools">
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="content">
          {/* Summary Cards */}
          <div className="summary-cards">
            <SummaryCard 
              icon={<Shirt size={24} />}
              title="Total Produk"
              value={dashboardData.totalProducts.toLocaleString()}
            />
            <SummaryCard 
              icon={<MessageCircle size={24} />}
              title="Total Ulasan"
              value={dashboardData.totalReviews.toLocaleString()}
            />
            <SummaryCard 
              icon={<div className="positive-icon">😊</div>}
              title="Sentimen Positif"
              value={`${getPercentage('positive')}%`}
            />
            <SummaryCard 
              icon={<div className="neutral-icon">😐</div>}
              title="Sentimen Netral"
              value={`${getPercentage('neutral')}%`}
            />
            <SummaryCard 
              icon={<div className="negative-icon">😞</div>}
              title="Sentimen Negatif"
              value={`${getPercentage('negative')}%`}
            />
          </div>

          {/* Charts Section */}
          <ChartContainer 
            sentimentDistribution={dashboardData.sentimentDistribution}
            keywordsData={dashboardData.keywordsData}
            hasData={hasData}
          />

          {/* Bottom Section */}
          <div className="bottom-section">
            {/* Reviews Section */}
            <ReviewSection 
              recentReviews={dashboardData.recentReviews}
              hasData={hasData}
            />

            {/* Analysis Summary */}
            <AnalysisSection 
              analysis={dashboardData.analysis}
              getPercentage={getPercentage}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;