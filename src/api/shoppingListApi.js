import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Get auth header
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get shopping list for user
export const getShoppingList = async () => {
    try {
        const response = await axios.get(`${API_URL}/shopping-list`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching shopping list:', error);
        throw error;
    }
};

// Add item to shopping list
export const addShoppingItem = async (item) => {
    try {
        const response = await axios.post(`${API_URL}/shopping-list`, item, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error adding shopping item:', error);
        throw error;
    }
};

// Add multiple items from a recipe
export const addItemsFromRecipe = async (recipeId, recipeTitle, ingredients) => {
    try {
        // Add each ingredient as a separate shopping item
        const promises = ingredients.map(ing => 
            axios.post(`${API_URL}/shopping-list`, {
                ingredient: ing.name || ing,
                quantity: ing.amount ? `${ing.amount} ${ing.unit || ''}`.trim() : '',
                recipe_id: recipeId
            }, {
                headers: getAuthHeader()
            })
        );
        const results = await Promise.all(promises);
        return results.map(r => r.data);
    } catch (error) {
        console.error('Error adding items from recipe:', error);
        throw error;
    }
};

// Add items from meal plan (need to fetch meal plan recipes first, then add their ingredients)
export const addItemsFromMealPlan = async (date) => {
    try {
        // First get the meal plan for the date
        const mealPlanResponse = await axios.get(`${API_URL}/meal-plans?date=${date}`, {
            headers: getAuthHeader()
        });
        
        const mealPlans = mealPlanResponse.data;
        if (!mealPlans || mealPlans.length === 0) {
            return { message: 'No meal plan found for this date', items: [], count: 0 };
        }
        
        // For each meal plan, add ingredients from the recipe or notes
        let addedItems = [];
        for (const meal of mealPlans) {
            // If meal has recipe with ingredients
            if (meal.ingredients) {
                const ingredientList = meal.ingredients.split(',').map(i => i.trim());
                for (const ing of ingredientList) {
                    if (ing) {
                        const result = await axios.post(`${API_URL}/shopping-list`, {
                            ingredient: ing,
                            quantity: '',
                            recipe_id: meal.recipe_id
                        }, {
                            headers: getAuthHeader()
                        });
                        addedItems.push(result.data);
                    }
                }
            } 
            // If meal has notes (like auto-generated meals), extract meal name
            else if (meal.notes) {
                // Extract meal name from notes (format: "Meal Name - XXX kcal, Ready in XX mins")
                const mealName = meal.notes.split(' - ')[0].trim();
                if (mealName) {
                    const result = await axios.post(`${API_URL}/shopping-list`, {
                        ingredient: `🍽️ ${mealName} (${meal.meal_type})`,
                        quantity: 'See recipe',
                        recipe_id: meal.recipe_id
                    }, {
                        headers: getAuthHeader()
                    });
                    addedItems.push(result.data);
                }
            }
        }
        
        return { 
            message: addedItems.length > 0 
                ? `Added ${addedItems.length} items from meal plan` 
                : 'No ingredients found in meal plan',
            items: addedItems,
            count: addedItems.length
        };
    } catch (error) {
        console.error('Error adding items from meal plan:', error);
        throw error;
    }
};

// Toggle item purchased status
export const toggleItemPurchased = async (itemId) => {
    try {
        const response = await axios.patch(`${API_URL}/shopping-list/${itemId}/toggle`, {}, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error toggling item:', error);
        throw error;
    }
};

// Update item
export const updateShoppingItem = async (itemId, updates) => {
    try {
        const response = await axios.put(`${API_URL}/shopping-list/${itemId}`, updates, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error updating item:', error);
        throw error;
    }
};

// Delete item
export const deleteShoppingItem = async (itemId) => {
    try {
        await axios.delete(`${API_URL}/shopping-list/${itemId}`, {
            headers: getAuthHeader()
        });
        return true;
    } catch (error) {
        console.error('Error deleting item:', error);
        throw error;
    }
};

// Clear all purchased (checked) items
export const clearPurchasedItems = async () => {
    try {
        const response = await axios.delete(`${API_URL}/shopping-list/clear-checked`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error clearing purchased items:', error);
        throw error;
    }
};

// Clear all items (delete one by one since backend doesn't have clear-all endpoint)
export const clearAllItems = async () => {
    try {
        // First get all items
        const items = await getShoppingList();
        // Delete each one
        for (const item of items) {
            await deleteShoppingItem(item.id);
        }
        return { message: `Cleared ${items.length} items` };
    } catch (error) {
        console.error('Error clearing all items:', error);
        throw error;
    }
};
