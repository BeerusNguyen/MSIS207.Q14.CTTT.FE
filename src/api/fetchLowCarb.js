import axios from 'axios';

const API_KEY = 'd923b9ac43dc416698cb64d63eb8746c';
const getLowCarbRecipes = async() => {
    try {
        const response = await axios.get('https://api.spoonacular.com/recipes/findByNutrients',{
            params:{
                minCarbs:10,
                maxCarbs:50,
                number:5,
                apiKey:API_KEY
            },
            headers:{
                'Content-Type':'application/json'
            }
        });

        return response.data;
    } catch (error) {
        console.log(error.message);
    }
}

export default getLowCarbRecipes;