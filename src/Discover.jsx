import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from './Header';
import { useModal } from './context/ModalContext';
import { MdFastfood, MdRestaurantMenu, MdCalendarMonth, MdBookmark, MdFavorite, MdFavoriteBorder, MdShoppingCart } from "react-icons/md";
import api1 from './api/fetchSaved';
import { getFavorites, addFavorite, removeFavorite } from './api/favoritesApi';
import './Discover.css';

// Cache object to store search results
const searchCache = {};
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

const Discover = () => {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const { showWarning, showSuccess, showError } = useModal();
  const navigate = useNavigate();

  // Modal state for recipe detail
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [recipeDetail, setRecipeDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const modalRef = useRef(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const recipesPerPage = 12;

  // Favorites state
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loadingFavorite, setLoadingFavorite] = useState(null);

  const API_KEY = 'd923b9ac43dc416698cb64d63eb8746c';

  // Default images array for variety
  const defaultImages = [
    'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
    'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=400',
    'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
  ];

  const getRandomDefaultImage = (index) => {
    return defaultImages[index % defaultImages.length];
  };

  // Check cache before making API call
  const getCachedResult = (key) => {
    const cached = searchCache[key];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('🎯 Cache hit for:', key);
      return cached.data;
    }
    return null;
  };

  // Save to cache
  const setCacheResult = (key, data) => {
    searchCache[key] = {
      data,
      timestamp: Date.now()
    };
    console.log('💾 Cached result for:', key);
  };

  // Fetch favorites on mount
  const fetchUserFavorites = useCallback(async () => {
    try {
      const favorites = await getFavorites();
      setFavoriteIds(new Set(favorites.map(fav => fav.recipe_id)));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  }, []);

  useEffect(() => {
    fetchUserFavorites();
  }, [fetchUserFavorites]);

  // Toggle favorite
  const toggleFavorite = async (e, recipe) => {
    e.stopPropagation(); // Prevent opening modal
    
    const recipeId = recipe.id.toString();
    if (loadingFavorite === recipeId) return;
    
    setLoadingFavorite(recipeId);
    try {
      if (favoriteIds.has(recipeId)) {
        await removeFavorite(recipeId);
        setFavoriteIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(recipeId);
          return newSet;
        });
        showSuccess('Removed from favorites!', 'Unfavorited');
      } else {
        await addFavorite(recipe.id, recipe.title, recipe.image, 'spoonacular');
        setFavoriteIds(prev => new Set([...prev, recipeId]));
        showSuccess('Added to favorites!', 'Favorited ❤️');
      }
    } catch (error) {
      showError('Failed to update favorites', 'Error');
    }
    setLoadingFavorite(null);
  };

  const handleSearch = async () => {
    if (!ingredients.trim()) {
      showWarning('Please enter at least one ingredient!', 'No ingredient entered');
      return;
    }

    const cacheKey = ingredients.trim().toLowerCase();
    
    // Check cache first
    const cachedData = getCachedResult(cacheKey);
    if (cachedData) {
      setRecipes(cachedData);
      setSearched(true);
      setCurrentPage(1);
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);
    setCurrentPage(1);

    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredients)}&number=50&ranking=1&ignorePantry=true&apiKey=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }
      
      const data = await response.json();
      setRecipes(data);
      
      // Cache the result
      setCacheResult(cacheKey, data);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setError('Unable to search recipes. Please try again!');
    }
    setLoading(false);
  };

  // Fetch recipe detail for modal
  const fetchRecipeDetail = async (recipeId) => {
    const cacheKey = `detail_${recipeId}`;
    const cachedData = getCachedResult(cacheKey);
    
    if (cachedData) {
      setRecipeDetail(cachedData);
      return;
    }

    setLoadingDetail(true);
    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/${recipeId}/information?includeNutrition=true&apiKey=${API_KEY}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      setRecipeDetail(data);
      setCacheResult(cacheKey, data);
    } catch (error) {
      console.error('Error fetching recipe detail:', error);
      showError('Unable to load recipe details!', 'Error');
    }
    setLoadingDetail(false);
  };

  // Open recipe modal
  const openRecipeModal = (recipe) => {
    setSelectedRecipe(recipe);
    setRecipeDetail(null);
    fetchRecipeDetail(recipe.id);
    document.body.style.overflow = 'hidden';
  };

  // Close recipe modal
  const closeRecipeModal = () => {
    setSelectedRecipe(null);
    setRecipeDetail(null);
    document.body.style.overflow = 'auto';
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeRecipeModal();
      }
    };

    if (selectedRecipe) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedRecipe]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') closeRecipeModal();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Save recipe function
  const saveRecipe = async () => {
    if (!recipeDetail) return;

    const ingredientsText = recipeDetail.extendedIngredients
      ?.map(ing => `${ing.measures?.metric?.amount || ''} ${ing.measures?.metric?.unitShort || ''} ${ing.name}`)
      .join('|') || '';

    const instructionsText = recipeDetail.analyzedInstructions?.[0]?.steps
      ?.map(step => step.step).join('. ') || recipeDetail.instructions || 'No instructions';

    // Extract all nutrition data from Spoonacular response
    const nutrients = recipeDetail.nutrition?.nutrients || [];
    const getNutrient = (name) => nutrients.find(n => n.name === name)?.amount || 0;

    const newRecipe = {
      title: recipeDetail.title,
      ingredients: ingredientsText,
      servings: recipeDetail.servings || 4,
      instructions: instructionsText,
      image: recipeDetail.image || null,
      nutrition: {
        calories: getNutrient('Calories'),
        protein: getNutrient('Protein'),
        carbs: getNutrient('Carbohydrates'),
        fat: getNutrient('Fat'),
        fiber: getNutrient('Fiber'),
        sugar: getNutrient('Sugar'),
        sodium: getNutrient('Sodium')
      }
    };

    try {
      await api1.post('/recipes', newRecipe);
      showSuccess('Recipe saved successfully!', 'Saved');
      closeRecipeModal();
      navigate("/saved");
    } catch (error) {
      console.error('Error saving recipe:', error);
      showError('Unable to save recipe. Please try again!', 'Error');
    }
  };

  // Pagination calculations
  const indexOfLastRecipe = currentPage * recipesPerPage;
  const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
  const currentRecipes = recipes.slice(indexOfFirstRecipe, indexOfLastRecipe);
  const totalPages = Math.ceil(recipes.length / recipesPerPage);

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className='home-layout'>
      {/* Sidebar */}
      <aside className='sidebar'>
        <div className='sidebar-logo'>
          <img src={`${process.env.PUBLIC_URL}/Gemini_Generated_Image_5vl4c25vl4c25vl4.png`} alt="Logo" />
          <h2>Recipe Finder</h2>
        </div>

        <nav className='sidebar-nav'>
          <Link to="/discover" className='sidebar-link active'>
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
        <div className='discover-container'>
        <div className='discover-header'>
          <h1 className='discover-title'>
            🍳 Discover Recipes by <span className='highlight'>Ingredients</span>
          </h1>
          <p className='discover-subtitle'>
            Enter your available ingredients and we'll find matching recipes for you!
          </p>
        </div>

        <div className='discover-search'>
          <input
            type="text"
            className='discover-input'
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g: rice, chicken, onion, garlic..."
          />
          <button onClick={handleSearch} className='discover-btn' disabled={loading}>
            {loading ? '🔄 Searching...' : '🔍 Search'}
          </button>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className='skeleton-container'>
            <div className='skeleton-header'>
              <div className='skeleton-spinner'></div>
              <p>Searching for matching recipes...</p>
            </div>
            <div className='skeleton-grid'>
              {[...Array(8)].map((_, index) => (
                <div key={index} className='skeleton-card'>
                  <div className='skeleton-image'></div>
                  <div className='skeleton-content'>
                    <div className='skeleton-title'></div>
                    <div className='skeleton-stat'></div>
                    <div className='skeleton-stat short'></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <p className='discover-error'>{error}</p>}

        {!loading && searched && recipes.length === 0 && (
          <div className='discover-empty'>
            <p>😕 No recipes found with these ingredients.</p>
            <p>Try with different ingredients!</p>
          </div>
        )}

        {!loading && recipes.length > 0 && (
          <>
            <div className='discover-results-info'>
              <p>🎉 Found <strong>{recipes.length}</strong> matching recipes!</p>
            </div>

            <div className='discover-grid'>
              {currentRecipes.map((recipe, index) => (
                <div 
                  key={recipe.id} 
                  className='discover-card-link'
                  onClick={() => openRecipeModal(recipe)}
                >
                  <div className='discover-card'>
                    <div className='discover-card-image'>
                      <img 
                        src={recipe.image || getRandomDefaultImage(index)} 
                        alt={recipe.title}
                        onError={(e) => {e.target.src = getRandomDefaultImage(index)}}
                      />
                      <div className='discover-card-badge'>
                        #{indexOfFirstRecipe + index + 1}
                      </div>
                      <button 
                        className={`favorite-btn ${favoriteIds.has(recipe.id.toString()) ? 'active' : ''}`}
                        onClick={(e) => toggleFavorite(e, recipe)}
                        disabled={loadingFavorite === recipe.id.toString()}
                        title={favoriteIds.has(recipe.id.toString()) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        {loadingFavorite === recipe.id.toString() ? (
                          <span className='favorite-loading'>⏳</span>
                        ) : favoriteIds.has(recipe.id.toString()) ? (
                          <MdFavorite />
                        ) : (
                          <MdFavoriteBorder />
                        )}
                      </button>
                      <div className='discover-card-overlay'>
                        <span>👁️ View details</span>
                      </div>
                    </div>
                    <div className='discover-card-content'>
                      <h3 className='discover-card-title'>{recipe.title}</h3>
                      <div className='discover-card-stats'>
                        <div className='stat used'>
                          <span className='stat-icon'>✅</span>
                          <span>{recipe.usedIngredientCount} ingredients available</span>
                        </div>
                        <div className='stat missed'>
                          <span className='stat-icon'>🛒</span>
                          <span>{recipe.missedIngredientCount} need to buy</span>
                        </div>
                      </div>
                      {recipe.usedIngredients && recipe.usedIngredients.length > 0 && (
                        <div className='discover-card-ingredients'>
                          <p className='ingredients-label'>Used ingredients:</p>
                          <p className='ingredients-list'>
                            {recipe.usedIngredients.map(ing => ing.name).join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className='pagination'>
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className='pagination-btn'
                >
                  ← Prev
                </button>

                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className='pagination-ellipsis'>...</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={currentPage === page ? 'pagination-btn active' : 'pagination-btn'}
                    >
                      {page}
                    </button>
                  )
                ))}

                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className='pagination-btn'
                >
                  Next →
                </button>

                <span className='pagination-info'>
                  Page {currentPage} / {totalPages} ({recipes.length} recipes)
                </span>
              </div>
            )}
          </>
        )}

        {/* Recipe Detail Modal */}
        {selectedRecipe && (
          <div className='recipe-modal-overlay'>
            <div className='recipe-modal' ref={modalRef}>
              <button className='modal-close-btn' onClick={closeRecipeModal}>✕</button>
              
              {loadingDetail ? (
                <div className='modal-loading'>
                  <div className='modal-loading-spinner'></div>
                  <p>Loading recipe details...</p>
                </div>
              ) : recipeDetail ? (
                <div className='modal-content'>
                  <div className='modal-header'>
                    <img 
                      src={recipeDetail.image || getRandomDefaultImage(0)} 
                      alt={recipeDetail.title}
                      onError={(e) => {e.target.src = getRandomDefaultImage(0)}}
                    />
                    <div className='modal-header-info'>
                      <h2>{recipeDetail.title}</h2>
                      <div className='modal-meta'>
                        {recipeDetail.readyInMinutes && (
                          <span>⏱️ {recipeDetail.readyInMinutes} mins</span>
                        )}
                        {recipeDetail.servings && (
                          <span>👥 {recipeDetail.servings} servings</span>
                        )}
                        {recipeDetail.healthScore && (
                          <span>❤️ Health Score: {recipeDetail.healthScore}</span>
                        )}
                      </div>
                      <div className='modal-tags'>
                        {recipeDetail.vegetarian && <span className='tag vegetarian'>🥬 Vegetarian</span>}
                        {recipeDetail.vegan && <span className='tag vegan'>🌱 Vegan</span>}
                        {recipeDetail.glutenFree && <span className='tag gluten-free'>🌾 Gluten Free</span>}
                        {recipeDetail.dairyFree && <span className='tag dairy-free'>🥛 Dairy Free</span>}
                      </div>
                    </div>
                  </div>

                  <div className='modal-body'>
                    {/* Ingredients */}
                    <div className='modal-section'>
                      <h3>🥗 Ingredients</h3>
                      <ul className='modal-ingredients-list'>
                        {recipeDetail.extendedIngredients?.map((ing, index) => (
                          <li key={index}>
                            <MdFastfood />
                            <span>{ing.original}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Nutrition */}
                    {recipeDetail.nutrition?.nutrients && (
                      <div className='modal-section'>
                        <h3>📊 Nutrition Facts</h3>
                        <div className='modal-nutrition-grid'>
                          {recipeDetail.nutrition.nutrients.slice(0, 8).map((nutrient, index) => (
                            <div key={index} className='nutrition-item'>
                              <span className='nutrition-name'>{nutrient.name}</span>
                              <span className='nutrition-value'>{Math.round(nutrient.amount)} {nutrient.unit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Instructions */}
                    <div className='modal-section'>
                      <h3>👨‍🍳 Cooking Instructions</h3>
                      {recipeDetail.analyzedInstructions?.[0]?.steps ? (
                        <ol className='modal-instructions-list'>
                          {recipeDetail.analyzedInstructions[0].steps.map((step, index) => (
                            <li key={index}>
                              <span className='step-number'>{step.number}</span>
                              <span className='step-text'>{step.step}</span>
                            </li>
                          ))}
                        </ol>
                      ) : recipeDetail.instructions ? (
                        <div 
                          className='modal-instructions-text'
                          dangerouslySetInnerHTML={{ __html: recipeDetail.instructions }}
                        />
                      ) : (
                        <p className='no-instructions'>No detailed instructions available.</p>
                      )}
                    </div>
                  </div>

                  <div className='modal-footer'>
                    <button className='modal-save-btn' onClick={saveRecipe}>
                      💾 Save Recipe
                    </button>
                    <button className='modal-cancel-btn' onClick={closeRecipeModal}>
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div className='modal-error'>
                  <p>😕 Unable to load recipe details.</p>
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default Discover;
