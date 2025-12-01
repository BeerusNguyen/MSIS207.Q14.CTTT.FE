import React from 'react'
import './index.css';
import { Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useModal } from './context/ModalContext';

const Header = () => {
  const { user, logout } = useAuth();
  const { showConfirm } = useModal();

  const handleLogout = () => {
    showConfirm(
      'Are you sure you want to log out?',
      () => {
        logout();
      },
      {
        title: 'Confirm Logout',
        type: 'warning',
        confirmText: 'Logout',
        cancelText: 'Cancel'
      }
    );
  };

  return (
    <header>
      <div className='logo'>
      <h4>Recipe Finder App</h4>
      </div>
    
      <nav>
          <ul className='navig'>
              <li><Link to="/" className='link'>Home</Link></li>
              {user && (
                <>
                  <li className='user-info'>
                    <span className='username'>👤 {user.username}</span>
                  </li>
                  <li>
                    <button onClick={handleLogout} className='logout-btn'>
                      Logout
                    </button>
                  </li>
                </>
              )}
          </ul>
      </nav>
       
        
    </header>
  )
}

export default Header