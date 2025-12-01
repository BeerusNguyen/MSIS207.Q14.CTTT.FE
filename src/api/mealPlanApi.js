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

// Get meal plans with optional date filter
export const getMealPlans = async (startDate, endDate) => {
    try {
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        
        const response = await axios.get(`${API_URL}/meal-plans`, {
            ...getAuthHeader(),
            params
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching meal plans:', error);
        throw error;
    }
};

// Create a new meal plan
export const createMealPlan = async (mealPlanData) => {
    try {
        const response = await axios.post(`${API_URL}/meal-plans`, mealPlanData, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error('Error creating meal plan:', error);
        throw error;
    }
};

// Update a meal plan
export const updateMealPlan = async (id, mealPlanData) => {
    try {
        const response = await axios.put(`${API_URL}/meal-plans/${id}`, mealPlanData, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error('Error updating meal plan:', error);
        throw error;
    }
};

// Delete a meal plan
export const deleteMealPlan = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/meal-plans/${id}`, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error('Error deleting meal plan:', error);
        throw error;
    }
};

// Get nutrition summary for a date
export const getNutritionSummary = async (date) => {
    try {
        const response = await axios.get(`${API_URL}/stats/nutrition-summary`, {
            ...getAuthHeader(),
            params: { date }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching nutrition summary:', error);
        throw error;
    }
};

const mealPlanApi = {
    getMealPlans,
    createMealPlan,
    updateMealPlan,
    deleteMealPlan,
    getNutritionSummary
};

export default mealPlanApi;
