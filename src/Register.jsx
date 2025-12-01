import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Register.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function Register() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error for this field
    setErrors({
      ...errors,
      [e.target.name]: ''
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      console.log('🔐 Attempting registration:', {
        username: formData.username,
        email: formData.email
      });
      
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      console.log('✅ Registration response:', response.data);
      
      // Check if verification is required
      if (response.data.requiresVerification) {
        setVerificationSent(true);
      } else {
        navigate('/login');
      }
    } catch (err) {
      console.error('❌ Registration error:', err);
      console.error('Error response:', err.response?.data);
      
      if (err.response?.data?.message?.includes('already exists')) {
        setErrors({ submit: 'Username or email already exists' });
      } else {
        // Show detailed error message
        const errorMsg = err.response?.data?.message 
          || err.response?.data?.error 
          || err.message 
          || 'Registration failed. Please try again.';
        setErrors({ submit: errorMsg });
      }
    } finally {
      setLoading(false);
    }
  };

  // If verification email sent, show success message
  if (verificationSent) {
    return (
      <div className="register-container">
        <div className="register-box verification-success">
          <div className="success-icon">📧</div>
          <h1>Check Your Email!</h1>
          <p>We have sent a verification email to:</p>
          <p className="email-highlight">{formData.email}</p>
          <p>Please click the link in the email to activate your account.</p>
          
          <div className="info-box">
            <h4>📌 Note:</h4>
            <ul>
              <li>Verification link expires in 24 hours</li>
              <li>Check your Spam folder if you don't see the email</li>
              <li>You must verify your email before logging in</li>
            </ul>
          </div>
          
          <Link to="/login" className="btn-login">
            Already verified? Login now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="register-container">
      <div className="register-box">
        <h1>Recipe Finder</h1>
        <h2>Create Account</h2>
        
        <form onSubmit={handleSubmit}>
          {errors.submit && (
            <div className="error-message">
              {errors.submit}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              disabled={loading}
              autoFocus
              className={errors.username ? 'error' : ''}
            />
            {errors.username && <span className="field-error">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              disabled={loading}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password (min 6 characters)"
              disabled={loading}
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              disabled={loading}
              className={errors.confirmPassword ? 'error' : ''}
            />
            {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
          </div>

          <button 
            type="submit" 
            className="btn-register"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="login-link">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
