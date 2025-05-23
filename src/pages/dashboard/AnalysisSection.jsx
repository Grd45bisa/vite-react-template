// components/dashboard/AnalysisSection.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, TrendingUp, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';
import axios from 'axios';

const AnalysisSection = ({ analysis, getPercentage, totalReviews, keywordsData }) => {
  const navigate = useNavigate();
  const [aiInsights, setAiInsights] = useState(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [error, setError] = useState(null);

  // Fungsi untuk menganalisis data
  const generateInsights = async () => {
    setIsLoadingInsights(true);
    setError(null);
    
    try {
      // Siapkan data untuk analisis
      const positivePercent = getPercentage('positive');
      const neutralPercent = getPercentage('neutral');
      const negativePercent = getPercentage('negative');
      
      // Data untuk API
      const analyzeData = {
        sentimentStats: {
          positive: positivePercent,
          neutral: neutralPercent,
          negative: negativePercent,
          totalReviews: totalReviews
        },
        keywordsData: keywordsData
      };
      
      // Panggil API Analyze
      const response = await axios.post('/api/analyze', analyzeData);
      
      // Set state dengan hasil analisis
      setAiInsights({
        ...response.data.analysis,
        generatedAt: new Date().toLocaleString('id-ID')
      });
      
    } catch (err) {
      console.error('Error mendapatkan analisis:', err);
      setError('Gagal menghasilkan analisis. Silakan coba lagi.');
      
      // Fallback ke analisis sederhana jika API gagal
      setAiInsights({
        summary: `Berdasarkan analisis ${totalReviews} ulasan, ${getPercentage('positive')}% pelanggan memberikan ulasan positif, sedangkan ${getPercentage('negative')}% memberikan ulasan negatif.`,
        trends: "Kata kunci populer menunjukkan area yang disukai dan perlu perbaikan.",
        insights: [
          "Sentimen positif dominan menunjukkan kepuasan pelanggan secara umum.",
          "Pelanggan mengapresiasi kualitas produk dan pengiriman.",
          "Beberapa keluhan terfokus pada aspek tertentu yang perlu diperbaiki."
        ],
        improvements: getPercentage('negative') > 15 ? 
          "Fokus pada perbaikan aspek-aspek yang mendapatkan ulasan negatif." : 
          "Pertahankan kualitas dan tingkatkan area dengan sentimen netral.",
        recommendations: [
          "Tingkatkan komunikasi tentang fitur produk yang mendapat pujian.",
          "Analisis lebih lanjut ulasan negatif untuk identifikasi masalah spesifik.",
          "Pantau tren sentimen secara berkala untuk evaluasi performa."
        ],
        generatedAt: new Date().toLocaleString('id-ID'),
        fallback: true
      });
    } finally {
      setIsLoadingInsights(false);
    }
  };

  // Generate insights saat komponen pertama kali dimuat
  useEffect(() => {
    if (totalReviews > 0) {
      generateInsights();
    }
  }, [totalReviews]);

  return (
    <div className="analysis-section">
      <div className="section-header">
        <h2 className="section-title">
          <Brain size={20} className="icon-vertical-align" /> 
          Analisis Sentimen
        </h2>
        <button 
          className="refresh-btn" 
          onClick={generateInsights}
          disabled={isLoadingInsights}
        >
          <RefreshCw size={16} className={isLoadingInsights ? "spinning" : ""} />
          {!isLoadingInsights ? "Refresh" : "Loading..."}
        </button>
      </div>
      
      {isLoadingInsights ? (
        <div className="analysis-loading">
          <div className="loading-dots">
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
          </div>
          <p>Menganalisis data...</p>
        </div>
      ) : error ? (
        <div className="analysis-error">
          <p>{error}</p>
          <button 
            className="retry-btn" 
            onClick={generateInsights}
          >
            Coba Lagi
          </button>
        </div>
      ) : aiInsights ? (
        <div className="analysis-content">
          {aiInsights.fallback && (
            <div className="fallback-notice">
              <AlertTriangle size={14} />
              <span>Menggunakan analisis lokal (API tidak tersedia)</span>
            </div>
          )}
          
          <div className="ai-insight">
            <TrendingUp size={18} className="insight-icon trend-icon" />
            <p className="insight-text">{aiInsights.summary}</p>
          </div>
          
          {aiInsights.trends && (
            <div className="ai-insight">
              <span className="insight-icon keyword-icon">#</span>
              <p className="insight-text">{aiInsights.trends}</p>
            </div>
          )}
          
          {aiInsights.improvements && (
            <div className="ai-insight">
              <AlertTriangle size={18} className="insight-icon alert-icon" />
              <p className="insight-text">{aiInsights.improvements}</p>
            </div>
          )}
          
          {aiInsights.insights && aiInsights.insights.length > 0 && (
            <div className="ai-insights-list">
              <h4>Wawasan Utama:</h4>
              <ul>
                {aiInsights.insights.map((insight, idx) => (
                  <li key={idx}>
                    <ArrowRight size={14} className="arrow-icon" />
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {aiInsights.recommendations && aiInsights.recommendations.length > 0 && (
            <div className="ai-recommendations">
              <h4>Rekomendasi:</h4>
              <ul>
                {aiInsights.recommendations.map((rec, idx) => (
                  <li key={idx}>
                    <ArrowRight size={14} className="arrow-icon" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="ai-generated-info">
            <p className="generated-time">Analisis dibuat pada: {aiInsights.generatedAt}</p>
            <button className="analysis-btn" onClick={() => navigate('/analisis')}>
              Analisis Mendalam
            </button>
          </div>
        </div>
      ) : (
        <div className="analysis-content">
          <p className="analysis-text">
            {analysis.recommendation || `Berdasarkan analisis sentimen, sebagian besar pelanggan puas dengan produk (${getPercentage('positive')}%). Ulasan negatif (${getPercentage('negative')}%) perlu ditinjau lebih lanjut.`}
          </p>
          <div className="ai-generated-info">
            <button className="analysis-btn" 
          onClick={generateInsights}
          disabled={isLoadingInsights}>
              Analisis Mendalam
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisSection;