import axios from 'axios';

const API_KEY = 'd923b9ac43dc416698cb64d63eb8746c';

const getMealPlan = async(targetCal,diet,exclude) =>{

    try {
        const response = await axios.get('https://api.spoonacular.com/mealplanner/generate',{
            params:{
                timeFrame:'day',
                targetCalories:targetCal,
                diet:diet,
                exclude:exclude,
                apiKey:API_KEY
            },
            headers:{
                'Content-Type':'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching recipes:', error);
    }
    
}

export default getMealPlan;