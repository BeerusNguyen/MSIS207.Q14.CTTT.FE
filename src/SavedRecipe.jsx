import React, { useState, useEffect, useCallback } from 'react'
import './index.css';
import './SavedRecipe.css';
import Itemm from './Itemm';
import { Link } from 'react-router-dom';
import Header from './Header';
import { MdRestaurantMenu, MdCalendarMonth, MdBookmark, MdFavorite, MdFavoriteBorder, MdShoppingCart } from 'react-icons/md';
import { getFavorites, removeFavorite } from './api/favoritesApi';
import { useModal } from './context/ModalContext';
import api1 from './api/fetchSaved';

const SavedRecipe = ({savedData: initialSavedData, fetchError, who, head, searchVal}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState('saved');
    const [favorites, setFavorites] = useState([]);
    const [savedRecipes, setSavedRecipes] = useState([]);
    const [loadingFavorites, setLoadingFavorites] = useState(false);
    const [loadingSaved, setLoadingSaved] = useState(false);
    const [removingId, setRemovingId] = useState(null);
    const { showSuccess, showError } = useModal();
    const recipesPerPage = 10;
    const isSearchMode = who === 'search';

    const fetchSavedRecipes = useCallback(async () => {
        if (isSearchMode) return;
        setLoadingSaved(true);
        try {
            const response = await api1.get('/recipes');
            setSavedRecipes(response.data);
        } catch (error) {
            console.error('Error fetching saved recipes:', error);
        }
        setLoadingSaved(false);
    }, [isSearchMode]);

    const fetchUserFavorites = useCallback(async () => {
        if (isSearchMode) return;
        setLoadingFavorites(true);
        try {
            const data = await getFavorites();
            setFavorites(data);
        } catch (error) {
            console.error('Error fetching favorites:', error);
        }
        setLoadingFavorites(false);
    }, [isSearchMode]);

    useEffect(() => {
        if (!isSearchMode) {
            fetchSavedRecipes();
            fetchUserFavorites();
        }
    }, [isSearchMode, fetchSavedRecipes, fetchUserFavorites]);

    useEffect(() => { setCurrentPage(1); }, [savedRecipes, activeTab, initialSavedData]);

    const currentData = isSearchMode ? (initialSavedData || []) : (activeTab === 'saved' ? savedRecipes : favorites);
    const indexOfLastRecipe = currentPage * recipesPerPage;
    const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
    const currentRecipes = currentData.slice(indexOfFirstRecipe, indexOfLastRecipe);
    const totalPages = Math.ceil(currentData.length / recipesPerPage);

    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 5) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
        else {
            if (currentPage <= 3) { for (let i = 1; i <= 4; i++) pages.push(i); pages.push('...'); pages.push(totalPages); }
            else if (currentPage >= totalPages - 2) { pages.push(1); pages.push('...'); for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i); }
            else { pages.push(1); pages.push('...'); pages.push(currentPage - 1); pages.push(currentPage); pages.push(currentPage + 1); pages.push('...'); pages.push(totalPages); }
        }
        return pages;
    };

    const handlePageChange = (pageNumber) => { if (pageNumber >= 1 && pageNumber <= totalPages) { setCurrentPage(pageNumber); window.scrollTo({ top: 0, behavior: 'smooth' }); } };

    const handleUnfavorite = async (e, recipeId) => {
        e.preventDefault(); e.stopPropagation();
        if (removingId === recipeId) return;
        setRemovingId(recipeId);
        try { await removeFavorite(recipeId); setFavorites(prev => prev.filter(fav => fav.recipe_id !== recipeId)); showSuccess('Removed from favorites!', 'Unfavorited'); }
        catch (error) { showError('Failed to remove from favorites', 'Error'); }
        setRemovingId(null);
    };

    return (
        <div className='home-layout'>
            <aside className='sidebar'>
                <div className='sidebar-logo'><img src={process.env.PUBLIC_URL + '/Gemini_Generated_Image_5vl4c25vl4c25vl4.png'} alt="Logo" /><h2>Recipe Finder</h2></div>
                <nav className='sidebar-nav'>
                    <Link to="/discover" className={'sidebar-link ' + (who === 'search' ? 'active' : '')}><MdRestaurantMenu className='sidebar-icon' /><span>Discover Recipes</span></Link>
                    <Link to="/mealplan" className='sidebar-link'><MdCalendarMonth className='sidebar-icon' /><span>Meal Planner</span></Link>
                    <Link to="/saved" className={'sidebar-link ' + (!who ? 'active' : '')}><MdBookmark className='sidebar-icon' /><span>Saved Recipes</span></Link>
                    <Link to="/shopping-list" className='sidebar-link'><MdShoppingCart className='sidebar-icon' /><span>Shopping List</span></Link>
                </nav>
                <div className='sidebar-info'><p>Discover thousands of delicious recipes and plan your meals for the whole week!</p></div>
            </aside>
            <div className='home-main'>
                <Header/>
                <div className='saved-recipes'>
                    {!who && (<div className='saved-tabs'>
                        <button className={'saved-tab ' + (activeTab === 'saved' ? 'active' : '')} onClick={() => setActiveTab('saved')}><MdBookmark /><span>Saved Recipes</span><span className='tab-count'>{savedRecipes.length}</span></button>
                        <button className={'saved-tab ' + (activeTab === 'favorites' ? 'active' : '')} onClick={() => setActiveTab('favorites')}><MdFavorite /><span>Favorites</span><span className='tab-count'>{favorites.length}</span></button>
                    </div>)}
                    <div className='saved-head'>{who ? head : (activeTab === 'saved' ? 'Your Saved Recipes' : 'Your Favorites')}</div>
                    {!isSearchMode && activeTab === 'saved' && loadingSaved && (<div className='favorites-loading'><div className='loading-spinner'></div><p>Loading saved recipes...</p></div>)}
                    {!isSearchMode && activeTab === 'favorites' && loadingFavorites && (<div className='favorites-loading'><div className='loading-spinner'></div><p>Loading favorites...</p></div>)}
                    {(isSearchMode || !((activeTab === 'favorites' && loadingFavorites) || (activeTab === 'saved' && loadingSaved))) && (
                        <div className='recipe-grid'>
                            {!fetchError ? (currentData.length !== 0 ? (currentRecipes.map((saved, index) => {
                                const actualIndex = indexOfFirstRecipe + index;
                                return (<div className='saved-box' key={saved.id || saved.recipe_id || actualIndex}>
                                    {activeTab === 'favorites' && !isSearchMode ? (
                                        <div className='favorite-card'><div className='favorite-item'><div className='favorite-image'><img src={saved.image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400'} alt={saved.title} onError={(e) => {e.target.src = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400'}}/></div><div className='favorite-info'><h3 className='favorite-title'>{saved.title}</h3><span className='favorite-source'>{saved.source_type === 'spoonacular' ? 'Spoonacular' : saved.source_type === 'themealdb' ? 'TheMealDB' : 'Local'}</span></div></div><button className='unfavorite-btn' onClick={(e) => handleUnfavorite(e, saved.recipe_id)} disabled={removingId === saved.recipe_id} title='Remove from favorites'>{removingId === saved.recipe_id ? '...' : <MdFavorite />}</button></div>
                                    ) : isSearchMode ? (<Link to={'/results/' + actualIndex} className='link'><Itemm saved={saved} index={actualIndex}/></Link>) : (<Link to={'/saved/' + saved.id} className='link'><Itemm saved={saved} index={actualIndex}/></Link>)}
                                </div>);
                            })) : (activeTab === 'favorites' && !isSearchMode ? (<div className='empty-favorites'><MdFavoriteBorder className='empty-icon' /><p className='msg'>You have not added any favorites yet!</p><p className='sub-msg'>Click the heart button on recipes to add them here.</p><Link to="/discover" className='discover-link'>Discover Recipes</Link></div>) : isSearchMode ? (<p className='msg'>No recipes found. Try another keyword!</p>) : (<p className='msg'>Your saved list is empty</p>))) : (<p className='error-msg'>Oops! {fetchError}</p>)}
                        </div>
                    )}
                    {!fetchError && currentData.length > recipesPerPage && (<div className='pagination'><button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className='pagination-btn'>Previous</button>{getPageNumbers().map((page, index) => (page === '...' ? (<span key={'ellipsis-' + index} className='pagination-ellipsis'>...</span>) : (<button key={page} onClick={() => handlePageChange(page)} className={currentPage === page ? 'pagination-btn active' : 'pagination-btn'}>{page}</button>)))}<button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className='pagination-btn'>Next</button><span className='pagination-info'>Page {currentPage} of {totalPages} ({currentData.length} recipes)</span></div>)}
                </div>
            </div>
        </div>
    )
}

export default SavedRecipe
