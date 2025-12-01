import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import axios from 'axios';
import './Login.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resendStatus, setResendStatus] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error on input change
    setNeedsVerification(false);
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    
    try {
      setResendStatus('sending');
      await axios.post(`${API_URL}/api/auth/resend-verification`, {
        email: unverifiedEmail
      });
      setResendStatus('sent');
    } catch (err) {
      setResendStatus('error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNeedsVerification(false);
    
    // Validation
    if (!formData.username.trim() || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const result = await login(formData.username, formData.password);
      
      // Check if email verification is required (returned from AuthContext)
      if (result?.requiresVerification) {
        setNeedsVerification(true);
        setUnverifiedEmail(result.email);
        setError('Please verify your email before logging in');
        return;
      }
      
      navigate('/'); // Redirect to home after successful login
    } catch (err) {
      // Check if email needs verification (error response)
      if (err.response?.data?.requiresVerification) {
        setNeedsVerification(true);
        setUnverifiedEmail(err.response.data.email);
        setError('Please verify your email before logging in');
      } else {
        setError(err.response?.data?.message || err.message || 'Invalid username or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Recipe Finder</h1>
        <h2>Login</h2>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <div className={`error-message ${needsVerification ? 'warning' : ''}`}>
              {error}
              
              {needsVerification && (
                <div className="verification-actions">
                  <p>Email: <strong>{unverifiedEmail}</strong></p>
                  <button 
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendStatus === 'sending' || resendStatus === 'sent'}
                    className="btn-resend"
                  >
                    {resendStatus === 'sending' ? 'Sending...' : 
                     resendStatus === 'sent' ? '✅ Email sent!' : 
                     '📧 Resend verification email'}
                  </button>
                  {resendStatus === 'error' && (
                    <p className="resend-error">Failed to send. Please try again.</p>
                  )}
                </div>
              )}
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
              placeholder="Enter your username"
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="btn-login"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="register-link">
          Don't have an account? <Link to="/register">Register now</Link>
        </div>
        
        <div className="register-link" style={{marginTop: '10px'}}>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
