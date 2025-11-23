import axios from 'axios';

const SPOONACULAR_API_KEY = 'd923b9ac43dc416698cb64d63eb8746c';
const CACHE = {}; // Cache để giảm API calls

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
  
  // Remove any remaining special characters that look like code
  text = text.replace(/href=["'][^"']*["']/g, '');
  text = text.replace(/com\/recipes\/[^\s]*/g, '');
  
  return text;
};

// Extract ingredients from TheMealDB format
const getIngredientsFromMeal = (meal) => {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      ingredients.push(`${measure} ${ingredient}`.trim());
    }
  }
  return ingredients.join(', ');
};

// TheMealDB - PRIMARY API (Free, Unlimited, High Quality Images)
const fetchFromTheMealDB = async (query) => {
  try {
    console.log('🍳 Fetching from TheMealDB for:', query);
    
    // 1. Search by meal name
    const searchResponse = await axios.get(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`
    );
    
    let recipes = [];
    
    if (searchResponse.data.meals) {
      recipes = searchResponse.data.meals.map(meal => ({
        id: meal.idMeal,
        title: meal.strMeal,
        image: meal.strMealThumb, // High quality image!
        category: meal.strCategory,
        area: meal.strArea, // Cuisine type
        servings: '4', // TheMealDB doesn't provide, default to 4
        ingredients: getIngredientsFromMeal(meal),
        instructions: meal.strInstructions,
        videoUrl: meal.strYoutube, // BONUS: Video tutorial!
        recipeId: meal.idMeal,
        source: 'themealdb'
      }));
    }
    
    // 2. If not enough results, search by ingredient
    if (recipes.length < 20) {
      try {
        const ingredientResponse = await axios.get(
          `https://www.themealdb.com/api/json/v1/1/filter.php?i=${query}`
        );
        
        if (ingredientResponse.data.meals) {
          const mealIds = ingredientResponse.data.meals.slice(0, 100); // Get up to 100
          
          // Fetch full details for each meal
          const detailPromises = mealIds.map(meal => 
            axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`)
              .catch(() => null)
          );
          
          const details = await Promise.all(detailPromises);
          const additionalRecipes = details
            .filter(d => d && d.data.meals)
            .map(d => {
              const meal = d.data.meals[0];
              return {
                id: meal.idMeal,
                title: meal.strMeal,
                image: meal.strMealThumb,
                category: meal.strCategory,
                area: meal.strArea,
                servings: '4',
                ingredients: getIngredientsFromMeal(meal),
                instructions: meal.strInstructions,
                videoUrl: meal.strYoutube,
                recipeId: meal.idMeal,
                source: 'themealdb'
              };
            });
          
          recipes = [...recipes, ...additionalRecipes];
        }
      } catch (error) {
        console.log('Could not fetch by ingredient:', error.message);
      }
    }
    
    // Remove duplicates based on ID
    const uniqueRecipes = Array.from(
      new Map(recipes.map(r => [r.id, r])).values()
    );
    
    console.log('✅ Fetched from TheMealDB:', uniqueRecipes.length, 'unique recipes');
    return uniqueRecipes;
    
  } catch (error) {
    console.error('❌ TheMealDB error:', error.message);
    return [];
  }
};

// Main fetch function - TheMealDB as PRIMARY
const getRecipe = async (query) => {
  // Check cache first
  if (CACHE[query]) {
    console.log('💾 Using cached results for:', query);
    return CACHE[query];
  }

  try {
    // Use TheMealDB as primary source (FREE, UNLIMITED, HIGH QUALITY IMAGES)
    const recipes = await fetchFromTheMealDB(query);
    
    if (recipes.length > 0) {
      // Cache kết quả
      CACHE[query] = recipes;
      console.log('🎉 Returning', recipes.length, 'recipes from TheMealDB');
      return recipes;
    }
    
    // If no results from TheMealDB, return empty
    console.log('⚠️ No recipes found for:', query);
    return [];
    
  } catch (error) {
    console.error('❌ Error fetching recipe data:', error);
    return [];
  }
};

export default getRecipe;
export { stripHtmlTags };

