import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import RecipeTemplate from './RecipeTemplate';

const SearchRecNavig = ({recipeData,savedData,setSavedData,searchVal}) => {
  const {id} = useParams();
  const navigate = useNavigate();
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(true);
  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    const loadRecipe = async () => {
      try {
        // Try to get from recipeData prop first
        if (recipeData && recipeData[id]) {
          setRecipe(recipeData[id]);
          setInstructions(recipeData[id].instructions || 'No instructions available');
          setLoading(false);
          return;
        }

        // If no prop data, try sessionStorage
        const cachedData = sessionStorage.getItem('searchResults');
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          if (parsedData[id]) {
            setRecipe(parsedData[id]);
            setInstructions(parsedData[id].instructions || 'No instructions available');
            setLoading(false);
            return;
          }
        }

        // If still no data, redirect back to home after 2 seconds
        console.log('No recipe data found, redirecting to home...');
        setTimeout(() => {
          navigate('/');
        }, 2000);
        
      } catch (error) {
        console.error('Error loading recipe:', error);
        setLoading(false);
      }
    };

    loadRecipe();
  }, [id, recipeData, navigate]);

  // Check if recipe data is loaded
  if (loading || !recipe) {
    return (
      <div className='recipe-detail-page'>
        <div className='recipe-detail-main'>
          <div className='msg' style={{marginTop: '50px', textAlign: 'center'}}>
            <p>Loading recipe details...</p>
            <p style={{ fontSize: '14px', marginTop: '10px', color: '#888' }}>
              If this takes too long, you may need to search again. Redirecting to home...
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Split ingredients by pipe (Spoonacular format) or comma
  const ingredientsArray = recipe.ingredients.includes('|') 
    ? recipe.ingredients.split('|').map(ing => ing.trim())
    : recipe.ingredients.split(',').map(ing => ing.trim());
  
  // Split instructions by pipe (Spoonacular format) or period
  const cookingInstructions = instructions.includes('|')
    ? instructions.split('|').map(inst => inst.trim())
    : instructions.split('.').map(inst => inst.trim()).filter(inst => inst.length > 0);
  
  const buttonVal = "Save this Recipe";
  
  return (
    <RecipeTemplate 
      key={recipe.id || recipe.title}
      ourDish={recipe} 
      searchVal={searchVal}
      ingredientsArray={ingredientsArray} 
      cookingInstructions={cookingInstructions} 
      buttonVal={buttonVal} 
      setSavedData={setSavedData}
      savedData={savedData} 
    />
  )
}

export default SearchRecNavig