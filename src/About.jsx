import React from 'react'
import Header from './Header';

import './index.css';
const About = () => {
  return (
    <div>
        <Header/>
        <center><h1>About Us</h1></center>
        <br />
        <div className='img-abt-holder'>
          <img src={`${process.env.PUBLIC_URL}/about_pic.jpeg`} alt="" className='about-img' height="500px" />
          </div>
        <div className='about-container'>
          <div>
            <p>Welcome to our Recipe Finder App, your ultimate culinary assistant designed to make cooking both easy and enjoyable. Whether you're a seasoned chef or just starting your culinary journey, our app offers a suite of features to enhance your cooking experience.</p>
            <br /><br />
            <h2>Key Features:</h2>
            <br />
            <h3>1. Find Recipes by Ingredients:</h3>
            <p>Have ingredients but not sure what to cook? Simply enter the items you have in your fridge or pantry, and our app will suggest recipes that use those ingredients. Minimize food waste and discover new dishes with what you already have at home.</p>

            <br />
            <h3>2. Nutrition Facts:</h3>
            <p>Curious about the nutritional content of your meals? Our app allows you to find detailed nutrition facts for any recipe. Stay informed about your dietary intake with comprehensive data on calories, macronutrients, vitamins, and minerals.</p>

            <br />
            <h3>3. Save Your Favorite Recipes:</h3>
            <p>Discover a recipe you love? Save it to your personal collection with just a click. Access your saved recipes anytime and keep your culinary inspirations organized.</p>

            <br />
            <h3>4. Browse Available Recipes:</h3>
            <p>Looking for new meal ideas? Browse through a wide variety of recipes, categorized by cuisine, meal type, and dietary preferences. Whether you’re in the mood for a quick snack or an elaborate dinner, you’ll find the perfect recipe to satisfy your cravings.</p>

            <br />
            <p>Our Recipe Finder App is designed to be intuitive and user-friendly, helping you make the most out of your cooking adventures. Join our community of food enthusiasts and start exploring delicious possibilities today!</p>
            <br />
            <hr /><hr /><hr />
            
          </div>
        </div>
        
    </div>
  )
}

export default About