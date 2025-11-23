import React, { useState, useEffect } from 'react'
import './index.css';
import Itemm from './Itemm';
import { Link } from 'react-router-dom';
import Header from './Header';

const SavedRecipe = ({savedData,fetchError,who,head,searchVal}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const recipesPerPage = 10; // Changed from 10 to 20 recipes per page

    // Reset to page 1 when savedData changes
    useEffect(() => {
        setCurrentPage(1);
    }, [savedData]);

    // Calculate pagination
    const indexOfLastRecipe = currentPage * recipesPerPage;
    const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
    const currentRecipes = savedData.slice(indexOfFirstRecipe, indexOfLastRecipe);
    const totalPages = Math.ceil(savedData.length / recipesPerPage);

    // Generate page numbers
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;
        
        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <>
        <Header/>
        <div className='saved-recipes'>
            
            <div className='saved-head'>{head}</div>
            <div className='recipe-grid'>
            {   !fetchError?
                savedData.length!==0?
                currentRecipes.map((saved,index) => {
                    const actualIndex = indexOfFirstRecipe + index;
                    return (
                        <div className='saved-box' key={actualIndex}>
                            {who?
                            <Link to={`/results/${actualIndex}`} className='link'><Itemm saved={saved} index={actualIndex}/></Link>
                            :
                            <Link to={`/saved/${actualIndex}`} className='link'><Itemm saved={saved} index={actualIndex}/></Link>
                            }
                        </div>
                    );
                }):who?<p className='msg'>Your results are loading for {searchVal}...</p>:<p className='msg'>Your saved list is empty</p>
                    :<p className='error-msg'>Oops! {fetchError} :( </p>
            }
            </div>

            {/* Pagination Controls */}
            {!fetchError && savedData.length > recipesPerPage && (
                <div className='pagination'>
                    <button 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className='pagination-btn'
                    >
                        Previous
                    </button>

                    {getPageNumbers().map((page, index) => (
                        page === '...' ? (
                            <span key={`ellipsis-${index}`} className='pagination-ellipsis'>...</span>
                        ) : (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={currentPage === page ? 'pagination-btn active' : 'pagination-btn'}
                            >
                                {page}
                            </button>
                        )
                    ))}

                    <button 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className='pagination-btn'
                    >
                        Next
                    </button>

                    <span className='pagination-info'>
                        Page {currentPage} of {totalPages} ({savedData.length} recipes)
                    </span>
                </div>
            )}
        </div>
        </>
    )
}

export default SavedRecipe