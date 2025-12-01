import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Get auth token from localStorage
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

// Get all favorites
export const getFavorites = async () => {
    try {
        const response = await axios.get(`${API_URL}/favorites`, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error('Error fetching favorites:', error);
        throw error;
    }
};

// Add recipe to favorites (with recipe info)
export const addFavorite = async (recipeId, title, image, sourceType = 'spoonacular') => {
    try {
        const response = await axios.post(`${API_URL}/favorites`, {
            recipeId: recipeId.toString(),
            title,
            image,
            sourceType
        }, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error('Error adding favorite:', error);
        throw error;
    }
};

// Remove recipe from favorites
export const removeFavorite = async (recipeId) => {
    try {
        const response = await axios.delete(`${API_URL}/favorites/${recipeId}`, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error('Error removing favorite:', error);
        throw error;
    }
};

// Check if a recipe is favorited
export const checkFavorite = async (recipeId) => {
    try {
        const favorites = await getFavorites();
        return favorites.some(fav => fav.recipe_id === recipeId.toString());
    } catch (error) {
        console.error('Error checking favorite:', error);
        return false;
    }
};

const favoritesApi = {
    getFavorites,
    addFavorite,
    removeFavorite,
    checkFavorite
};

export default favoritesApi;
