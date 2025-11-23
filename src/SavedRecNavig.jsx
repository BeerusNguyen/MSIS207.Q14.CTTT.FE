import React from 'react'
import { useParams } from 'react-router-dom'
import Header from './Header';
import RecipeTemplate from './RecipeTemplate';
import  './index.css';

const SavedRecNavig = ({savedData,setSavedData,setNutriData}) => {
    const {id} = useParams();
    const ourDish = savedData[id];
    
    // Check if recipe data is loaded
    if (!ourDish) {
      return (
        <>
          <Header/>
          <div className='msg' style={{marginTop: '50px'}}>
            Loading saved recipe... Please wait or go back to saved recipes.
          </div>
        </>
      );
    }
    
    // Split ingredients by comma for better display (each ingredient on separate line)
    const ingredientsArray = ourDish.ingredients.includes(',') 
      ? ourDish.ingredients.split(',').map(ing => ing.trim())
      : ourDish.ingredients.split('|').map(ing => ing.trim());

    const cookingInstructions = ourDish.instructions.split('.');

    const buttonVal = "Remove from saved";
  return (
    <>
        <Header/>
        
        <RecipeTemplate
          ourDish={ourDish}
          savedData={savedData} 
          setSavedData={setSavedData}
          ingredientsArray={ingredientsArray} 
          cookingInstructions={cookingInstructions} 
          nutriData={ourDish.nutrition}
          setNutriData={setNutriData}
          buttonVal={buttonVal}  />
        
        
    </>
    
  )
}

export default SavedRecNavig