import React, { forwardRef } from 'react';
import { Search, Clock, AlertCircle, Tag, ShoppingBag } from 'lucide-react';

const SearchSuggestions = forwardRef(({
  showSuggestions,
  isLoadingSuggestions,
  typoCorrection,
  searchQuery,
  searchSuggestions,
  recentSearches,
  onTypoCorrectionClick,
  onSuggestionClick,
  onRecentSearchClick,
  isMobile = false
}, ref) => {
  if (!showSuggestions) return null;
  
  const containerClass = isMobile ? "mobile-search-suggestions" : "search-suggestions";
  
  return (
    <div className={containerClass} ref={ref}>
      {isLoadingSuggestions ? (
        <div className="suggestion-loading">
          <div className="suggestion-spinner"></div>
          <span>Mencari...</span>
        </div>
      ) : (
        <>
          {/* Typo correction with enhanced UI */}
          {typoCorrection && typoCorrection !== searchQuery && (
            <div className="typo-correction" onClick={onTypoCorrectionClick}>
              <AlertCircle size={16} className="typo-correction-icon" />
              <span>Mungkin maksud Anda: </span>
              <strong>{typoCorrection}</strong>
            </div>
          )}
          
          {/* Recent searches section (only if we have recent searches) */}
          {recentSearches.length > 0 && searchQuery.length <= 3 && (
            <div className="recent-searches">
              <div className="suggestion-section-title">Pencarian Terakhir</div>
              {recentSearches.map((term, index) => (
                <div 
                  key={`recent-${index}`}
                  className="recent-search-item"
                  onClick={() => onRecentSearchClick(term)}
                >
                  <Clock size={14} className="recent-search-icon" />
                  <span>{term}</span>
                </div>
              ))}
            </div>
          )}
          
          {/* Search suggestions with categorization */}
          {searchSuggestions.length > 0 && (
            <>
              <div className="suggestion-section-title">Saran Pencarian</div>
              <ul className="suggestion-list">
                {searchSuggestions.map((suggestion, index) => {
                  // Determine if this is a product name or category term
                  const isProductName = suggestion.includes(' ') && suggestion.length > 12;
                  
                  return (
                    <li 
                      key={`suggestion-${index}`}
                      onClick={() => onSuggestionClick(suggestion)}
                      className={`suggestion-item ${isProductName ? 'product-suggestion' : 'category-suggestion'}`}
                    >
                      {isProductName ? (
                        <ShoppingBag size={14} className="suggestion-icon" />
                      ) : (
                        <Tag size={14} className="suggestion-icon" />
                      )}
                      <span dangerouslySetInnerHTML={{ 
                        __html: suggestion.replace(
                          new RegExp(`(${searchQuery})`, 'gi'), 
                          '<strong>$1</strong>'
                        ) 
                      }}></span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
          
          {/* No suggestions case */}
          {searchSuggestions.length === 0 && !typoCorrection && (
            <div className="no-suggestions">
              Tidak ada saran pencarian untuk "<strong>{searchQuery}</strong>"
            </div>
          )}
        </>
      )}
    </div>
  );
});

export default SearchSuggestions;