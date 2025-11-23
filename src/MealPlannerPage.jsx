import React, { useState } from 'react';
import Header from './Header';
import axios from 'axios';

import getMealPlan from './api/fetchMealPlan';

const MealPlannerPage = () => {
    
    const [loading, setLoading] = useState(false);
    const [kerror, setError] = useState(null);
    
    const [cal,setCal] = useState(0);
    const [diet,setDiet] = useState('');
    const [exclude,setExclude] = useState('');

    const [mealData,setMealData] = useState([]);
    const [mealNutrition, setMealNutrition] = useState([]);

    const API_KEY = 'd923b9ac43dc416698cb64d63eb8746c';

    const fetchMealNutrition = async (mealId) => {
        try {
            const response = await axios.get(`https://api.spoonacular.com/recipes/${mealId}/nutritionWidget.json`, {
                params: { apiKey: API_KEY }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching meal nutrition:', error);
            return null;
        }
    };

    const fetchMeal = async(e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = await getMealPlan(cal,diet,exclude);
            setMealData(data);
            
            // Fetch nutrition for each meal
            if (data.meals) {
                const nutritionPromises = data.meals.map(meal => fetchMealNutrition(meal.id));
                const nutritionData = await Promise.all(nutritionPromises);
                setMealNutrition(nutritionData);
            }
        } catch (error) {
            setError('Failed to fetch recipes');
            console.log(kerror);
        }
        setLoading(false);
      
    }
    return (
        <div className='meal-page'>
            <Header />
            
            <br /><br /><br />
            <h2>Provide the following details to get your meal planned for the entire day :</h2>
            <br />
            <form action="">
                <div>
                    <label htmlFor="" className='meal-label'>Target Calories: </label>
                    <input 
                    className='meal-input'
                    type="text" 
                    value={cal}
                    onChange={(e)=>setCal(e.target.value)}
                    placeholder='Your target calories'/>

                    <br /><br />

                    <label className='meal-label'>Diet Type:</label>
                    <select value={diet} onChange={(e)=>setDiet(e.target.value)} className='meal-input' >
                        <option value="Whole30" key={1}>Whole30</option>
                        <option value="Vegetarian" key={2}>Vegetarian</option>
                        <option value="Gluten Free" key={3}>Gluten Free</option>
                        <option value="Vegan" key={4}>Vegan</option>
                        <option value="Ketogenic" key={5}>Ketogenic</option>
                        <option value="Low FODMAP" key={6}>Low FODMAP</option>
                        <option value="Paleo" key={7}>Paleo</option>
                        <option value="Pescetarian" key={8}>Pescetarian</option>
                    </select>

                    <br /><br />

                    <label htmlFor="" className='meal-label'>Anything to exclude: </label>
                    <input 
                    className='meal-input'
                    type="text"
                    placeholder='Eg. fish'
                    value={exclude}
                    onChange={(e) => setExclude(e.target.value)} />
                    <br />
                    <br />
                    <button onClick={(e)=>fetchMeal(e)} className='meal-input btn'>Submit</button>


                </div>
            </form>
            <br /><br /><br />
            {loading ? <p className='msg'>Loading...</p> : mealData.meals && (
                <>
               
                <h1>Your Meal Plan:</h1>
                <h2 className='cal-meal'>Total calories: {mealData.nutrients.calories} kCal</h2>
                <div className='meal-box'>
                    {mealData.meals.map((item,index) => (
                        <>
                    <div className='meal-item' key={item.id}>
                        {index===0?<h1 className='meal-time'>Breakfast</h1>:index===1?<h1 className='meal-time'>Lunch</h1>:<h1 className='meal-time'>Dinner</h1>}
                        <br /><br />
                        <h1>{item.title}</h1>
                        <br />
                        {mealNutrition[index] && (
                            <h2 className='meal-calories'>Calories: {mealNutrition[index].calories} kCal</h2>
                        )}
                        <h2>Servings: {item.servings}</h2>
                        <h2>Ready in {item.readyInMinutes} minutes</h2>
                        <br />
                        <a href={item.sourceUrl} target='_blank' className='meal-link' rel="noopener noreferrer">Visit for more details</a>
                    </div>
                    <br /><br />
                    </>
                    ))}
                </div>
               
                </>
                
            )}
            
        </div>
    );
};

export default MealPlannerPage;
