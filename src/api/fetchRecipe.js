import axios from 'axios';

// Create separate axios instance for external APIs (no Authorization header)
const externalApi = axios.create();

const SPOONACULAR_API_KEY = 'd923b9ac43dc416698cb64d63eb8746c';
const CACHE = {}; // Cache to reduce API calls

// Helper function to strip HTML tags and clean text
const stripHtmlTags = (html) => {
  if (!html) return '';
  
  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, ' ');
  
  // Decode HTML entities
  const entities = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'"
  };
  
  Object.keys(entities).forEach(entity => {
    text = text.replace(new RegExp(entity, 'g'), entities[entity]);
  });
  
  // Remove extra whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
};

// Format ingredients from Spoonacular format
const formatIngredients = (extendedIngredients) => {
  if (!extendedIngredients || !Array.isArray(extendedIngredients)) return '';
  
  return extendedIngredients.map(ing => {
    const amount = ing.measures?.metric?.amount || ing.amount || '';
    const unit = ing.measures?.metric?.unitShort || ing.unit || '';
    const name = ing.name || ing.originalName || '';
    return `${amount} ${unit} ${name}`.trim();
  }).join('|');
};

// Format instructions from Spoonacular format
const formatInstructions = (analyzedInstructions, rawInstructions) => {
  if (analyzedInstructions && analyzedInstructions.length > 0 && analyzedInstructions[0].steps) {
    return analyzedInstructions[0].steps.map(step => step.step).join('|');
  }
  
  if (rawInstructions) {
    return stripHtmlTags(rawInstructions);
  }
  
  return 'No instructions available';
};

// Spoonacular API - Search recipes with full information
const fetchFromSpoonacular = async (query) => {
  try {
    console.log('🥄 Fetching from Spoonacular for:', query);
    
    // Search recipes with full nutrition information
    const searchUrl = `https://api.spoonacular.com/recipes/complexSearch`;
    
    const response = await externalApi.get(searchUrl, {
      params: {
        apiKey: SPOONACULAR_API_KEY,
        query: query,
        number: 100, // Get 100 results (max allowed per request)
        addRecipeInformation: true, // Include full recipe info
        addRecipeNutrition: true, // Include nutrition data
        fillIngredients: true, // Include ingredients
        instructionsRequired: true // Only get recipes with instructions
      }
    });
    
    console.log('📥 Spoonacular Response:', response.status);
    console.log('📊 Total results:', response.data?.totalResults);
    
    if (response.data && response.data.results && response.data.results.length > 0) {
      console.log('🍽️ Found recipes:', response.data.results.length);
      
      const recipes = response.data.results.map(recipe => ({
        id: recipe.id,
        title: recipe.title,
        image: recipe.image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400',
        servings: recipe.servings || 4,
        readyInMinutes: recipe.readyInMinutes || 30,
        healthScore: recipe.healthScore || 0,
        ingredients: formatIngredients(recipe.extendedIngredients || recipe.nutrition?.ingredients),
        instructions: formatInstructions(recipe.analyzedInstructions, recipe.instructions),
        // Full nutrition data
        nutrition: {
          calories: recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || 0,
          fat: recipe.nutrition?.nutrients?.find(n => n.name === 'Fat')?.amount || 0,
          carbs: recipe.nutrition?.nutrients?.find(n => n.name === 'Carbohydrates')?.amount || 0,
          protein: recipe.nutrition?.nutrients?.find(n => n.name === 'Protein')?.amount || 0,
          fiber: recipe.nutrition?.nutrients?.find(n => n.name === 'Fiber')?.amount || 0,
          sugar: recipe.nutrition?.nutrients?.find(n => n.name === 'Sugar')?.amount || 0,
          // Full nutrients array for detailed view
          nutrients: recipe.nutrition?.nutrients || []
        },
        // Diet labels
        vegetarian: recipe.vegetarian || false,
        vegan: recipe.vegan || false,
        glutenFree: recipe.glutenFree || false,
        dairyFree: recipe.dairyFree || false,
        veryHealthy: recipe.veryHealthy || false,
        // Source tracking
        recipeId: recipe.id,
        source: 'spoonacular',
        sourceUrl: recipe.sourceUrl || ''
      }));
      
      console.log('✅ Processed', recipes.length, 'recipes from Spoonacular');
      return recipes;
    }
    
    console.log('⚠️ No recipes found in Spoonacular response');
    return [];
    
  } catch (error) {
    console.error('❌ Spoonacular error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      
      // Check for quota exceeded error
      if (error.response.status === 402) {
        console.error('⚠️ API quota exceeded! Daily limit reached.');
        throw new Error('API_QUOTA_EXCEEDED');
      }
    }
    return [];
  }
};

// Main fetch function - Spoonacular as PRIMARY
const getRecipe = async (query) => {
  // Check cache first
  if (CACHE[query]) {
    console.log('💾 Using cached results for:', query);
    return CACHE[query];
  }

  try {
    // Use Spoonacular as primary source (Full data: nutrition, instructions, etc.)
    const recipes = await fetchFromSpoonacular(query);
    
    if (recipes.length > 0) {
      // Cache the results
      CACHE[query] = recipes;
      console.log('🎉 Returning', recipes.length, 'recipes from Spoonacular');
      return recipes;
    }
    
    // If no results, return empty
    console.log('⚠️ No recipes found for:', query);
    return [];
    
  } catch (error) {
    console.error('❌ Error fetching recipe data:', error);
    
    // Propagate quota error
    if (error.message === 'API_QUOTA_EXCEEDED') {
      throw error;
    }
    
    return [];
  }
};

export default getRecipe;
export { stripHtmlTags, formatIngredients, formatInstructions };