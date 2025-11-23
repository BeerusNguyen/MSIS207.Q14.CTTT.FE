import axios from 'axios';

const API_KEY = 'd923b9ac43dc416698cb64d63eb8746c';
const getWeightGainRecipes = async() => {
    try {
        const response = await axios.get('https://api.spoonacular.com/recipes/findByNutrients',{
            params:{
                number:5,
                apiKey:API_KEY,
                minCarbs:50,
                maxCarbs:150,
                minProtein:30,
                maxProtein:90
            },
            headers:{
                'Content-Type':'application/json'
            }
        });

        return response.data;
    } catch (error) {
        console.log(error.message)
    }
}

export default getWeightGainRecipes;