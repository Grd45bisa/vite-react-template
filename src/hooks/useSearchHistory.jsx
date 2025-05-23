import { useState, useEffect } from 'react';

/**
 * Custom hook to manage search history with localStorage
 * @param {number} maxItems - Maximum number of searches to store
 * @returns {Object} - Methods and data for managing search history
 */
export const useSearchHistory = (maxItems = 5) => {
  const [recentSearches, setRecentSearches] = useState([]);

  // Load saved searches on mount
  useEffect(() => {
    try {
      const savedSearches = localStorage.getItem('recentSearches');
      if (savedSearches) {
        setRecentSearches(JSON.parse(savedSearches).slice(0, maxItems));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
      // Reset if corrupted
      localStorage.removeItem('recentSearches');
    }
  }, [maxItems]);

  /**
   * Add a new search term to history
   * @param {string} term - Search term to add
   */
  const addToRecentSearches = (term) => {
    try {
      if (!term || term.trim() === '') return;
      
      const trimmedTerm = term.trim();
      
      // Get existing searches
      const existingSearches = [...recentSearches];
      
      // Remove the term if it already exists
      const filteredSearches = existingSearches.filter(
        search => search.toLowerCase() !== trimmedTerm.toLowerCase()
      );
      
      // Add the new term at the beginning
      const updatedSearches = [trimmedTerm, ...filteredSearches].slice(0, maxItems);
      
      // Save to localStorage
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
      
      // Update state
      setRecentSearches(updatedSearches);
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  /**
   * Clear all search history
   */
  const clearSearchHistory = () => {
    localStorage.removeItem('recentSearches');
    setRecentSearches([]);
  };

  /**
   * Remove a specific search term
   * @param {string} term - Term to remove
   */
  const removeSearchTerm = (term) => {
    try {
      const filteredSearches = recentSearches.filter(
        search => search.toLowerCase() !== term.toLowerCase()
      );
      
      localStorage.setItem('recentSearches', JSON.stringify(filteredSearches));
      setRecentSearches(filteredSearches);
    } catch (error) {
      console.error('Error removing search term:', error);
    }
  };

  return {
    recentSearches,
    addToRecentSearches,
    clearSearchHistory,
    removeSearchTerm
  };
};

export default useSearchHistory;