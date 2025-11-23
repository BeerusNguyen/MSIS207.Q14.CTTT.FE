import React from 'react'
import { Link } from 'react-router-dom'

const OptionsBar = () => {
  return (

    <div className='opt-bar'>
        <h1 className='opt-head'>What do you want to do?</h1>
        
        <div className='opt-content'>
            <Link to="/discover" className='opt-cont-link'>
                <div className='opt-cont'>
                    <img src={`${process.env.PUBLIC_URL}/recipe_icon.webp`} alt="" width="150px" height="150px" className='icon-img'/>
                    
                    <h2>Discover Recipes</h2>
                    <p className='opt-deet'>Create Magic with Your Ingredients</p>
                </div>
            </Link>

            <Link to="/mealplan" className='opt-cont-link'>
                <div className='opt-cont'>
                    <img src={`${process.env.PUBLIC_URL}/nut_icon.png`} alt="" width="150px" height="150px" className='icon-img'/>
                    <h2>Meal Planner</h2>
                    <p className='opt-deet'>Get your Meal Planned for the entire day</p>
                </div>
            </Link>

            <Link to="/saved" className='opt-cont-link'>
                <div className='opt-cont'>
                    <img src={`${process.env.PUBLIC_URL}/save_icon.png`} alt="" width="150px" height="150px" className='icon-img'/>
                    <h2>Saved</h2>
                    <p className='opt-deet'>View your previously saved recipes</p>
                </div>
            </Link>
        </div>
    </div>
    
  )
}

export default OptionsBar