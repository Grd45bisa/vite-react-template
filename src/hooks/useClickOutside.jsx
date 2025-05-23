import { useEffect } from 'react';

/**
 * Custom hook to detect clicks outside of specified elements
 * 
 * @param {React.RefObject} ref - Reference to the element to monitor for outside clicks
 * @param {Function} callback - Function to call when click outside is detected
 * @param {Array<React.RefObject>} ignoredRefs - Optional array of refs that should not trigger the callback
 */
export const useClickOutside = (ref, callback, ignoredRefs = []) => {
  useEffect(() => {
    function handleClickOutside(event) {
      // Check if the clicked element is outside the main ref
      const isOutside = ref.current && !ref.current.contains(event.target);
      
      // Check if the clicked element is inside any of the ignored refs
      const isInsideIgnored = ignoredRefs.some(
        ignoredRef => ignoredRef.current && ignoredRef.current.contains(event.target)
      );
      
      // Only call the callback if the click is outside both the main ref and all ignored refs
      if (isOutside && !isInsideIgnored) {
        callback();
      }
    }

    // Add the event listener
    document.addEventListener("mousedown", handleClickOutside);
    
    // Clean up
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback, ignoredRefs]);
};

export default useClickOutside;