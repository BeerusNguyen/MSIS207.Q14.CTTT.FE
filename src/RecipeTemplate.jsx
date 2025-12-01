import React from 'react';
import api1 from './api/fetchSaved';
import { useNavigate, Link } from 'react-router-dom';
import { MdFastfood, MdRestaurantMenu, MdCalendarMonth, MdBookmark, MdAccessTime, MdPeople, MdDelete, MdSave, MdArrowBack, MdLocalFireDepartment, MdShoppingCart } from "react-icons/md";
import { useModal } from './context/ModalContext';
import './RecipeDetail.css';

const RecipeTemplate = ({ ourDish, ingredientsArray, cookingInstructions, buttonVal, savedData, setSavedData, nutriData, searchVal }) => {
    const navig = useNavigate();
    const { showSuccess, showWarning, showError, showConfirm } = useModal();

    // Estimate nutrition from ingredients when no data available
    const estimateNutritionFromIngredients = (ingredients) => {
        if (!ingredients || ingredients.length === 0) return null;
        
        // Common ingredient nutrition estimates (per typical portion)
        const nutritionEstimates = {
            // Proteins
            'chicken': { calories: 165, protein: 31, fat: 3.6, carbs: 0 },
            'beef': { calories: 250, protein: 26, fat: 15, carbs: 0 },
            'pork': { calories: 242, protein: 27, fat: 14, carbs: 0 },
            'fish': { calories: 136, protein: 20, fat: 5, carbs: 0 },
            'salmon': { calories: 208, protein: 20, fat: 13, carbs: 0 },
            'shrimp': { calories: 99, protein: 24, fat: 0.3, carbs: 0 },
            'egg': { calories: 78, protein: 6, fat: 5, carbs: 0.6 },
            'tofu': { calories: 76, protein: 8, fat: 4.8, carbs: 1.9 },
            
            // Carbs
            'rice': { calories: 130, protein: 2.7, fat: 0.3, carbs: 28 },
            'pasta': { calories: 131, protein: 5, fat: 1.1, carbs: 25 },
            'noodle': { calories: 138, protein: 4.5, fat: 2, carbs: 25 },
            'bread': { calories: 79, protein: 2.7, fat: 1, carbs: 15 },
            'potato': { calories: 77, protein: 2, fat: 0.1, carbs: 17 },
            
            // Vegetables
            'onion': { calories: 40, protein: 1.1, fat: 0.1, carbs: 9 },
            'garlic': { calories: 5, protein: 0.2, fat: 0, carbs: 1 },
            'tomato': { calories: 22, protein: 1.1, fat: 0.2, carbs: 4.8 },
            'carrot': { calories: 25, protein: 0.6, fat: 0.1, carbs: 6 },
            'broccoli': { calories: 34, protein: 2.8, fat: 0.4, carbs: 7 },
            'spinach': { calories: 7, protein: 0.9, fat: 0.1, carbs: 1.1 },
            'pepper': { calories: 20, protein: 0.9, fat: 0.2, carbs: 4.6 },
            'mushroom': { calories: 22, protein: 3.1, fat: 0.3, carbs: 3.3 },
            
            // Dairy
            'milk': { calories: 42, protein: 3.4, fat: 1, carbs: 5 },
            'cheese': { calories: 113, protein: 7, fat: 9, carbs: 0.4 },
            'butter': { calories: 102, protein: 0.1, fat: 11.5, carbs: 0 },
            'cream': { calories: 52, protein: 0.4, fat: 5.5, carbs: 0.5 },
            
            // Others
            'oil': { calories: 120, protein: 0, fat: 14, carbs: 0 },
            'sugar': { calories: 49, protein: 0, fat: 0, carbs: 12.6 },
            'flour': { calories: 36, protein: 1, fat: 0.1, carbs: 7.6 },
            'soy sauce': { calories: 8, protein: 1.3, fat: 0, carbs: 0.8 },
        };
        
        let totalNutrition = { calories: 0, protein: 0, fat: 0, carbs: 0 };
        let matchedIngredients = 0;
        
        ingredients.forEach(ingredient => {
            const ingLower = ingredient.toLowerCase();
            for (const [key, nutrition] of Object.entries(nutritionEstimates)) {
                if (ingLower.includes(key)) {
                    totalNutrition.calories += nutrition.calories;
                    totalNutrition.protein += nutrition.protein;
                    totalNutrition.fat += nutrition.fat;
                    totalNutrition.carbs += nutrition.carbs;
                    matchedIngredients++;
                    break;
                }
            }
        });
        
        // If we matched at least some ingredients, return estimated nutrition
        if (matchedIngredients > 0) {
            // Divide by servings if available
            const servings = parseInt(ourDish.servings) || 4;
            return {
                calories: Math.round(totalNutrition.calories / servings * (ingredients.length / matchedIngredients)),
                protein: Math.round(totalNutrition.protein / servings * (ingredients.length / matchedIngredients)),
                fat: Math.round(totalNutrition.fat / servings * (ingredients.length / matchedIngredients)),
                carbs: Math.round(totalNutrition.carbs / servings * (ingredients.length / matchedIngredients)),
                isEstimated: true
            };
        }
        
        return null;
    };

    // Get nutrition data from recipe (Spoonacular provides this directly)
    // If not available, try to estimate from ingredients
    const rawNutritionData = ourDish.nutrition || nutriData || null;
    const nutritionData = rawNutritionData || estimateNutritionFromIngredients(ingredientsArray);

    // Function to expand common abbreviations in ingredients
    const expandAbbreviations = (text) => {
        if (!text) return text;
        
        const abbreviations = {
            ' tb ': ' tablespoon ',
            ' tbs ': ' tablespoon ',
            ' tbsp ': ' tablespoon ',
            ' c ': ' cup ',
            ' tsp ': ' teaspoon ',
            ' oz ': ' ounce ',
            ' lb ': ' pound ',
            ' lbs ': ' pounds ',
            ' qt ': ' quart ',
            ' pt ': ' pint ',
            ' gal ': ' gallon ',
            ' ml ': ' milliliter ',
            ' g ': ' gram ',
            ' kg ': ' kilogram ',
            ' mg ': ' milligram ',
        };
        
        let expandedText = text;
        Object.keys(abbreviations).forEach(abbr => {
            const regex = new RegExp(abbr, 'gi');
            expandedText = expandedText.replace(regex, abbreviations[abbr]);
        });
        
        return expandedText;
    };

    // Function to clean up cooking instructions
    const cleanInstruction = (instruction) => {
        if (!instruction) return '';
        // Remove standalone parentheses and clean up whitespace
        return instruction
            .replace(/^\s*\(\s*$/g, '') // Remove lines with just opening parenthesis
            .replace(/^\s*\)\s*$/g, '') // Remove lines with just closing parenthesis
            .trim();
    };

    const SaveTheRecipe = async () => {
        // Check if recipe already exists in savedData
        const isDuplicate = savedData.some(
            recipe => recipe.title.toLowerCase() === ourDish.title.toLowerCase()
        );

        if (isDuplicate) {
            showWarning('This recipe has already been saved! Please check "Your Saved Recipes".', 'Already exists');
            return;
        }

        try {
            // Extract nutrition in correct format for backend
            let nutritionToSave = null;
            if (nutritionData && !nutritionData.isEstimated) {
                nutritionToSave = {
                    calories: nutritionData.calories || 0,
                    protein: nutritionData.protein || 0,
                    carbs: nutritionData.carbs || 0,
                    fat: nutritionData.fat || 0,
                    fiber: nutritionData.fiber || 0,
                    sugar: nutritionData.sugar || 0,
                    sodium: nutritionData.sodium || 0
                };
            }

            const newRecipe = {
                title: ourDish.title,
                ingredients: ourDish.ingredients,
                servings: ourDish.servings,
                instructions: ourDish.instructions,
                image: ourDish.image || ourDish.strMealThumb || null,
                nutrition: nutritionToSave
            };
            
            console.log('Saving recipe with nutrition:', nutritionToSave);
            
            const response = await api1.post('/recipes', newRecipe);
            
            // Add the recipe with the ID from backend response
            const savedRecipe = response.data;
            const updated_savedData = [...savedData, savedRecipe];
            setSavedData(updated_savedData);

            console.log("Recipe saved successfully!");
            showSuccess('Recipe has been added to your favorites!', 'Saved');
            navig("/saved");
        } catch (error) {
            if (error.response?.status === 409) {
                showWarning('This recipe is already in your list!', 'Already exists');
            } else {
                console.error("Error saving recipe:", error);
                showError('Unable to save recipe. Please try again!', 'Error');
            }
        }
    };

    const RemoveTheRecipe = async () => {
        showConfirm('Are you sure you want to delete this recipe?', async () => {
            const curr_id = ourDish.id;
            await api1.delete(`/recipes/${ourDish.id}`);
            const updated_savedData = savedData.filter((saved) => (saved.id !== curr_id));
            setSavedData(updated_savedData);
            console.log("removed hehe");
            showSuccess('Recipe has been deleted successfully!', 'Deleted');
            navig("/saved");
        }, { title: 'Confirm Delete', confirmText: 'Delete', cancelText: 'Cancel' });
    };

    // Get diet labels from recipe
    const getDietLabels = () => {
        const labels = [];
        if (ourDish.vegetarian) labels.push('Vegetarian');
        if (ourDish.vegan) labels.push('Vegan');
        if (ourDish.glutenFree) labels.push('Gluten Free');
        if (ourDish.dairyFree) labels.push('Dairy Free');
        if (ourDish.veryHealthy) labels.push('Very Healthy');
        return labels;
    };

    // Default image
    const defaultImage = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800';
    const recipeImage = ourDish.image || ourDish.strMealThumb || defaultImage;

    return (
        <div className='recipe-detail-page'>
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
                    
                    <Link to="/saved" className='sidebar-link active'>
                        <MdBookmark className='sidebar-icon' />
                        <span>Saved Recipes</span>
                    </Link>

                    <Link to="/shopping-list" className='sidebar-link'>
                        <MdShoppingCart className='sidebar-icon' />
                        <span>Shopping List</span>
                    </Link>
                </nav>

                <div className='sidebar-info'>
                    <p>Manage your saved recipes and discover new delicious meals!</p>
                </div>
            </aside>

            {/* Main Content */}
            <div className='recipe-detail-main'>
                {/* Hero Section */}
                <div className='recipe-hero'>
                    <img 
                        src={recipeImage} 
                        alt={ourDish.title}
                        className='recipe-hero-image'
                        onError={(e) => {e.target.src = defaultImage}}
                    />
                    <div className='recipe-hero-overlay'>
                        <h1 className='recipe-hero-title'>{ourDish.title}</h1>
                        <div className='recipe-hero-meta'>
                            {ourDish.servings && (
                                <div className='recipe-meta-item'>
                                    <MdPeople /> {typeof ourDish.servings === 'number' ? ourDish.servings : ourDish.servings.slice(0,1)} servings
                                </div>
                            )}
                            {ourDish.readyInMinutes && (
                                <div className='recipe-meta-item'>
                                    <MdAccessTime /> {ourDish.readyInMinutes} mins
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className='recipe-actions-bar'>
                    <button className='recipe-action-btn back' onClick={() => navig(-1)}>
                        <MdArrowBack /> Back
                    </button>
                    {buttonVal === "Save this Recipe" ? (
                        <button className='recipe-action-btn save' onClick={SaveTheRecipe}>
                            <MdSave /> {buttonVal}
                        </button>
                    ) : (
                        <button className='recipe-action-btn delete' onClick={RemoveTheRecipe}>
                            <MdDelete /> {buttonVal}
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className='recipe-content'>
                    <div className='recipe-content-grid'>
                        {/* Ingredients */}
                        <div className='recipe-ingredients-card'>
                            <div className='recipe-card-header'>
                                <MdFastfood />
                                <h2>Ingredients</h2>
                            </div>
                            <ul className='ingredients-list'>
                                {ingredientsArray.map((ing, index) => (
                                    <li key={index} className='ingredient-item'>
                                        <span className='ingredient-icon'>🥄</span>
                                        <span className='ingredient-text'>{expandAbbreviations(ing)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Nutrition */}
                        <div className='recipe-nutrition-card'>
                            <div className='recipe-card-header'>
                                <MdLocalFireDepartment />
                                <h2>Nutrition Facts</h2>
                                {nutritionData?.isEstimated && (
                                    <span className='estimated-badge'>Estimated</span>
                                )}
                            </div>
                            
                            <div className='calories-highlight'>
                                <div className='calories-number'>
                                    {nutritionData?.calories ? Math.round(nutritionData.calories) : 'N/A'}
                                </div>
                                <div className='calories-label'>Calories per serving</div>
                            </div>

                            {nutritionData ? (
                                <div className='nutrients-grid'>
                                    {nutritionData?.fat !== undefined && (
                                        <div className='nutrient-item'>
                                            <div className='nutrient-value'>{Math.round(nutritionData.fat)}g</div>
                                            <div className='nutrient-name'>Fat</div>
                                        </div>
                                    )}
                                    {nutritionData?.carbs !== undefined && (
                                        <div className='nutrient-item'>
                                            <div className='nutrient-value'>{Math.round(nutritionData.carbs)}g</div>
                                            <div className='nutrient-name'>Carbohydrates</div>
                                        </div>
                                    )}
                                    {nutritionData?.protein !== undefined && (
                                        <div className='nutrient-item'>
                                            <div className='nutrient-value'>{Math.round(nutritionData.protein)}g</div>
                                            <div className='nutrient-name'>Protein</div>
                                        </div>
                                    )}
                                    {nutritionData?.fiber !== undefined && (
                                        <div className='nutrient-item'>
                                            <div className='nutrient-value'>{Math.round(nutritionData.fiber)}g</div>
                                            <div className='nutrient-name'>Fiber</div>
                                        </div>
                                    )}
                                    {nutritionData?.sugar !== undefined && (
                                        <div className='nutrient-item'>
                                            <div className='nutrient-value'>{Math.round(nutritionData.sugar)}g</div>
                                            <div className='nutrient-name'>Sugar</div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className='no-nutrition-data'>
                                    <p>Nutrition data not available for this recipe.</p>
                                    <p className='no-nutrition-hint'>Try searching for this recipe again to get nutrition info.</p>
                                </div>
                            )}

                            {/* Diet Labels */}
                            {getDietLabels().length > 0 && (
                                <div className='labels-section'>
                                    <div className='labels-title'>Diet Labels:</div>
                                    <div className='labels-container'>
                                        {getDietLabels().map((label, idx) => (
                                            <span key={idx} className='label-tag'>{label}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className='recipe-instructions-section'>
                        <div className='recipe-card-header'>
                            <MdRestaurantMenu />
                            <h2>Cooking Instructions</h2>
                        </div>
                        
                        <ol className='instructions-list'>
                            {cookingInstructions.map((inst, index) => {
                                const cleanedInst = cleanInstruction(inst);
                                return cleanedInst ? (
                                    <li key={index} className='instruction-step'>
                                        <span className='step-number'>{index + 1}</span>
                                        <span className='step-text'>{cleanedInst}</span>
                                    </li>
                                ) : null;
                            })}
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecipeTemplate;
