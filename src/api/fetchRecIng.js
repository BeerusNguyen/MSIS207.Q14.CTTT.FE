import axios from 'axios';

const API_KEY = 'd923b9ac43dc416698cb64d63eb8746c';

const getRecipesByIngredients = async (ingredients, number = 10, ranking = 1, ignorePantry = true) => {
  try {
    const response = await axios.get('https://api.spoonacular.com/recipes/findByIngredients', {
      params: {
        ingredients: ingredients,
        number: number,
        ranking: ranking,
        ignorePantry: ignorePantry,
        apiKey: API_KEY
      },
      headers:{
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recipes:', error);
    throw error;
  }
};

export default getRecipesByIngredients;
