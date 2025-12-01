import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from './api/fetchSaved';

export default function ResetPassword(){
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    if(!token || !email){
      setError('Invalid reset link');
    }
  },[token,email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); setMessage(null);
    if(password.length < 6) return setError('Password must be at least 6 chars');
    if(password !== confirm) return setError('Passwords do not match');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/reset-password', { email, token, password });
      setMessage(res.data.message || 'Password updated');
      setTimeout(()=> navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error resetting password');
    } finally { setLoading(false); }
  };

  return (
    <div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'100vh',background:'linear-gradient(135deg, #f2d14d 0%, #d17701 100%)'}}>
      <div style={{width: '420px', background:'white', padding:24, borderRadius:8, boxShadow:'0 10px 25px rgba(0,0,0,0.2)'}}>
        <h2 style={{color:'#d17701'}}>Create a new password</h2>
        {message && <div style={{padding:10,background:'#e6ffed',borderRadius:6}}>{message}</div>}
        {error && <div style={{padding:10,background:'#ffe6e6',borderRadius:6}}>{error}</div>}
        <form onSubmit={handleSubmit} style={{marginTop:12}}>
          <label style={{display:'block',marginBottom:8}}>New password</label>
          <input type='password' value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ddd'}} />
          <label style={{display:'block',marginTop:12,marginBottom:8}}>Confirm password</label>
          <input type='password' value={confirm} onChange={e=>setConfirm(e.target.value)} style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ddd'}} />
          <button type='submit' disabled={loading} style={{marginTop:12,width:'100%',padding:10,background:'linear-gradient(135deg, #f2d14d 0%, #d17701 100%)',color:'white',border:'none',borderRadius:6,fontWeight:'600',cursor:'pointer'}}>
            {loading? 'Updating...' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
}
