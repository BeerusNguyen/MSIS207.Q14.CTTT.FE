import React from 'react'
import './index.css';
import { useNavigate } from 'react-router-dom';
import getRecipe from './api/fetchRecipe';
import { useModal } from './context/ModalContext';

const Main = ({searchVal,setSearchVal,setrecipeData,setFetchError}) => {
    const navigate = useNavigate();
    const { showWarning, showError } = useModal();
    
  const searchBtn = async() => {
      console.log('🔎 Searching for:', searchVal);
      
      if (!searchVal.trim()) {
        showWarning('Please enter a dish name to search!', 'No keyword entered');
        return;
      }
      
      try {
        console.log('📡 Calling getRecipe API...');
        const data = await getRecipe(searchVal);
        console.log('📊 Fetched recipes:', data);
        console.log('📊 Recipes count:', data?.length);
        
        if (data && Array.isArray(data) && data.length > 0) {
          console.log('✅ Valid data received, setting state...');
          // Set data first
          setrecipeData(data);
          setFetchError('');
          
          // Save to sessionStorage for persistence on refresh
          const dataMap = {};
          data.forEach((recipe, index) => {
            dataMap[index] = recipe;
          });
          sessionStorage.setItem('searchResults', JSON.stringify(dataMap));
          sessionStorage.setItem('searchQuery', searchVal);
          
          console.log('✅ Data saved, navigating to results...');
          
          // Navigate AFTER data is set
          setTimeout(() => {
            navigate('/results');
          }, 100);
        } else {
          console.log('⚠️ No data or empty array received');
          showWarning(`No recipes found for "${searchVal}". Try another keyword!`, 'Not found');
        }
        
      } catch (error) {
        console.error('❌ Search error:', error);
        console.error('❌ Error details:', error.message, error.stack);
        setFetchError('Failed to fetch recipe data. Please try again.');
        showError('Search error. Please try again!', 'Error');
      }
    }
    
  return (
    <main>
          <div className='main-left'>
            <h1 className='slogan'>Discover <span className='head-letter'>Flavor</span>,<br /> Uncover <br />Nutrition <br /></h1>
            <div className='search'>
                    <input 
                        type="text" 
                        className='search-recipe-input'
                        value={searchVal}
                        placeholder='Search for Recipes'
                        onChange={(e) => setSearchVal(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            searchBtn();
                          }
                        }}/>
                    <button className='browse-btn' onClick={searchBtn}>Browse</button>
            </div>
          </div>

          <div className='main-right'>
            <img src={`${process.env.PUBLIC_URL}/food-background-food-concept-with-various-tasty-fresh-ingredients-cooking-italian-food-ingredients-view-from-with-copy-space.jpg`} className='header-pic' alt="" />
          </div>
    </main>
  )
}

export default Main