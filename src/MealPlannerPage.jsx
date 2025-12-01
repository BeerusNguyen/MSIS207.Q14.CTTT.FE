import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import { MdRestaurantMenu, MdCalendarMonth, MdBookmark, MdChevronLeft, MdChevronRight, MdAdd, MdEdit, MdDelete, MdAutoAwesome, MdShoppingCart } from 'react-icons/md';
import { useModal } from './context/ModalContext';
import { getMealPlans, createMealPlan, updateMealPlan, deleteMealPlan } from './api/mealPlanApi';
import getMealPlanFromAPI from './api/fetchMealPlan';
import './MealPlanner.css';

const MealPlannerPage = () => {
    const { showSuccess, showError, showConfirm, showWarning } = useModal();
    
    // States
    const [loading, setLoading] = useState(false);
    const [mealPlans, setMealPlans] = useState([]);
    const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()));
    
    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editingMeal, setEditingMeal] = useState(null);
    const [mealFormData, setMealFormData] = useState({
        date: '',
        meal_type: 'breakfast',
        notes: ''
    });

    // Generate meal plan states
    const [targetCal, setTargetCal] = useState(2000);
    const [diet, setDiet] = useState('');
    const [exclude, setExclude] = useState('');
    const [generating, setGenerating] = useState(false);
    
    // Generate modal states
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [generateDate, setGenerateDate] = useState(null);
    const [generateMealType, setGenerateMealType] = useState('dinner');

    // Get week start date (Monday)
    function getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    }

    // Format date for display
    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
    };

    // Format date for API (using local timezone)
    const formatDateForAPI = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Get week days array
    const getWeekDays = () => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(currentWeekStart);
            day.setDate(day.getDate() + i);
            days.push(day);
        }
        return days;
    };

    // Check if date is today
    const isToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    // Navigate weeks
    const prevWeek = () => {
        const newStart = new Date(currentWeekStart);
        newStart.setDate(newStart.getDate() - 7);
        setCurrentWeekStart(newStart);
    };

    const nextWeek = () => {
        const newStart = new Date(currentWeekStart);
        newStart.setDate(newStart.getDate() + 7);
        setCurrentWeekStart(newStart);
    };

    const goToToday = () => {
        setCurrentWeekStart(getWeekStart(new Date()));
    };

    // Fetch meal plans for current week
    const fetchMealPlans = useCallback(async () => {
        setLoading(true);
        try {
            const weekEnd = new Date(currentWeekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            
            const data = await getMealPlans(
                formatDateForAPI(currentWeekStart),
                formatDateForAPI(weekEnd)
            );
            setMealPlans(data);
        } catch (error) {
            console.error('Error fetching meal plans:', error);
        } finally {
            setLoading(false);
        }
    }, [currentWeekStart]);

    useEffect(() => {
        fetchMealPlans();
    }, [fetchMealPlans]);

    // Get meals for a specific date and meal type
    const getMealsForSlot = (date, mealType) => {
        const dateStr = formatDateForAPI(date);
        return mealPlans.filter(
            meal => meal.date && meal.date.split('T')[0] === dateStr && meal.meal_type === mealType
        );
    };

    // Open add meal modal
    const openAddModal = (date, mealType) => {
        setEditingMeal(null);
        setMealFormData({
            date: formatDateForAPI(date),
            meal_type: mealType,
            notes: ''
        });
        setShowModal(true);
    };

    // Open generate modal for specific date and meal type
    const openGenerateModal = (date, mealType) => {
        setGenerateDate(date);
        setGenerateMealType(mealType);
        setShowGenerateModal(true);
    };

    // Close generate modal
    const closeGenerateModal = () => {
        setShowGenerateModal(false);
        setGenerateDate(null);
    };

    // Open edit meal modal
    const openEditModal = (meal) => {
        setEditingMeal(meal);
        setMealFormData({
            date: meal.date.split('T')[0],
            meal_type: meal.meal_type,
            notes: meal.notes || ''
        });
        setShowModal(true);
    };

    // Close modal
    const closeModal = () => {
        setShowModal(false);
        setEditingMeal(null);
        setMealFormData({
            date: '',
            meal_type: 'breakfast',
            notes: ''
        });
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (editingMeal) {
                await updateMealPlan(editingMeal.id, mealFormData);
                showSuccess('Meal plan updated successfully!', 'Updated');
            } else {
                await createMealPlan(mealFormData);
                showSuccess('Meal plan created successfully!', 'Created');
            }
            closeModal();
            fetchMealPlans();
        } catch (error) {
            showError('Failed to save meal plan', 'Error');
        }
    };

    // Handle delete meal
    const handleDelete = async (meal) => {
        showConfirm(
            `Are you sure you want to delete this meal plan?`,
            async () => {
                try {
                    await deleteMealPlan(meal.id);
                    showSuccess('Meal plan deleted!', 'Deleted');
                    fetchMealPlans();
                } catch (error) {
                    showError('Failed to delete meal plan', 'Error');
                }
            },
            {
                title: 'Delete Meal Plan',
                type: 'warning',
                confirmText: 'Delete',
                cancelText: 'Cancel'
            }
        );
    };

    // Generate meal plan from Spoonacular API
    const generateMealPlan = async (e) => {
        e.preventDefault();
        
        if (targetCal < 1000 || targetCal > 5000) {
            showWarning('Please enter target calories between 1000-5000', 'Invalid Input');
            return;
        }

        setGenerating(true);
        try {
            const data = await getMealPlanFromAPI(targetCal, diet, exclude);
            
            if (data && data.meals) {
                // Always use today's date for the top form, or the specific generateDate for the modal
                const today = new Date();
                const targetDate = generateDate || today;
                const dateString = formatDateForAPI(targetDate);
                console.log('Generating for date:', dateString, 'targetDate:', targetDate);
                
                if (generateDate && generateMealType) {
                    // Generate for specific meal type - get the matching meal from API response
                    const mealIndex = generateMealType === 'breakfast' ? 0 : 
                                     generateMealType === 'lunch' ? 1 : 
                                     generateMealType === 'dinner' ? 2 : 0;
                    const meal = data.meals[mealIndex] || data.meals[0];
                    
                    // Calculate calories for single meal (roughly 1/3 of daily)
                    const mealCalories = Math.round(data.nutrients.calories / 3);
                    
                    await createMealPlan({
                        date: dateString,
                        meal_type: generateMealType,
                        notes: `${meal.title} - ${mealCalories} kcal, Ready in ${meal.readyInMinutes} mins`
                    });
                    
                    showSuccess(`Generated ${generateMealType} for ${formatDate(targetDate)}!`, 'Generated');
                    closeGenerateModal();
                } else {
                    // Generate all meals for today (original behavior)
                    const mealTypesArr = ['breakfast', 'lunch', 'dinner'];
                    
                    for (let i = 0; i < data.meals.length; i++) {
                        const meal = data.meals[i];
                        const mealCalories = Math.round(data.nutrients.calories / 3);
                        await createMealPlan({
                            date: dateString,
                            meal_type: mealTypesArr[i] || 'snack',
                            notes: `${meal.title} - ${mealCalories} kcal, Ready in ${meal.readyInMinutes} mins`
                        });
                    }
                    
                    showSuccess(`Generated ${data.meals.length} meals for today!`, 'Generated');
                }
                
                // Refresh meal plans
                fetchMealPlans();
            }
        } catch (error) {
            showError('Failed to generate meal plan', 'Error');
        } finally {
            setGenerating(false);
        }
    };

    // Meal type icons
    const mealTypeIcons = {
        breakfast: '🍳',
        lunch: '🥗',
        dinner: '🍝',
        snack: '🍎'
    };

    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    const weekDays = getWeekDays();
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <div className='home-layout'>
            {/* Sidebar */}
            <aside className='sidebar'>
                <div className='sidebar-logo'>
                    <img src={`${process.env.PUBLIC_URL}/Gemini_Generated_Image_5vl4c25vl4c25vl4.png`} alt="Logo" />
                    <h2>Recipe Finder</h2>
                </div>

                <nav className='sidebar-nav'>
                    <Link to="/discover" className='sidebar-link'>
                        <MdRestaurantMenu className='sidebar-icon' />
                        <span>Discover Recipes</span>
                    </Link>
                    
                    <Link to="/mealplan" className='sidebar-link active'>
                        <MdCalendarMonth className='sidebar-icon' />
                        <span>Meal Planner</span>
                    </Link>
                    
                    <Link to="/saved" className='sidebar-link'>
                        <MdBookmark className='sidebar-icon' />
                        <span>Saved Recipes</span>
                    </Link>

                    <Link to="/shopping-list" className='sidebar-link'>
                        <MdShoppingCart className='sidebar-icon' />
                        <span>Shopping List</span>
                    </Link>
                </nav>

                <div className='sidebar-info'>
                    <p>Plan your meals for the week and stay organized!</p>
                </div>
            </aside>

            {/* Main Content */}
            <div className='home-main'>
                <Header />
                
                <div className='meal-planner-container'>
                    {/* Header */}
                    <div className='meal-planner-header'>
                        <h1 className='meal-planner-title'>
                            📅 <span>Meal Planner</span>
                        </h1>
                        
                        <div className='date-navigation'>
                            <button className='date-nav-btn' onClick={prevWeek}>
                                <MdChevronLeft size={24} />
                            </button>
                            <span className='current-week'>
                                {formatDate(weekDays[0])} - {formatDate(weekDays[6])}
                            </span>
                            <button className='date-nav-btn' onClick={nextWeek}>
                                <MdChevronRight size={24} />
                            </button>
                            <button 
                                className='date-nav-btn' 
                                onClick={goToToday}
                                title="Go to today"
                                style={{ marginLeft: '10px', fontSize: '0.8rem', width: 'auto', padding: '0 15px' }}
                            >
                                Today
                            </button>
                        </div>
                    </div>

                    {/* Generate Meal Plan Section */}
                    <div className='generate-section'>
                        <h3><MdAutoAwesome /> Auto-Generate Meal Plan for Today</h3>
                        <form className='generate-form' onSubmit={generateMealPlan}>
                            <div className='form-group'>
                                <label>Target Calories</label>
                                <input 
                                    type="number" 
                                    value={targetCal}
                                    onChange={(e) => setTargetCal(e.target.value)}
                                    placeholder="e.g., 2000"
                                    min="1000"
                                    max="5000"
                                />
                            </div>
                            <div className='form-group'>
                                <label>Diet Type</label>
                                <select value={diet} onChange={(e) => setDiet(e.target.value)}>
                                    <option value="">Any</option>
                                    <option value="vegetarian">Vegetarian</option>
                                    <option value="vegan">Vegan</option>
                                    <option value="paleo">Paleo</option>
                                    <option value="ketogenic">Ketogenic</option>
                                    <option value="gluten free">Gluten Free</option>
                                </select>
                            </div>
                            <div className='form-group'>
                                <label>Exclude</label>
                                <input 
                                    type="text" 
                                    value={exclude}
                                    onChange={(e) => setExclude(e.target.value)}
                                    placeholder="e.g., shellfish, olives"
                                />
                            </div>
                            <button type="submit" className='generate-btn' disabled={generating}>
                                {generating ? '⏳ Generating...' : '✨ Generate'}
                            </button>
                        </form>
                    </div>

                    {/* Week View */}
                    {loading ? (
                        <div className='meal-planner-loading'>
                            <div className='spinner'></div>
                            <p>Loading meal plans...</p>
                        </div>
                    ) : (
                        <div className='week-view'>
                            {weekDays.map((day, dayIndex) => (
                                <div 
                                    key={dayIndex} 
                                    className={`day-card ${isToday(day) ? 'today' : ''}`}
                                >
                                    <div className='day-header'>
                                        <div className='day-name'>
                                            {dayNames[dayIndex]}
                                            {isToday(day) && <span className='today-badge'>Today</span>}
                                        </div>
                                        <div className='day-date'>{day.getDate()}</div>
                                    </div>
                                    <div className='day-content'>
                                        {mealTypes.map(mealType => {
                                            const meals = getMealsForSlot(day, mealType);
                                            return (
                                                <div key={mealType} className='meal-slot'>
                                                    <div className='meal-slot-header'>
                                                        <span className='meal-type'>
                                                            <span className='meal-type-icon'>{mealTypeIcons[mealType]}</span>
                                                            {mealType}
                                                        </span>
                                                        <div className='meal-slot-actions'>
                                                            <button 
                                                                className='add-meal-btn generate'
                                                                onClick={() => openGenerateModal(day, mealType)}
                                                                title={`Generate ${mealType}`}
                                                            >
                                                                <MdAutoAwesome />
                                                            </button>
                                                            <button 
                                                                className='add-meal-btn'
                                                                onClick={() => openAddModal(day, mealType)}
                                                                title={`Add ${mealType} manually`}
                                                            >
                                                                <MdAdd />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    
                                                    {meals.length > 0 ? (
                                                        meals.map(meal => (
                                                            <div key={meal.id} className='meal-item-card'>
                                                                <div className='meal-item-title'>
                                                                    {meal.recipe_title || 'Custom Meal'}
                                                                </div>
                                                                {meal.notes && (
                                                                    <div className='meal-item-notes'>{meal.notes}</div>
                                                                )}
                                                                <div className='meal-item-actions'>
                                                                    <button 
                                                                        className='meal-action-btn edit'
                                                                        onClick={() => openEditModal(meal)}
                                                                    >
                                                                        <MdEdit />
                                                                    </button>
                                                                    <button 
                                                                        className='meal-action-btn delete'
                                                                        onClick={() => handleDelete(meal)}
                                                                    >
                                                                        <MdDelete />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className='empty-meal'>No meal planned</div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Meal Modal */}
            {showModal && (
                <div className='meal-modal-overlay' onClick={closeModal}>
                    <div className='meal-modal' onClick={e => e.stopPropagation()}>
                        <div className='meal-modal-header'>
                            <h2>{editingMeal ? '✏️ Edit Meal Plan' : '➕ Add Meal Plan'}</h2>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className='meal-modal-body'>
                                <div className='form-group'>
                                    <label>Date</label>
                                    <input 
                                        type="date" 
                                        value={mealFormData.date}
                                        onChange={(e) => setMealFormData({...mealFormData, date: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className='form-group'>
                                    <label>Meal Type</label>
                                    <select 
                                        value={mealFormData.meal_type}
                                        onChange={(e) => setMealFormData({...mealFormData, meal_type: e.target.value})}
                                        required
                                    >
                                        <option value="breakfast">🍳 Breakfast</option>
                                        <option value="lunch">🥗 Lunch</option>
                                        <option value="dinner">🍝 Dinner</option>
                                        <option value="snack">🍎 Snack</option>
                                    </select>
                                </div>
                                <div className='form-group'>
                                    <label>Notes / Description</label>
                                    <textarea 
                                        value={mealFormData.notes}
                                        onChange={(e) => setMealFormData({...mealFormData, notes: e.target.value})}
                                        placeholder="Add meal details, recipe name, or notes..."
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <div className='meal-modal-footer'>
                                <button type="button" className='modal-btn secondary' onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className='modal-btn primary'>
                                    {editingMeal ? 'Update' : 'Add Meal'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Generate Meal Modal */}
            {showGenerateModal && (
                <div className='meal-modal-overlay' onClick={closeGenerateModal}>
                    <div className='meal-modal generate-modal' onClick={e => e.stopPropagation()}>
                        <div className='meal-modal-header'>
                            <h2>✨ Generate {generateMealType}</h2>
                            <p className='modal-subtitle'>
                                for {generateDate && formatDate(generateDate)}
                            </p>
                        </div>
                        <form onSubmit={generateMealPlan}>
                            <div className='meal-modal-body'>
                                <div className='generate-info'>
                                    <div className='generate-info-item'>
                                        <span className='info-icon'>{mealTypeIcons[generateMealType]}</span>
                                        <span className='info-label'>Meal Type:</span>
                                        <span className='info-value'>{generateMealType}</span>
                                    </div>
                                    <div className='generate-info-item'>
                                        <span className='info-icon'>📅</span>
                                        <span className='info-label'>Date:</span>
                                        <span className='info-value'>{generateDate && generateDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                                    </div>
                                </div>
                                
                                <div className='form-group'>
                                    <label>🔥 Target Calories (Daily)</label>
                                    <input 
                                        type="number" 
                                        value={targetCal}
                                        onChange={(e) => setTargetCal(e.target.value)}
                                        placeholder="e.g., 2000"
                                        min="1000"
                                        max="5000"
                                        required
                                    />
                                    <small className='form-hint'>Your {generateMealType} will be ~{Math.round(targetCal/3)} kcal</small>
                                </div>
                                <div className='form-group'>
                                    <label>🥗 Diet Type</label>
                                    <select value={diet} onChange={(e) => setDiet(e.target.value)}>
                                        <option value="">Any</option>
                                        <option value="vegetarian">Vegetarian</option>
                                        <option value="vegan">Vegan</option>
                                        <option value="paleo">Paleo</option>
                                        <option value="ketogenic">Ketogenic</option>
                                        <option value="gluten free">Gluten Free</option>
                                    </select>
                                </div>
                                <div className='form-group'>
                                    <label>🚫 Exclude Ingredients</label>
                                    <input 
                                        type="text" 
                                        value={exclude}
                                        onChange={(e) => setExclude(e.target.value)}
                                        placeholder="e.g., shellfish, nuts, dairy"
                                    />
                                </div>
                            </div>
                            <div className='meal-modal-footer'>
                                <button type="button" className='modal-btn secondary' onClick={closeGenerateModal}>
                                    Cancel
                                </button>
                                <button type="submit" className='modal-btn primary' disabled={generating}>
                                    {generating ? '⏳ Generating...' : '✨ Generate Meal'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MealPlannerPage;
