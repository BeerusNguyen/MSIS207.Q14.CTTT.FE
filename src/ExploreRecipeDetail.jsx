import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from './Header';
import axios from 'axios';
import { MdFastfood, MdRestaurantMenu, MdCalendarMonth, MdBookmark, MdAccessTime, MdPeople, MdArrowBack, MdBookmarkAdd, MdLocalFireDepartment } from "react-icons/md";
import api1 from './api/fetchSaved';
import { useModal } from './context/ModalContext';
import './RecipeDetail.css';

const ExploreRecipeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showSuccess, showError } = useModal();
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_KEY = 'd923b9ac43dc416698cb64d63eb8746c';

    useEffect(() => {
        const fetchRecipeDetails = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`https://api.spoonacular.com/recipes/${id}/information`, {
                    params: { apiKey: API_KEY }
                });
                setRecipe(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch recipe details');
                setLoading(false);
            }
        };

        fetchRecipeDetails();
    }, [id]);

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

    const SaveTheRecipe = async () => {
        if (!recipe) return;

        const ingredientsText = recipe.extendedIngredients
            .map(ing => `${ing.measures.metric.amount} ${ing.measures.metric.unitShort} ${ing.name}`)
            .join('|');

        const instructionsText = recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0
            ? recipe.analyzedInstructions[0].steps.map(step => step.step).join('. ')
            : recipe.instructions || 'No instructions available';

        const newRecipe = {
            title: recipe.title,
            ingredients: ingredientsText,
            servings: recipe.servings,
            instructions: instructionsText,
            nutrition: {
                calories: recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || 0,
            }
        };

        try {
            await api1.post('/recipes', newRecipe);
            showSuccess('Recipe saved successfully!', 'Saved');
            navigate("/saved");
        } catch (error) {
            console.error('Error saving recipe:', error);
            showError('Unable to save recipe. Please try again!', 'Error');
        }
    };

    if (loading) return (
        <div className='recipe-detail-page'>
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
                </nav>
            </aside>
            <div className='recipe-detail-main'>
                <Header />
                <div className='favorites-loading' style={{marginTop: '100px'}}>
                    <div className='loading-spinner'></div>
                    <p>Loading recipe details...</p>
                </div>
            </div>
        </div>
    );

    if (error || !recipe) return (
        <div className='recipe-detail-page'>
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
                </nav>
            </aside>
            <div className='recipe-detail-main'>
                <Header />
                <div className='error-msg'>{error || 'Recipe not found'}</div>
            </div>
        </div>
    );

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
                    <Link to="/saved" className='sidebar-link'>
                        <MdBookmark className='sidebar-icon' />
                        <span>Saved Recipes</span>
                    </Link>
                </nav>
                <div className='sidebar-info'>
                    <p>Save your favorite recipes and plan your meals!</p>
                </div>
            </aside>

            {/* Main Content */}
            <div className='recipe-detail-main'>
                <Header />
                
                {/* Hero Section */}
                <div className='recipe-hero'>
                    <img 
                        src={recipe.image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800'} 
                        alt={recipe.title}
                        className='recipe-hero-image'
                    />
                    <div className='recipe-hero-overlay'>
                        <h1 className='recipe-hero-title'>{recipe.title}</h1>
                        <div className='recipe-hero-meta'>
                            {recipe.readyInMinutes && (
                                <div className='recipe-meta-item'>
                                    <MdAccessTime /> {recipe.readyInMinutes} mins
                                </div>
                            )}
                            {recipe.servings && (
                                <div className='recipe-meta-item'>
                                    <MdPeople /> {recipe.servings} servings
                                </div>
                            )}
                            {recipe.healthScore && (
                                <div className='recipe-meta-item'>
                                    <MdLocalFireDepartment /> Health Score: {recipe.healthScore}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className='recipe-actions-bar'>
                    <button className='recipe-action-btn back' onClick={() => navigate(-1)}>
                        <MdArrowBack /> Back
                    </button>
                    <button className='recipe-action-btn save' onClick={SaveTheRecipe}>
                        <MdBookmarkAdd /> Save Recipe
                    </button>
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
                                {recipe.extendedIngredients && recipe.extendedIngredients.map((ing, index) => (
                                    <li key={index} className='ingredient-item'>
                                        <span className='ingredient-icon'>🥄</span>
                                        <span className='ingredient-text'>
                                            {expandAbbreviations(`${ing.measures.metric.amount} ${ing.measures.metric.unitShort} ${ing.name}`)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Nutrition */}
                        <div className='recipe-nutrition-card'>
                            <div className='recipe-card-header'>
                                <MdLocalFireDepartment />
                                <h2>Nutrition Facts</h2>
                            </div>
                            
                            <div className='calories-highlight'>
                                <div className='calories-number'>
                                    {recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount?.toFixed(0) || 'N/A'}
                                </div>
                                <div className='calories-label'>Calories per serving</div>
                            </div>

                            <div className='nutrients-grid'>
                                {recipe.nutrition?.nutrients?.slice(1, 7).map((nutrient, index) => (
                                    <div key={index} className='nutrient-item'>
                                        <div className='nutrient-value'>
                                            {nutrient.amount?.toFixed(1)} {nutrient.unit}
                                        </div>
                                        <div className='nutrient-name'>{nutrient.name}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Diet Labels */}
                            <div className='labels-section'>
                                <div className='labels-title'>Diet Labels:</div>
                                <div className='labels-container'>
                                    {recipe.vegetarian && <span className='label-tag'>Vegetarian</span>}
                                    {recipe.vegan && <span className='label-tag'>Vegan</span>}
                                    {recipe.glutenFree && <span className='label-tag'>Gluten Free</span>}
                                    {recipe.dairyFree && <span className='label-tag'>Dairy Free</span>}
                                    {recipe.veryHealthy && <span className='label-tag'>Very Healthy</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className='recipe-instructions-section'>
                        <div className='recipe-card-header'>
                            <MdRestaurantMenu />
                            <h2>Cooking Instructions</h2>
                        </div>
                        
                        {recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0 ? (
                            <ol className='instructions-list'>
                                {recipe.analyzedInstructions[0].steps.map((step, index) => (
                                    <li key={index} className='instruction-step'>
                                        <span className='step-number'>{step.number}</span>
                                        <span className='step-text'>{step.step}</span>
                                    </li>
                                ))}
                            </ol>
                        ) : (
                            <div className='step-text' dangerouslySetInnerHTML={{ __html: recipe.instructions || 'No instructions available' }} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExploreRecipeDetail;
