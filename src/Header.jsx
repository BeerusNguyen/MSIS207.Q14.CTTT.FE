import React from 'react'
import './index.css';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header>
      <div className='logo'>
      <img src={`${process.env.PUBLIC_URL}/logo_smalll.jpeg`} className='small-logo' alt="Logo" width="50px" height="50px" />
      <h4>Recipe Finder App</h4>
      </div>
    
      <nav>
          <ul className='navig'>
              <li><Link to="/" className='link'>Home</Link></li>
              <li><Link to="/explore" className='link'>Explore</Link></li>
          </ul>
      </nav>
       
        
    </header>
  )
}

export default Header