import React, { useState } from 'react';
import getRecipesByIngredients from './api/fetchRecIng';
import { Link } from 'react-router-dom';
import Header from './Header';

const Discover = () => {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const recipes = await getRecipesByIngredients(ingredients);
      setRecipes(recipes);
    } catch (error) {
      setError('Failed to fetch recipes');
    }
    setLoading(false);
  };

  return (
    <>
    <Header/>
    <br /><br />
    <div>
      <h1>Search Recipes by Ingredients</h1>
      <br /><br />
      <input
        type="text"
        className='search-recipe-input'
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
        placeholder="Enter ingredients separated by commas"
      />
      <button onClick={handleSearch} className='browse-btn'>Search</button>

     
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      <br /><br /><br />
      <div className='recipe-result-grid'>
        
        {recipes.map((recipe) => (
          <Link to={`/explore/${recipe.id}`} key={recipe.id} className='link'>
            <div className='single-suggest'>
              <img src={recipe.image} alt={recipe.title} />
              <h2>{recipe.title}</h2>
              
              <p>Used Ingredients: {recipe.usedIngredientCount}</p>
              <p>Missed Ingredients: {recipe.missedIngredientCount}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
    </>
  );
};

export default Discover;
