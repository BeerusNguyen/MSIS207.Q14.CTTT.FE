import React, { useState } from 'react';
import api from './api/fetchSaved';

export default function ForgotPassword(){
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!email.trim()) return setError('Please enter your email');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/forgot-password', { email });
      setMessage(res.data.message || 'If the email exists, a reset link has been sent.');
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending reset email');
    } finally { setLoading(false); }
  };

  return (
    <div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'100vh',background:'linear-gradient(135deg, #f2d14d 0%, #d17701 100%)'}}>
      <div style={{width: '400px', background:'white', padding:24, borderRadius:8, boxShadow:'0 10px 25px rgba(0,0,0,0.2)'}}>
        <h2 style={{color:'#d17701'}}>Reset Password</h2>
        <p>Enter the email address for your account and we'll send you a link to reset your password.</p>
        {message && <div style={{padding:10,background:'#e6ffed',borderRadius:6}}>{message}</div>}
        {error && <div style={{padding:10,background:'#ffe6e6',borderRadius:6}}>{error}</div>}
        <form onSubmit={handleSubmit} style={{marginTop:12}}>
          <label style={{display:'block',marginBottom:8}}>Email</label>
          <input type='email' value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ddd'}} />
          <button type='submit' disabled={loading} style={{marginTop:12,width:'100%',padding:10,background:'linear-gradient(135deg, #f2d14d 0%, #d17701 100%)',color:'white',border:'none',borderRadius:6,fontWeight:'600',cursor:'pointer'}}>
            {loading? 'Sending...' : 'Send reset email'}
          </button>
        </form>
      </div>
    </div>
  );
}
