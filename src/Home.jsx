import React from 'react'
import './index.css';
import Header from './Header';
import Main from './Main';
import OptionsBar from './OptionsBar';

const Home = ({searchVal,setSearchVal,recipeData,setrecipeData,fetchError,setFetchError}) => {
  
  return (
    <>
    <Header/>
    <Main setSearchVal={setSearchVal} searchVal={searchVal} recipeData={recipeData} setrecipeData={setrecipeData} setFetchError={setFetchError} />
    <OptionsBar/>
    <br /><br /><br /><br /><br /><br />
    </>
  )
}

export default Home