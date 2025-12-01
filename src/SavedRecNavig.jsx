import React from 'react'
import { useParams } from 'react-router-dom'
import RecipeTemplate from './RecipeTemplate';
import  './index.css';

const SavedRecNavig = ({savedData,setSavedData}) => {
    const {id} = useParams();
    const ourDish = savedData[id];
    
    // Check if recipe data is loaded
    if (!ourDish) {
      return (
        <div className='recipe-detail-page'>
          <div className='recipe-detail-main'>
            <div className='msg' style={{marginTop: '50px'}}>
              Loading saved recipe... Please wait or go back to saved recipes.
            </div>
          </div>
        </div>
      );
    }
    
    // Split ingredients by pipe (Spoonacular format) or comma
    const ingredientsArray = ourDish.ingredients.includes('|') 
      ? ourDish.ingredients.split('|').map(ing => ing.trim())
      : ourDish.ingredients.split(',').map(ing => ing.trim());

    // Split instructions by pipe (Spoonacular format) or period
    const cookingInstructions = ourDish.instructions.includes('|')
      ? ourDish.instructions.split('|').map(inst => inst.trim())
      : ourDish.instructions.split('.').map(inst => inst.trim()).filter(inst => inst.length > 0);

    const buttonVal = "Remove from saved";
    
  return (
    <RecipeTemplate
      key={ourDish.id || ourDish.title}
      ourDish={ourDish}
      savedData={savedData} 
      setSavedData={setSavedData}
      ingredientsArray={ingredientsArray} 
      cookingInstructions={cookingInstructions} 
      nutriData={ourDish.nutrition}
      buttonVal={buttonVal}  
    />
  )
}

export default SavedRecNavig