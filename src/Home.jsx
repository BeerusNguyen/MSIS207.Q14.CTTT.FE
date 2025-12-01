import React from 'react'
import './index.css';
import Header from './Header';
import { Link, useNavigate } from 'react-router-dom';
import getRecipe from './api/fetchRecipe';
import { useModal } from './context/ModalContext';
import { MdRestaurantMenu, MdCalendarMonth, MdBookmark, MdSearch, MdShoppingCart } from 'react-icons/md';

const Home = ({searchVal,setSearchVal,recipeData,setrecipeData,fetchError,setFetchError}) => {
  const navigate = useNavigate();
  const { showWarning, showError } = useModal();

  // Search function that accepts optional keyword parameter
  const searchBtn = async(keyword = null) => {
    // Only use keyword if it's a valid string (not an event object)
    const searchTerm = (typeof keyword === 'string') ? keyword : searchVal;
    
    if (!searchTerm || !searchTerm.trim()) {
      showWarning('Please enter a dish name to search!', 'No keyword entered');
      return;
    }
    
    // Update search value if keyword was provided
    if (typeof keyword === 'string') {
      setSearchVal(keyword);
    }
    
    try {
      const data = await getRecipe(searchTerm);
      
      if (data && Array.isArray(data) && data.length > 0) {
        setrecipeData(data);
        setFetchError('');
        
        const dataMap = {};
        data.forEach((recipe, index) => {
          dataMap[index] = recipe;
        });
        sessionStorage.setItem('searchResults', JSON.stringify(dataMap));
        sessionStorage.setItem('searchQuery', searchTerm);
        
        setTimeout(() => {
          navigate('/results');
        }, 100);
      } else {
        showWarning(`No recipes found for "${searchTerm}". Try another keyword!`, 'Not found');
      }
      
    } catch (error) {
      console.error('Search error:', error);
      
      // Check for API quota exceeded
      if (error.message === 'API_QUOTA_EXCEEDED') {
        setFetchError('API daily limit exceeded. Please try again tomorrow.');
        showError('API daily limit exceeded (150 requests/day). Please try again tomorrow or use a different API key.', 'API Quota Exceeded');
        return;
      }
      
      setFetchError('Failed to fetch recipe data. Please try again.');
      showError('Search error. Please try again!', 'Error');
    }
  }
  
  // Handle trending keyword click
  const handleTrendingClick = (keyword) => {
    searchBtn(keyword);
  }
  
  return (
    <div className='home-layout'>
      {/* Sidebar */}
      <aside className='sidebar'>
        <div className='sidebar-logo'>
          <img src={`${process.env.PUBLIC_URL}/Gemini_Generated_Image_5vl4c25vl4c25vl4.png`} alt="Logo" />
          <h2>Recipe Finder</h2>
        </div>

        <nav className='sidebar-nav'>
          <Link to="/discover" className='sidebar-link'>
            <MdRestaurantMenu className='sidebar-icon' />
            <span>Discover Recipes</span>
          </Link>
          
          <Link to="/mealplan" className='sidebar-link'>
            <MdCalendarMonth className='sidebar-icon' />
            <span>Meal Planner</span>
          </Link>
          
          <Link to="/saved" className='sidebar-link'>
            <MdBookmark className='sidebar-icon' />
            <span>Saved Recipes</span>
          </Link>

          <Link to="/shopping-list" className='sidebar-link'>
            <MdShoppingCart className='sidebar-icon' />
            <span>Shopping List</span>
          </Link>
        </nav>

        <div className='sidebar-info'>
          <p>Discover thousands of delicious recipes and plan your meals for the whole week!</p>
        </div>
      </aside>

      {/* Main Content */}
      <div className='home-main'>
        <Header />
        
        <div className='home-content'>
          {/* Logo Section */}
          <div className='home-brand'>
            <img src={`${process.env.PUBLIC_URL}/Gemini_Generated_Image_5vl4c25vl4c25vl4.png`} alt="Logo" className='home-logo' />
            <h1 className='home-title'>Recipe Finder</h1>
          </div>

          {/* Search Section */}
          <div className='home-search'>
            <div className='search-box'>
              <MdSearch className='search-icon' />
              <input 
                type="text" 
                className='home-search-input'
                value={searchVal}
                placeholder='Search for recipes...'
                onChange={(e) => setSearchVal(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    searchBtn();
                  }
                }}
              />
            </div>
            <button className='home-search-btn' onClick={searchBtn}>
              Search
            </button>
          </div>

          {/* Trending Section */}
          <div className='trending-section'>
            <div className='trending-header'>
              <h3>Trending Keywords</h3>
              <span className='trending-time'>Recently updated</span>
            </div>
            <div className='trending-grid'>
              <div className='trending-item' onClick={() => handleTrendingClick('chicken')}>
                <img src="https://www.themealdb.com/images/media/meals/1529446352.jpg" alt="Chicken" />
                <span>Chicken</span>
              </div>
              <div className='trending-item' onClick={() => handleTrendingClick('beef')}>
                <img src="https://www.themealdb.com/images/media/meals/1529444830.jpg" alt="Beef" />
                <span>Beef</span>
              </div>
              <div className='trending-item' onClick={() => handleTrendingClick('seafood')}>
                <img src="https://www.themealdb.com/images/media/meals/1520084413.jpg" alt="Seafood" />
                <span>Seafood</span>
              </div>
              <div className='trending-item' onClick={() => handleTrendingClick('pasta')}>
                <img src="https://www.themealdb.com/images/media/meals/wvqpwt1468339226.jpg" alt="Pasta" />
                <span>Pasta</span>
              </div>
              <div className='trending-item' onClick={() => handleTrendingClick('dessert')}>
                <img src="https://www.themealdb.com/images/media/meals/adxcbq1619787919.jpg" alt="Dessert" />
                <span>Dessert</span>
              </div>
              <div className='trending-item' onClick={() => handleTrendingClick('soup')}>
                <img src="https://www.themealdb.com/images/media/meals/7n8su21699013057.jpg" alt="Soup" />
                <span>Soup</span>
              </div>
              <div className='trending-item' onClick={() => handleTrendingClick('salad')}>
                <img src="https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg" alt="Salad" />
                <span>Salad</span>
              </div>
              <div className='trending-item' onClick={() => handleTrendingClick('rice')}>
                <img src="https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg" alt="Rice" />
                <span>Rice</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home