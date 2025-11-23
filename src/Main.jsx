import React from 'react'
import './index.css';
import { Link } from 'react-router-dom';
import getRecipe from './api/fetchRecipe';

const Main = ({searchVal,setSearchVal,setrecipeData,setFetchError}) => {
    
  const searchBtn = async() => {
      console.log(searchVal);
      try {
        const data = await getRecipe(searchVal);
        setrecipeData(data);
        setFetchError('');
        
        // Save to sessionStorage for persistence on refresh
        const dataMap = {};
        data.forEach((recipe, index) => {
          dataMap[index] = recipe;
        });
        sessionStorage.setItem('searchResults', JSON.stringify(dataMap));
        
      } catch (error) {
        setFetchError('Failed to fetch recipe data. Please try again.');
      }
    }
  return (
    <main>
          <div className='main-left'>
            <h1 className='slogan'>Discover <span className='head-letter'>Flavor</span>,<br /> Uncover <br />Nutrition <br /></h1>
            <div className='search'>
                    <input 
                        type="text" 
                        className='search-recipe-input'
                        value={searchVal}
                        placeholder='Search for Recipes'
                        onChange={(e) => setSearchVal(e.target.value)}/>
                    <Link to="/results" className='link'><button className='browse-btn' onClick={()=>searchBtn()}>Browse</button></Link>
            </div>
          </div>

          <div className='main-right'>
            <img src={`${process.env.PUBLIC_URL}/header_picc.webp`} className='header-pic' alt="" />
          </div>
    </main>
  )
}

export default Main