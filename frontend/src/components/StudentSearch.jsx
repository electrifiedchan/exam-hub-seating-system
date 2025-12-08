import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function StudentSearch() {
    const navigate = useNavigate();
    const [rollNo, setRollNo] = useState('');
    const [ticket, setTicket] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        setError('');
        setTicket(null);
        setIsLoading(true);

        try {
            const res = await fetch('http://127.0.0.1:5000/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roll_no: rollNo }),
            });

            const data = await res.json();
            if (res.ok) {
                setTicket(data);
            } else {
                setError(data.error || 'Not found');
            }
        } catch (err) {
            setError('Server error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '70vh',
            padding: '2rem'
        }}>

            {/* Back Button */}
            <button
                className="back-btn"
                onClick={() => navigate('/')}
                style={{
                    position: 'absolute',
                    top: '100px',
                    left: '30px',
                    animation: 'fadeInUp 0.5s ease forwards'
                }}
            >
                ← Back to Home
            </button>

            {/* Hero Section */}
            <div style={{
                textAlign: 'center',
                marginBottom: '2.5rem',
                animation: 'fadeInUp 0.6s ease forwards'
            }}>
                <h1 style={{
                    fontSize: '3.5rem',
                    marginBottom: '0.5rem',
                    background: 'linear-gradient(135deg, #fff, var(--accent-cyan))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                }}>
                    Zero Hour
                </h1>
                <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '1.2rem',
                    animation: 'fadeInUp 0.6s ease 0.1s forwards',
                    opacity: 0
                }}>
                    Find your exam seat instantly.
                </p>
            </div>

            {/* Search Card */}
            <div className="glass-card" style={{
                width: '100%',
                maxWidth: '520px',
                animation: 'fadeInUp 0.6s ease 0.2s forwards',
                opacity: 0
            }}>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', alignItems: 'stretch' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <span style={{
                            position: 'absolute',
                            left: '14px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-muted)'
                        }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" />
                                <path d="M21 21l-4.35-4.35" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            value={rollNo}
                            onChange={(e) => setRollNo(e.target.value)}
                            placeholder="Enter Roll Number"
                            required
                            style={{
                                marginBottom: 0,
                                paddingLeft: '42px',
                                height: '52px'
                            }}
                        />
                    </div>
                    <button
                        type="submit"
                        className="primary"
                        style={{
                            width: 'auto',
                            minWidth: '100px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="loading-spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
                        ) : (
                            'Search'
                        )}
                    </button>
                </form>
            </div>

            {/* Error Message */}
            {error && (
                <div className="error-msg" style={{
                    marginTop: '2rem',
                    width: '100%',
                    maxWidth: '520px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                    {error}
                </div>
            )}

            {/* Result Ticket */}
            {ticket && (
                <div className="glass-card accent-cyan" style={{
                    marginTop: '2rem',
                    width: '100%',
                    maxWidth: '520px',
                    background: 'linear-gradient(135deg, rgba(0, 243, 255, 0.05), rgba(123, 97, 255, 0.03))',
                    animation: 'scaleIn 0.4s ease forwards'
                }}>
                    {/* Header */}
                    <div style={{
                        textAlign: 'center',
                        marginBottom: '1.5rem',
                        paddingBottom: '1.5rem',
                        borderBottom: '1px solid var(--glass-border)'
                    }}>
                        <div style={{ marginBottom: '0.5rem' }}>
                            <span className="badge cyan">Seat Confirmed</span>
                        </div>
                        <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '1.8rem' }}>{ticket.name}</h2>
                        <p style={{
                            color: 'var(--accent-cyan)',
                            fontWeight: 600,
                            fontSize: '1.1rem',
                            margin: '0.25rem 0 0 0'
                        }}>{ticket.roll_no}</p>
                    </div>

                    {/* Details Grid */}
                    <div className="grid-2" style={{ gap: '1.5rem' }}>
                        <div style={{
                            background: 'rgba(255,255,255,0.03)',
                            padding: '1rem',
                            borderRadius: '12px'
                        }}>
                            <span style={{
                                display: 'block',
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: '0.5rem'
                            }}>Exam</span>
                            <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{ticket.exam}</span>
                        </div>
                        <div style={{
                            background: 'rgba(255,255,255,0.03)',
                            padding: '1rem',
                            borderRadius: '12px'
                        }}>
                            <span style={{
                                display: 'block',
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: '0.5rem'
                            }}>Date</span>
                            <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{ticket.date}</span>
                        </div>

                        {/* Location Highlight */}
                        <div style={{
                            gridColumn: 'span 2',
                            background: 'linear-gradient(135deg, rgba(123, 97, 255, 0.15), rgba(0, 243, 255, 0.1))',
                            padding: '1.5rem',
                            borderRadius: '16px',
                            textAlign: 'center',
                            border: '1px solid rgba(123, 97, 255, 0.2)'
                        }}>
                            <span style={{
                                display: 'block',
                                fontSize: '0.8rem',
                                color: 'var(--text-secondary)',
                                marginBottom: '0.75rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em'
                            }}>
                                Your Location
                            </span>
                            <div style={{
                                fontSize: '2rem',
                                fontWeight: 700,
                                color: 'var(--accent-violet)',
                                textShadow: '0 0 30px rgba(123, 97, 255, 0.5)'
                            }}>
                                {ticket.room}
                            </div>
                            <div style={{
                                marginTop: '0.75rem',
                                fontSize: '1.2rem',
                                color: 'var(--text-primary)'
                            }}>
                                <span style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    padding: '0.3rem 0.8rem',
                                    borderRadius: '8px',
                                    marginRight: '0.5rem'
                                }}>
                                    Row {ticket.row}
                                </span>
                                <span style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    padding: '0.3rem 0.8rem',
                                    borderRadius: '8px'
                                }}>
                                    Seat {ticket.seat_no}
                                </span>
                            </div>
                        </div>

                        {/* Print Button */}
                        <button
                            onClick={() => window.print()}
                            className="secondary"
                            style={{
                                marginTop: '1.5rem',
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px'
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="6,9 6,2 18,2 18,9" />
                                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                                <rect x="6" y="14" width="12" height="8" />
                            </svg>
                            Print Ticket
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StudentSearch;
