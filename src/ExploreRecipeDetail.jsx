import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import axios from 'axios';
import { MdFastfood } from "react-icons/md";
import api1 from './api/fetchSaved';

const ExploreRecipeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
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
            navigate("/saved");
            alert("Recipe successfully saved!");
        } catch (error) {
            console.error('Error saving recipe:', error);
            alert("Failed to save recipe. Please try again.");
        }
    };

    if (loading) return (
        <>
            <Header />
            <div className='msg'>Loading recipe details...</div>
        </>
    );

    if (error || !recipe) return (
        <>
            <Header />
            <div className='error-msg'>{error || 'Recipe not found'}</div>
        </>
    );

    return (
        <>
            <Header />
            <div className='recipe-det-head'>
                <h1 className='dish-title'>{recipe.title}</h1>
                <button id='add_rec' onClick={SaveTheRecipe}>Save this Recipe</button>
            </div>

            <div className='ing-nut'>
                <div className='ingr'>
                    <h2>Ingredients</h2>
                    <br />
                    <ul>
                        {recipe.extendedIngredients && recipe.extendedIngredients.map((ing, index) => (
                            <li key={index}>
                                <MdFastfood /> {expandAbbreviations(`${ing.measures.metric.amount} ${ing.measures.metric.unitShort} ${ing.name}`)}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className='nutr'>
                    <h2>Nutrition Facts</h2>
                    <br />
                    {recipe.nutrition && recipe.nutrition.nutrients && (
                        <>
                            <h1>Calories: {recipe.nutrition.nutrients.find(n => n.name === 'Calories')?.amount || 'N/A'} kCal</h1>
                            <br />
                            <h2>Key Nutrients:</h2>
                            <br />
                            <ul>
                                {recipe.nutrition.nutrients.slice(0, 10).map((nutrient, index) => (
                                    <li key={index} className='nut-nut-li'>
                                        {nutrient.name}: {nutrient.amount} {nutrient.unit}
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            </div>

            <div className='cook-container'>
                <div className='cook-deets'>
                    <h1>Cooking Instructions</h1>
                    <br />
                    {recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0 ? (
                        <ol>
                            {recipe.analyzedInstructions[0].steps.map((step, index) => (
                                <li key={index}><MdFastfood /> {step.step}</li>
                            ))}
                        </ol>
                    ) : (
                        <div dangerouslySetInnerHTML={{ __html: recipe.instructions || 'No instructions available' }} />
                    )}
                    <hr />
                    <hr />
                </div>
            </div>
            <br />
        </>
    );
};

export default ExploreRecipeDetail;
