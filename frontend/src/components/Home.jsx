import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
    return (
        <div className="container" style={{
            minHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center'
        }}>
            {/* Main Content */}
            <div style={{ position: 'relative', zIndex: 10 }}>
                <h1 className="hero-title">EXAMHUB</h1>

                <p className="hero-subtitle">
                    The next-generation exam seating platform. <br />
                    <span style={{ color: 'var(--accent-cyan)' }}>Secure</span> ·
                    <span style={{ color: 'var(--accent-purple)' }}> Intelligent</span> ·
                    <span style={{ color: 'var(--accent-green)' }}> Beautiful</span>
                </p>

                <div style={{
                    display: 'flex',
                    gap: '24px',
                    justifyContent: 'center',
                    animation: 'fadeInUp 0.8s ease 0.4s forwards',
                    opacity: 0
                }}>
                    <Link to="/student" style={{ textDecoration: 'none' }}>
                        <button className="primary portal-btn" style={{
                            padding: '1.1rem 2.8rem',
                            fontSize: '1.1rem'
                        }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                            Student Portal
                        </button>
                    </Link>

                    <Link to="/admin" style={{ textDecoration: 'none' }}>
                        <button className="secondary portal-btn" style={{
                            padding: '1.1rem 2.8rem',
                            fontSize: '1.1rem'
                        }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                            </svg>
                            Admin Portal
                        </button>
                    </Link>
                </div>

                {/* Feature highlights */}
                <div style={{
                    display: 'flex',
                    gap: '60px',
                    justifyContent: 'center',
                    marginTop: '5rem',
                    animation: 'fadeInUp 0.8s ease 0.6s forwards',
                    opacity: 0
                }}>
                    <div className="feature-item">
                        <div className="feature-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="1.5">
                                <rect x="3" y="3" width="7" height="7" rx="1"/>
                                <rect x="14" y="3" width="7" height="7" rx="1"/>
                                <rect x="3" y="14" width="7" height="7" rx="1"/>
                                <rect x="14" y="14" width="7" height="7" rx="1"/>
                            </svg>
                        </div>
                        <div className="feature-label">Smart Allocation</div>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" strokeWidth="1.5">
                                <rect x="3" y="11" width="18" height="11" rx="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </div>
                        <div className="feature-label">Secure Access</div>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="1.5">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14,2 14,8 20,8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                            </svg>
                        </div>
                        <div className="feature-label">PDF Export</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
