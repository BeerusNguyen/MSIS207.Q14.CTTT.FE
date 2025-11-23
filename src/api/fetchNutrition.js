import axios from 'axios';

const getNutrition = async (recipe) => {
  const appId = '1562febf'; // Replace with your Edamam application ID
  const appKey = '7962e04b6c754617cac36e332b8eb09a'; // Replace with your Edamam application key
  const url = 'https://api.edamam.com/api/nutrition-data';

  try {
    const response = await axios.get(url, {
      params: {
        app_id: appId,
        app_key: appKey,
        ingr: recipe
      }
    });
    return response.data;
    
  } catch (error) {
    console.error("Error fetching nutrition data:", error);
    return null;
  }
};

export default getNutrition;
