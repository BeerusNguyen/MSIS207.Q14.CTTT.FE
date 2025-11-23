import React from 'react'

import SavedRecipe from './SavedRecipe';
const SearchResults = ({recipeData,fetchError,searchVal}) => {
  return (
    <>

        <SavedRecipe savedData={recipeData} fetchError={fetchError} who={"search"} head={"Your Search Results"} searchVal={searchVal}/>
    </>
  )
}

export default SearchResults