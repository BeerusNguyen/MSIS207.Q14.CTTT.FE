import {Routes,Route, Navigate} from 'react-router-dom';
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
import Login from './Login';
import Register from './Register';
import ProtectedRoute from './ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import VerifyEmail from './VerifyEmail';
import ShoppingListPage from './ShoppingListPage';


import Discover from './Discover';


function AppContent() {
  const { isAuthenticated } = useAuth();
  const [savedData,setSavedData] = useState([]);
  const [fetchError,setFetchError] = useState(null);
  const [searchVal,setSearchVal] = useState("");
  const [recipeData,setrecipeData] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) return; // Don't fetch if not authenticated
    
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
}, [isAuthenticated])
  
  return (
    <div className="App">
      <Routes>
        {/* Public routes */}
        <Route path='/login' element={
          isAuthenticated ? <Navigate to="/" replace /> : <Login />
        }/>
        <Route path='/register' element={
          isAuthenticated ? <Navigate to="/" replace /> : <Register />
        }/>
        <Route path='/forgot-password' element={<ForgotPassword/>} />
        <Route path='/reset-password' element={<ResetPassword/>} />
        <Route path='/verify-email' element={<VerifyEmail/>} />

        {/* Protected routes */}
        <Route path='/' element={
          <ProtectedRoute>
            <Home searchVal={searchVal} setSearchVal={setSearchVal} recipeData={recipeData} setrecipeData={setrecipeData} fetchError={fetchError} setFetchError={setFetchError}/>
          </ProtectedRoute>
        }/>
        <Route path='/about' element={
          <ProtectedRoute>
            <About/>
          </ProtectedRoute>
        }/>
        <Route path='/explore' element={
          <ProtectedRoute>
            <Explore/>
          </ProtectedRoute>
        }/>
        <Route path='/explore/:id' element={
          <ProtectedRoute>
            <ExploreRecipeDetail/>
          </ProtectedRoute>
        }/>

        <Route path='/discover' element={
          <ProtectedRoute>
            <Discover/>
          </ProtectedRoute>
        }/>

        <Route path='/mealplan' element={
          <ProtectedRoute>
            <MealPlannerPage/>
          </ProtectedRoute>
        }/>

        <Route path='/shopping-list' element={
          <ProtectedRoute>
            <ShoppingListPage/>
          </ProtectedRoute>
        }/>

        <Route path='/saved' element={
          <ProtectedRoute>
            <SavedRecipe savedData={savedData} fetchError={fetchError} who={""} head={"Your Saved Recipes"} searchVal={""}/>
          </ProtectedRoute>
        }/>
        <Route path='/saved/:id' element={
          <ProtectedRoute>
            <SavedRecNavig savedData={savedData} setSavedData={setSavedData} />
          </ProtectedRoute>
        }/>
        

        <Route path='/results' element={
          <ProtectedRoute>
            <SearchResults recipeData={recipeData} fetchError={fetchError} searchVal={searchVal} />
          </ProtectedRoute>
        }/>

        <Route path='/results/:id' element={
          <ProtectedRoute>
            <SearchRecNavig recipeData={recipeData} savedData={savedData} setSavedData={setSavedData} searchVal={searchVal}  />
          </ProtectedRoute>
        }/>

       

      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ModalProvider>
        <AppContent />
      </ModalProvider>
    </AuthProvider>
  );
}

export default App;
