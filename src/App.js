import {Routes,Route} from 'react-router-dom';
import Home from './Home';
import { useEffect,useState } from 'react';
import api1 from "./api/fetchSaved";
import About from './About';
import Explore from './Explore';
import ExploreRecipeDetail from './ExploreRecipeDetail';
import SearchResults from './SearchResults';
import MealPlannerPage from './MealPlannerPage';
import SearchRecNavig from './SearchRecNavig';
import SavedRecNavig from './SavedRecNavig';
import SavedRecipe from './SavedRecipe';


import Discover from './Discover';


function App() {
  const [savedData,setSavedData] = useState([]);
  const [fetchError,setFetchError] = useState(null);
  const [searchVal,setSearchVal] = useState("");
  const [recipeData,setrecipeData] = useState([]);

  const [nutriData,setNutriData] = useState([]);

  useEffect(() => {
    
    const fetchSavedData = async() => {
        try {
            const response = await api1.get('/recipes');
            setSavedData(response.data);
            setFetchError('');
        } catch (error) {
            setFetchError(error.message);
        }
        
    }
    (async () => await fetchSavedData())()
}, [])
  
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<Home searchVal={searchVal} setSearchVal={setSearchVal} recipeData={recipeData} setrecipeData={setrecipeData} fetchError={fetchError} setFetchError={setFetchError}/>}/>
        <Route path='/about' element={<About/>}/>
        <Route path='/explore' element={<Explore/>}/>
        <Route path='/explore/:id' element={<ExploreRecipeDetail/>}/>

        <Route path='/discover' element={<Discover/>}/>

        <Route path='/mealplan' element={<MealPlannerPage/>}/>

        <Route path='/saved' element={<SavedRecipe savedData={savedData} fetchError={fetchError} who={""} head={"Your Saved Recipes"} searchVal={""}/>}/>
        <Route path='/saved/:id' element={<SavedRecNavig savedData={savedData} setSavedData={setSavedData} setNutriData={setNutriData} />}/>
        

        <Route path='/results' element={<SearchResults recipeData={recipeData} fetchError={fetchError} searchVal={searchVal} />}/>

        <Route path='/results/:id' element={<SearchRecNavig nutriData={nutriData} setNutriData={setNutriData} recipeData={recipeData} savedData={savedData} setSavedData={setSavedData} searchVal={searchVal}  />}/>

       

      </Routes>
    </div>
  );
}

export default App;
