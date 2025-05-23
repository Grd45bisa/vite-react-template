import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ChartContainer = ({ sentimentDistribution, keywordsData, hasData }) => {
  // Default data untuk charts jika data kosong
  const defaultKeywordsData = [
    { name: 'Tidak ada data', value: 0, sentiment: 'neutral', fill: '#BBAA88' }
  ];

  return (
    <div className="charts-container">
      <div className="chart-card">
        <h2 className="chart-title">Distribusi Sentimen</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={sentimentDistribution}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
            >
              {sentimentDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
        {!hasData(sentimentDistribution) && (
          <div className="ds-no-data-message">Tidak ada data distribusi sentimen tersedia</div>
        )}
      </div>

      <div className="chart-card">
        <h2 className="chart-title">Kata Kunci Populer</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={hasData(keywordsData) ? keywordsData : defaultKeywordsData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              cursor={{ fill: 'rgba(139, 90, 43, 0.1)' }}
              formatter={(value, name, props) => {
                if (!props || !props.payload || value === 0) return ['Tidak ada data', ''];
                return [`${value} ulasan`, props.payload.sentiment === 'positive' ? 'Positif' : 'Negatif'];
              }}
              labelFormatter={(value) => `Kata: ${value}`}
            />
            {hasData(keywordsData) && (
              <Legend
                content={() => (
                  <div className="ds-keywords-legend" style={{ textAlign: 'center', marginTop: '10px' }}>
                    <span className="ds-legend-item" style={{ display: 'inline-block', marginRight: '20px' }}>
                      <span style={{ 
                        display: 'inline-block', 
                        width: '12px', 
                        height: '12px', 
                        backgroundColor: 'var(--color-primary)', 
                        marginRight: '5px',
                        borderRadius: '2px'
                      }}></span>
                      <span style={{ color: 'var(--color-gray-700)', fontSize: '0.875rem' }}>Kata Kunci Positif</span>
                    </span>
                    <span className="ds-legend-item" style={{ display: 'inline-block' }}>
                      <span style={{ 
                        display: 'inline-block', 
                        width: '12px', 
                        height: '12px', 
                        backgroundColor: 'var(--color-accent)', 
                        marginRight: '5px',
                        borderRadius: '2px'
                      }}></span>
                      <span style={{ color: 'var(--color-gray-700)', fontSize: '0.875rem' }}>Kata Kunci Negatif</span>
                    </span>
                  </div>
                )}
              />
            )}
            <Bar 
              dataKey="value" 
              radius={[4, 4, 0, 0]}
              name="Frekuensi Kata Kunci"
            >
              {(hasData(keywordsData) ? keywordsData : defaultKeywordsData).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.sentiment === 'positive' ? '#8B5A2B' : entry.sentiment === 'negative' ? '#A0522D' : '#BBAA88'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {!hasData(keywordsData) && (
          <div className="ds-no-data-message">Tidak ada data kata kunci tersedia</div>
        )}
      </div>
    </div>
  );
};

export default ChartContainer;