import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('http://127.0.0.1:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();
            if (res.ok) {
                onLogin(data.user);
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('Server error. Is backend running?');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '70vh',
            position: 'relative',
            padding: '2rem'
        }}>
            {/* Back Button */}
            <button
                className="back-btn"
                onClick={() => navigate('/')}
                style={{
                    position: 'absolute',
                    top: '20px',
                    left: '30px',
                    animation: 'fadeInUp 0.5s ease forwards'
                }}
            >
                ← Back to Home
            </button>

            <div className="auth-card" style={{
                animation: 'fadeInUp 0.6s ease forwards'
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        marginBottom: '1rem',
                        animation: 'fadeInUp 0.5s ease 0.1s forwards',
                        opacity: 0
                    }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" strokeWidth="1.5">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            <circle cx="12" cy="16" r="1"/>
                        </svg>
                    </div>
                    <h2 style={{
                        margin: 0,
                        fontSize: '1.8rem',
                        background: 'linear-gradient(135deg, #fff, var(--accent-purple))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>Admin Access</h2>
                    <p style={{
                        color: 'var(--text-secondary)',
                        marginTop: '0.5rem',
                        fontSize: '0.95rem'
                    }}>
                        Secure entry for Exam Controllers
                    </p>
                </div>

                {error && (
                    <div className="error-msg" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <span>⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.6rem',
                            color: 'var(--text-secondary)',
                            fontSize: '0.9rem',
                            fontWeight: 500
                        }}>Username</label>
                        <div style={{ position: 'relative' }}>
                            <span style={{
                                position: 'absolute',
                                left: '14px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-muted)'
                            }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                            </span>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder="Enter username"
                                style={{ paddingLeft: '42px' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.6rem',
                            color: 'var(--text-secondary)',
                            fontSize: '0.9rem',
                            fontWeight: 500
                        }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <span style={{
                                position: 'absolute',
                                left: '14px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-muted)'
                            }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                </svg>
                            </span>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Enter password"
                                style={{ paddingLeft: '42px' }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="secondary"
                        style={{
                            width: '100%',
                            padding: '1rem',
                            fontSize: '1.05rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px'
                        }}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <div className="loading-spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
                                Authenticating...
                            </>
                        ) : (
                            <>⚡ Login to Dashboard</>
                        )}
                    </button>
                </form>

                <div style={{
                    marginTop: '2rem',
                    textAlign: 'center',
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid var(--glass-border)'
                }}>
                    Don't have an account?{' '}
                    <Link
                        to="/signup"
                        style={{
                            color: 'var(--accent-cyan)',
                            textDecoration: 'none',
                            fontWeight: 500,
                            transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => e.target.style.textShadow = '0 0 20px rgba(0, 243, 255, 0.5)'}
                        onMouseOut={(e) => e.target.style.textShadow = 'none'}
                    >
                        Sign Up →
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Login;
