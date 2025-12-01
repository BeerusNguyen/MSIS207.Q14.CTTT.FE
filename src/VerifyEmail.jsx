import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './VerifyEmail.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const [message, setMessage] = useState('');
    const [resendEmail, setResendEmail] = useState('');
    const [resendStatus, setResendStatus] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
            const token = searchParams.get('token');
            const email = searchParams.get('email');

            if (!token || !email) {
                setStatus('error');
                setMessage('Invalid verification link. Missing token or email.');
                return;
            }

            try {
                const response = await axios.get(
                    `${API_URL}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`
                );

                setStatus('success');
                setMessage(response.data.message);

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 3000);

            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Verification failed. Please try again.');
                setResendEmail(email);
            }
        };

        verifyEmail();
    }, [searchParams, navigate]);

    const handleResendVerification = async () => {
        if (!resendEmail) return;

        try {
            setResendStatus('sending');
            await axios.post(`${API_URL}/api/auth/resend-verification`, {
                email: resendEmail
            });
            setResendStatus('sent');
        } catch (error) {
            setResendStatus('error');
        }
    };

    return (
        <div className="verify-email-page">
            <div className="verify-container">
                {status === 'verifying' && (
                    <>
                        <div className="spinner"></div>
                        <h2>Verifying your email...</h2>
                        <p>Please wait a moment.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="icon success">✅</div>
                        <h2>Verification Successful!</h2>
                        <p>{message}</p>
                        <p className="redirect-text">Redirecting to login page...</p>
                        <Link to="/login" className="btn-primary">Login Now</Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="icon error">❌</div>
                        <h2>Verification Failed</h2>
                        <p>{message}</p>
                        
                        {resendEmail && (
                            <div className="resend-section">
                                <p>Would you like to resend the verification email?</p>
                                <button 
                                    onClick={handleResendVerification}
                                    disabled={resendStatus === 'sending' || resendStatus === 'sent'}
                                    className="btn-secondary"
                                >
                                    {resendStatus === 'sending' ? 'Sending...' : 
                                     resendStatus === 'sent' ? 'Sent!' : 
                                     'Resend Verification Email'}
                                </button>
                                
                                {resendStatus === 'sent' && (
                                    <p className="success-text">
                                        ✅ New verification email sent! Check your inbox.
                                    </p>
                                )}
                                
                                {resendStatus === 'error' && (
                                    <p className="error-text">
                                        ❌ Failed to send email. Please try again.
                                    </p>
                                )}
                            </div>
                        )}
                        
                        <Link to="/login" className="btn-link">Back to login</Link>
                    </>
                )}
            </div>
        </div>
    );
}

export default VerifyEmail;
