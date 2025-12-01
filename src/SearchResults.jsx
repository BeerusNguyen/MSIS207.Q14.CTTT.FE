import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import SavedRecipe from './SavedRecipe';

const SearchResults = ({recipeData, fetchError, searchVal}) => {
  const [displayData, setDisplayData] = useState([]);
  const [displaySearch, setDisplaySearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔍 SearchResults mounted - recipeData length:', recipeData?.length);
    
    // Priority 1: Use data from props if available
    if (recipeData && recipeData.length > 0) {
      console.log('✅ Using data from props');
      setDisplayData(recipeData);
      setDisplaySearch(searchVal || '');
      return; // Exit early - don't check sessionStorage
    }

    // Priority 2: Try to restore from sessionStorage
    const cachedData = sessionStorage.getItem('searchResults');
    const cachedSearch = sessionStorage.getItem('searchQuery');
    
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        // Convert object back to array if needed
        const dataArray = Array.isArray(parsedData) ? parsedData : Object.values(parsedData);
        console.log('📦 Restored from cache:', dataArray.length, 'recipes');
        setDisplayData(dataArray);
        setDisplaySearch(cachedSearch || 'your search');
      } catch (error) {
        console.error('❌ Error parsing cached data:', error);
        // Only redirect if there's an error AND no props data
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } else {
      // No data at all - wait a bit longer before redirecting (for initial load)
      console.log('⚠️ No data found, will redirect to home...');
      const timer = setTimeout(() => {
        // Double check - only redirect if still no data
        if (displayData.length === 0 && (!recipeData || recipeData.length === 0)) {
          console.log('🔙 Redirecting to home');
          navigate('/');
        }
      }, 3000); // Increased to 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, [recipeData, searchVal, navigate]);

  return (
    <>
      <SavedRecipe 
        savedData={displayData} 
        fetchError={fetchError} 
        who={"search"} 
        head={"Your Search Results"} 
        searchVal={displaySearch}
      />
    </>
  )
}

export default SearchResults