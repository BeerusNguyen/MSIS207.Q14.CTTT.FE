import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Load user info
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.error('Failed to load user:', error);
      // Token might be invalid
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        username,
        password
      });

      // Check if email verification is required
      if (response.data.requiresVerification) {
        console.log('⚠️ Email verification required for:', response.data.email);
        return {
          requiresVerification: true,
          email: response.data.email,
          message: response.data.message
        };
      }

      const { token: newToken, user: userData } = response.data;
      
      // Save token
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      console.log('✅ Login successful:', userData.username);
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login failed';
      throw new Error(message);
    }
  };

  const register = async (username, email, password) => {
    try {
      console.log('📤 Sending registration request:', {
        url: 'http://localhost:3000/api/auth/register',
        data: { username, email, password: '***' }
      });

      const response = await axios.post('http://localhost:3000/api/auth/register', {
        username,
        email,
        password
      });

      console.log('📥 Registration response:', response.data);

      // Check if email verification is required (new flow)
      if (response.data.requiresVerification) {
        console.log('✅ Registration successful, email verification required');
        return {
          success: true,
          requiresVerification: true,
          message: response.data.message
        };
      }

      // Old flow (if verification is not required)
      const { token: newToken, user: userData } = response.data;
      
      // Save token
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      console.log('✅ Registration successful:', userData.username);
      return userData;
    } catch (error) {
      console.error('❌ Registration error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      const message = error.response?.data?.message 
        || error.response?.data?.error
        || error.message 
        || 'Registration failed';
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    console.log('✅ Logged out');
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
