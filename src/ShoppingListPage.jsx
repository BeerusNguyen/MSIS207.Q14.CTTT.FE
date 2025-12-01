import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import { 
    MdRestaurantMenu, 
    MdCalendarMonth, 
    MdBookmark, 
    MdShoppingCart,
    MdAdd,
    MdDelete,
    MdCheckCircle,
    MdRadioButtonUnchecked,
    MdClear,
    MdExpandMore,
    MdExpandLess,
    MdEdit,
    MdSave,
    MdClose,
    MdPlaylistAdd
} from 'react-icons/md';
import { useModal } from './context/ModalContext';
import {
    getShoppingList,
    addShoppingItem,
    addItemsFromMealPlan,
    toggleItemPurchased,
    updateShoppingItem,
    deleteShoppingItem,
    clearPurchasedItems,
    clearAllItems
} from './api/shoppingListApi';
import './ShoppingList.css';

const ShoppingListPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [groupBy, setGroupBy] = useState('recipe'); // 'recipe' or 'category'
    const [expandedGroups, setExpandedGroups] = useState({});
    const [newItemName, setNewItemName] = useState('');
    const [newItemQuantity, setNewItemQuantity] = useState('');
    const [newItemCategory, setNewItemCategory] = useState('Other');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [mealPlanDate, setMealPlanDate] = useState('');
    const { showSuccess, showError, showConfirm } = useModal();

    // Categories for ingredients
    const categories = [
        'Produce', 'Meat & Seafood', 'Dairy', 'Bakery', 
        'Pantry', 'Frozen', 'Beverages', 'Spices', 'Other'
    ];

    // Fetch shopping list
    const fetchShoppingList = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getShoppingList();
            setItems(data);
            // Initialize all groups as expanded
            const groups = {};
            data.forEach(item => {
                const groupKey = groupBy === 'recipe' ? item.recipe_title : item.category;
                groups[groupKey || 'Ungrouped'] = true;
            });
            setExpandedGroups(groups);
        } catch (error) {
            console.error('Error fetching shopping list:', error);
        }
        setLoading(false);
    }, [groupBy]);

    useEffect(() => {
        fetchShoppingList();
    }, [fetchShoppingList]);

    // Group items
    const groupedItems = items.reduce((acc, item) => {
        const key = groupBy === 'recipe' 
            ? (item.recipe_title || 'Manual Items') 
            : (item.category || 'Other');
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {});

    // Toggle group expansion
    const toggleGroup = (groupName) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupName]: !prev[groupName]
        }));
    };

    // Handle toggle purchased
    const handleTogglePurchased = async (itemId) => {
        try {
            await toggleItemPurchased(itemId);
            setItems(prev => prev.map(item => 
                item.id === itemId 
                    ? { ...item, is_checked: !item.is_checked }
                    : item
            ));
        } catch (error) {
            showError('Failed to update item', 'Error');
        }
    };

    // Handle add new item
    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!newItemName.trim()) return;

        try {
            const response = await addShoppingItem({
                ingredient: newItemName.trim(),
                quantity: newItemQuantity.trim() || ''
            });
            // Add the new item with its ID to the list
            const newItem = {
                id: response.id,
                ingredient: newItemName.trim(),
                quantity: newItemQuantity.trim() || '',
                category: newItemCategory,
                is_checked: false,
                recipe_title: null
            };
            setItems(prev => [...prev, newItem]);
            setNewItemName('');
            setNewItemQuantity('');
            setNewItemCategory('Other');
            setShowAddForm(false);
            showSuccess('Item added to shopping list!', 'Added');
        } catch (error) {
            showError('Failed to add item', 'Error');
        }
    };

    // Handle add from meal plan
    const handleAddFromMealPlan = async () => {
        if (!mealPlanDate) {
            showError('Please select a date', 'Error');
            return;
        }

        try {
            const result = await addItemsFromMealPlan(mealPlanDate);
            if (result.count > 0) {
                showSuccess(`Added ${result.count} items from meal plan!`, 'Added');
                fetchShoppingList();
            } else {
                showError('No meal plan found for this date. Go to Meal Planner to create one first!', 'No Meal Plan');
            }
        } catch (error) {
            showError(error.message || 'Failed to add items from meal plan', 'Error');
        }
    };

    // Handle edit item
    const handleSaveEdit = async () => {
        if (!editingItem) return;

        try {
            await updateShoppingItem(editingItem.id, {
                ingredient: editingItem.ingredient,
                quantity: editingItem.quantity
            });
            setItems(prev => prev.map(item => 
                item.id === editingItem.id ? editingItem : item
            ));
            setEditingItem(null);
            showSuccess('Item updated!', 'Updated');
        } catch (error) {
            showError('Failed to update item', 'Error');
        }
    };

    // Handle delete item
    const handleDeleteItem = async (itemId) => {
        try {
            await deleteShoppingItem(itemId);
            setItems(prev => prev.filter(item => item.id !== itemId));
            showSuccess('Item removed', 'Deleted');
        } catch (error) {
            showError('Failed to delete item', 'Error');
        }
    };

    // Handle clear purchased
    const handleClearPurchased = () => {
        const purchasedCount = items.filter(item => item.is_checked).length;
        if (purchasedCount === 0) {
            showError('No purchased items to clear', 'Info');
            return;
        }

        showConfirm(`Remove ${purchasedCount} purchased items?`, async () => {
            try {
                await clearPurchasedItems();
                setItems(prev => prev.filter(item => !item.is_checked));
                showSuccess('Purchased items cleared!', 'Cleared');
            } catch (error) {
                showError('Failed to clear items', 'Error');
            }
        });
    };

    // Handle clear all
    const handleClearAll = () => {
        if (items.length === 0) {
            showError('Shopping list is already empty', 'Info');
            return;
        }

        showConfirm('Clear entire shopping list?', async () => {
            try {
                await clearAllItems();
                setItems([]);
                showSuccess('Shopping list cleared!', 'Cleared');
            } catch (error) {
                showError('Failed to clear list', 'Error');
            }
        }, { title: 'Clear All', confirmText: 'Clear All', cancelText: 'Cancel' });
    };

    // Calculate stats
    const totalItems = items.length;
    const purchasedItems = items.filter(item => item.is_checked).length;
    const remainingItems = totalItems - purchasedItems;

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
                    
                    <Link to="/mealplan" className='sidebar-link'>
                        <MdCalendarMonth className='sidebar-icon' />
                        <span>Meal Planner</span>
                    </Link>
                    
                    <Link to="/saved" className='sidebar-link'>
                        <MdBookmark className='sidebar-icon' />
                        <span>Saved Recipes</span>
                    </Link>

                    <Link to="/shopping-list" className='sidebar-link active'>
                        <MdShoppingCart className='sidebar-icon' />
                        <span>Shopping List</span>
                    </Link>
                </nav>

                <div className='sidebar-info'>
                    <p>Keep track of ingredients you need to buy for your meal plans!</p>
                </div>
            </aside>

            {/* Main Content */}
            <div className='home-main'>
                <Header />
                
                <div className='shopping-list-container'>
                    {/* Header Section */}
                    <div className='shopping-header'>
                        <div className='shopping-title'>
                            <MdShoppingCart className='title-icon' />
                            <h1>Shopping List</h1>
                        </div>

                        {/* Stats */}
                        <div className='shopping-stats'>
                            <div className='stat-item'>
                                <span className='stat-number'>{totalItems}</span>
                                <span className='stat-label'>Total</span>
                            </div>
                            <div className='stat-item purchased'>
                                <span className='stat-number'>{purchasedItems}</span>
                                <span className='stat-label'>Bought</span>
                            </div>
                            <div className='stat-item remaining'>
                                <span className='stat-number'>{remainingItems}</span>
                                <span className='stat-label'>Remaining</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className='shopping-actions'>
                        <div className='action-buttons'>
                            <button 
                                className='action-btn add-btn'
                                onClick={() => setShowAddForm(!showAddForm)}
                            >
                                <MdAdd /> Add Item
                            </button>
                            
                            <div className='meal-plan-import'>
                                <input 
                                    type="date" 
                                    value={mealPlanDate}
                                    onChange={(e) => setMealPlanDate(e.target.value)}
                                    className='date-input'
                                />
                                <button 
                                    className='action-btn import-btn'
                                    onClick={handleAddFromMealPlan}
                                >
                                    <MdPlaylistAdd /> From Meal Plan
                                </button>
                            </div>
                        </div>

                        <div className='view-options'>
                            <span>Group by:</span>
                            <select 
                                value={groupBy} 
                                onChange={(e) => setGroupBy(e.target.value)}
                                className='group-select'
                            >
                                <option value="recipe">Recipe</option>
                                <option value="category">Category</option>
                            </select>

                            <button 
                                className='clear-btn'
                                onClick={handleClearPurchased}
                            >
                                <MdCheckCircle /> Clear Bought
                            </button>
                            <button 
                                className='clear-btn danger'
                                onClick={handleClearAll}
                            >
                                <MdClear /> Clear All
                            </button>
                        </div>
                    </div>

                    {/* Add Item Form */}
                    {showAddForm && (
                        <form className='add-item-form' onSubmit={handleAddItem}>
                            <input
                                type="text"
                                placeholder="Item name..."
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                className='item-input'
                                autoFocus
                            />
                            <input
                                type="text"
                                placeholder="Quantity"
                                value={newItemQuantity}
                                onChange={(e) => setNewItemQuantity(e.target.value)}
                                className='quantity-input'
                            />
                            <select
                                value={newItemCategory}
                                onChange={(e) => setNewItemCategory(e.target.value)}
                                className='category-select'
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <button type="submit" className='submit-btn'>
                                <MdAdd /> Add
                            </button>
                            <button 
                                type="button" 
                                className='cancel-btn'
                                onClick={() => setShowAddForm(false)}
                            >
                                <MdClose />
                            </button>
                        </form>
                    )}

                    {/* Shopping List Content */}
                    {loading ? (
                        <div className='loading-state'>
                            <div className='loading-spinner'></div>
                            <p>Loading shopping list...</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className='empty-state'>
                            <MdShoppingCart className='empty-icon' />
                            <h3>Your shopping list is empty</h3>
                            <p>Add items manually or import from your meal plan!</p>
                        </div>
                    ) : (
                        <div className='shopping-groups'>
                            {Object.entries(groupedItems).map(([groupName, groupItems]) => (
                                <div key={groupName} className='shopping-group'>
                                    <div 
                                        className='group-header'
                                        onClick={() => toggleGroup(groupName)}
                                    >
                                        <div className='group-info'>
                                            {expandedGroups[groupName] ? <MdExpandLess /> : <MdExpandMore />}
                                            <h3>{groupName}</h3>
                                            <span className='group-count'>
                                                {groupItems.filter(i => i.is_checked).length}/{groupItems.length}
                                            </span>
                                        </div>
                                        <div className='group-progress'>
                                            <div 
                                                className='progress-bar'
                                                style={{ 
                                                    width: `${(groupItems.filter(i => i.is_checked).length / groupItems.length) * 100}%` 
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {expandedGroups[groupName] && (
                                        <ul className='item-list'>
                                            {groupItems.map(item => (
                                                <li 
                                                    key={item.id} 
                                                    className={`shopping-item ${item.is_checked ? 'purchased' : ''}`}
                                                >
                                                    {editingItem?.id === item.id ? (
                                                        <div className='edit-form'>
                                                            <input
                                                                type="text"
                                                                value={editingItem.ingredient}
                                                                onChange={(e) => setEditingItem({
                                                                    ...editingItem,
                                                                    ingredient: e.target.value
                                                                })}
                                                            />
                                                            <input
                                                                type="text"
                                                                value={editingItem.quantity}
                                                                onChange={(e) => setEditingItem({
                                                                    ...editingItem,
                                                                    quantity: e.target.value
                                                                })}
                                                            />
                                                            <select
                                                                value={editingItem.category || 'Other'}
                                                                onChange={(e) => setEditingItem({
                                                                    ...editingItem,
                                                                    category: e.target.value
                                                                })}
                                                            >
                                                                {categories.map(cat => (
                                                                    <option key={cat} value={cat}>{cat}</option>
                                                                ))}
                                                            </select>
                                                            <button onClick={handleSaveEdit}>
                                                                <MdSave />
                                                            </button>
                                                            <button onClick={() => setEditingItem(null)}>
                                                                <MdClose />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <button 
                                                                className='check-btn'
                                                                onClick={() => handleTogglePurchased(item.id)}
                                                            >
                                                                {item.is_checked 
                                                                    ? <MdCheckCircle className='checked' />
                                                                    : <MdRadioButtonUnchecked />
                                                                }
                                                            </button>
                                                            <div className='item-details'>
                                                                <span className='item-name'>{item.ingredient}</span>
                                                                {item.quantity && <span className='item-quantity'>{item.quantity}</span>}
                                                                {groupBy === 'recipe' && item.category && (
                                                                    <span className='item-category'>{item.category}</span>
                                                                )}
                                                            </div>
                                                            <div className='item-actions'>
                                                                <button 
                                                                    className='edit-btn'
                                                                    onClick={() => setEditingItem(item)}
                                                                >
                                                                    <MdEdit />
                                                                </button>
                                                                <button 
                                                                    className='delete-btn'
                                                                    onClick={() => handleDeleteItem(item.id)}
                                                                >
                                                                    <MdDelete />
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShoppingListPage;
