import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

function SeatingView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [allStaff, setAllStaff] = useState([]);
    const [searchQueries, setSearchQueries] = useState({});

    const fetchSeating = async () => {
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/seating/${id}`);
            if (res.ok) {
                const data = await res.json();
                setExam(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchAllStaff = async () => {
        try {
            const res = await fetch('http://127.0.0.1:5000/api/staff');
            if (res.ok) setAllStaff(await res.json());
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchSeating();
        fetchAllStaff();
    }, [id]);

    const handleReset = async () => {
        if (!window.confirm('Are you sure you want to reset all student allocations? This cannot be undone.')) {
            return;
        }
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/exams/${id}/reset`, {
                method: 'POST'
            });
            if (res.ok) {
                alert('All allocations have been reset.');
                navigate('/dashboard');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAssignStaff = async (roomId, staffId) => {
        if (!staffId) return;
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/rooms/${roomId}/assign_staff`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ staff_id: staffId })
            });
            if (res.ok) {
                fetchSeating();
                fetchAllStaff(); // Refresh to update availability if needed
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to assign staff');
            }
        } catch (err) { console.error(err); }
    };

    const handleRemoveStaff = async (roomId, staffId) => {
        if (!window.confirm('Remove this staff member from the room?')) return;
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/rooms/${roomId}/remove_staff`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ staff_id: staffId })
            });
            if (res.ok) {
                fetchSeating();
                fetchAllStaff();
            }
        } catch (err) { console.error(err); }
    };

    if (!exam) return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
            gap: '1rem'
        }}>
            <div className="loading-spinner" style={{ width: '50px', height: '50px' }}></div>
            <p style={{ color: 'var(--text-secondary)' }}>Loading seating plan...</p>
        </div>
    );

    // Helper to get color based on subject
    const getSubjectColor = (subject) => {
        const colors = ['#00c4cc', '#7b61ff', '#ff9f1c', '#ff4d4d', '#00cc66'];
        let hash = 0;
        for (let i = 0; i < subject.length; i++) hash = subject.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };

    return (
        <div className="seating-page" style={{ animation: 'fadeInUp 0.5s ease forwards' }}>
            {/* Background dimming overlay */}
            <div className="seating-overlay"></div>

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 1, padding: '1rem 2rem' }}>
                {/* Header Section */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '2.5rem',
                    flexWrap: 'wrap',
                    gap: '1.5rem'
                }}>
                    <div style={{ paddingLeft: '0.5rem' }}>
                        <Link
                            to="/dashboard"
                            className="back-btn"
                            style={{
                                display: 'inline-block',
                                marginBottom: '1rem',
                                textDecoration: 'none'
                            }}
                        >
                            ← Back to Dashboard
                        </Link>
                        <h1 style={{
                            fontSize: '2.2rem',
                            margin: 0,
                            background: 'linear-gradient(135deg, #fff, var(--accent-cyan))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>{exam.exam_name}</h1>
                        <p style={{
                            color: 'var(--text-secondary)',
                            marginTop: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            flexWrap: 'wrap'
                        }}>
                            {exam.exam_date}
                            {exam.exam_time && <span className="badge green">{exam.exam_time}</span>}
                            <span className="badge purple">{exam.exam_duration || 60} min</span>
                            <span className="badge cyan">{exam.rooms.length} Rooms</span>
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <a
                            href={`http://127.0.0.1:5000/api/export/master/${id}`}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '0.75rem 1.25rem',
                                borderRadius: '10px',
                                textDecoration: 'none',
                                fontSize: '0.9rem',
                                background: 'linear-gradient(135deg, rgba(0, 243, 255, 0.15), rgba(123, 97, 255, 0.08))',
                                border: '1px solid rgba(0, 243, 255, 0.5)',
                                color: 'white',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <line x1="3" y1="9" x2="21" y2="9" />
                                <line x1="9" y1="21" x2="9" y2="9" />
                            </svg>
                            Master Plan (Excel)
                        </a>
                        <a
                            href={`http://127.0.0.1:5000/api/export/door/${id}`}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '0.75rem 1.25rem',
                                borderRadius: '10px',
                                textDecoration: 'none',
                                fontSize: '0.9rem',
                                background: 'linear-gradient(135deg, rgba(0, 255, 157, 0.15), rgba(0, 243, 255, 0.08))',
                                border: '1px solid rgba(0, 255, 157, 0.5)',
                                color: 'white',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                                <polyline points="10 9 9 9 8 9" />
                            </svg>
                            Door Stickers
                        </a>
                        <a
                            href={`http://127.0.0.1:5000/api/export/attendance/${id}`}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '0.75rem 1.25rem',
                                borderRadius: '10px',
                                textDecoration: 'none',
                                fontSize: '0.9rem',
                                background: 'linear-gradient(135deg, rgba(189, 0, 255, 0.15), rgba(0, 243, 255, 0.08))',
                                border: '1px solid rgba(189, 0, 255, 0.5)',
                                color: 'white',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 11l3 3L22 4" />
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                            </svg>
                            Attendance Sheet
                        </a>
                        <button
                            onClick={handleReset}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '0.75rem 1.25rem',
                                borderRadius: '10px',
                                fontSize: '0.9rem',
                                background: 'linear-gradient(135deg, rgba(255, 77, 77, 0.15), rgba(255, 159, 28, 0.08))',
                                border: '1px solid rgba(255, 77, 77, 0.5)',
                                color: 'white',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                <path d="M3 3v5h5" />
                            </svg>
                            Reset Allocations
                        </button>
                    </div>
                </div>

                {/* Room Cards */}
                {exam.rooms.map((room, idx) => (
                    <div
                        key={idx}
                        className="room-card"
                        style={{
                            animation: `fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${0.15 * (idx + 1)}s forwards`,
                            opacity: 0
                        }}
                    >
                        {/* Room Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1.5rem',
                            paddingBottom: '1rem',
                            borderBottom: '1px solid var(--glass-border)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, var(--accent-cyan-soft), var(--accent-purple-soft))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="1.5">
                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                        <polyline points="9,22 9,12 15,12 15,22" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.3rem' }}>Room {room.room_number}</h3>
                                    <p style={{
                                        margin: '0.25rem 0 0 0',
                                        fontSize: '0.85rem',
                                        color: 'var(--text-secondary)'
                                    }}>
                                        {room.rows} rows × {room.cols} columns
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <span className="badge green">
                                    {room.capacity} seats
                                </span>
                                {room.blocked_seats && room.blocked_seats.split(',').filter(s => s).length > 0 && (
                                    <span className="badge orange">
                                        {room.blocked_seats.split(',').filter(s => s).length} blocked
                                    </span>
                                )}
                            </div>
                        </div>


                        {/* Invigilators Section */}
                        <div style={{
                            marginBottom: '1.5rem',
                            padding: '1rem',
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: '8px',
                            border: '1px solid var(--glass-border)'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '0.75rem'
                            }}>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                        </svg>
                                        Invigilators
                                    </h4>
                                    <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        Subjects: {Array.from(new Set(room.students.map(s => s.subject))).join(', ') || 'None'}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <select
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                handleAssignStaff(room.id, e.target.value);
                                                e.target.value = ''; // Reset
                                            }
                                        }}
                                        style={{
                                            padding: '0.4rem',
                                            borderRadius: '6px',
                                            background: 'rgba(0,0,0,0.3)',
                                            border: '1px solid var(--glass-border)',
                                            color: 'white',
                                            fontSize: '0.85rem',
                                            maxWidth: '200px'
                                        }}
                                    >
                                        <option value="">+ Assign Staff</option>
                                        {(() => {
                                            const roomSubjects = new Set(room.students.map(s => s.subject));
                                            const sortedStaff = [...allStaff].sort((a, b) => {
                                                // Inverted Logic: Recommend if department is NOT in room subjects
                                                const aRec = !roomSubjects.has(a.department);
                                                const bRec = !roomSubjects.has(b.department);

                                                if (aRec && !bRec) return -1;
                                                if (!aRec && bRec) return 1;
                                                return 0;
                                            });

                                            return sortedStaff.map(s => {
                                                const isRecommended = !roomSubjects.has(s.department);
                                                const isBusy = s.room_id && s.room_id !== room.id;
                                                const isAssignedHere = s.room_id === room.id;

                                                if (isAssignedHere) return null;

                                                return (
                                                    <option key={s.id} value={s.id} disabled={isBusy}>
                                                        {isRecommended ? '✨ ' : ''}{s.name} ({s.department})
                                                        {isBusy ? ' - Busy' : ''}
                                                    </option>
                                                );
                                            });
                                        })()}
                                    </select>
                                </div>
                            </div>

                            {room.invigilators && room.invigilators.length > 0 ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                    {room.invigilators.map(inv => (
                                        <div key={inv.id} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '0.5rem 0.8rem',
                                            background: 'linear-gradient(135deg, rgba(123, 97, 255, 0.1), rgba(123, 97, 255, 0.05))',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(123, 97, 255, 0.2)',
                                            fontSize: '0.9rem'
                                        }}>
                                            <div style={{
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                background: 'var(--accent-purple)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white'
                                            }}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                    <circle cx="12" cy="7" r="4" />
                                                </svg>
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 500, lineHeight: 1.2 }}>{inv.name}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{inv.department}</div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveStaff(room.id, inv.id)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: 'var(--text-secondary)',
                                                    cursor: 'pointer',
                                                    padding: '4px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    marginLeft: '4px',
                                                    opacity: 0.7,
                                                    transition: 'opacity 0.2s'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                                                onMouseOut={(e) => e.currentTarget.style.opacity = 0.7}
                                                title="Remove"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <line x1="18" y1="6" x2="6" y2="18" />
                                                    <line x1="6" y1="6" x2="18" y2="18" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{
                                    padding: '1rem',
                                    textAlign: 'center',
                                    border: '1px dashed var(--glass-border)',
                                    borderRadius: '6px',
                                    color: 'var(--text-muted)',
                                    fontSize: '0.85rem'
                                }}>
                                    No invigilators assigned yet.
                                </div>
                            )}
                        </div>

                        {/* Students List Section */}
                        <div style={{
                            marginBottom: '1.5rem',
                            padding: '1rem',
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: '8px',
                            border: '1px solid var(--glass-border)'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '0.75rem'
                            }}>
                                <h4 style={{
                                    margin: 0,
                                    fontSize: '0.95rem',
                                    color: 'var(--accent-cyan)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                    Students ({room.students.length})
                                </h4>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        onChange={(e) => setSearchQueries(prev => ({ ...prev, [room.id]: e.target.value }))}
                                        value={searchQueries[room.id] || ''}
                                        style={{
                                            background: 'rgba(0, 0, 0, 0.2)',
                                            border: '1px solid var(--glass-border)',
                                            borderRadius: '6px',
                                            padding: '4px 8px 4px 28px',
                                            color: 'white',
                                            fontSize: '0.8rem',
                                            width: '120px',
                                            outline: 'none'
                                        }}
                                    />
                                    <svg
                                        width="12"
                                        height="12"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="var(--text-secondary)"
                                        strokeWidth="2"
                                        style={{
                                            position: 'absolute',
                                            left: '8px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            pointerEvents: 'none'
                                        }}
                                    >
                                        <circle cx="11" cy="11" r="8" />
                                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    </svg>
                                </div>
                            </div>

                            {room.students && room.students.length > 0 ? (
                                <div style={{
                                    maxHeight: '150px',
                                    overflowY: 'auto',
                                    paddingRight: '4px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '6px'
                                }} className="custom-scrollbar">
                                    {room.students
                                        .filter(s => {
                                            const query = (searchQueries[room.id] || '').toLowerCase();
                                            return !query ||
                                                s.name.toLowerCase().includes(query) ||
                                                s.roll_no.toLowerCase().includes(query);
                                        })
                                        .sort((a, b) => a.seat_number - b.seat_number)
                                        .map((student, sIdx) => (
                                            <div key={sIdx} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '0.5rem 0.75rem',
                                                background: 'rgba(255, 255, 255, 0.02)',
                                                borderRadius: '6px',
                                                border: '1px solid var(--glass-border)',
                                                fontSize: '0.85rem'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        minWidth: '50px',
                                                        marginRight: '8px'
                                                    }}>
                                                        <span style={{
                                                            color: 'var(--accent-cyan)',
                                                            fontWeight: 600,
                                                            fontSize: '0.9rem'
                                                        }}>
                                                            B{Math.ceil(student.seat_number / 2)}
                                                        </span>
                                                        <span style={{
                                                            fontSize: '0.65rem',
                                                            color: 'var(--text-secondary)',
                                                            textTransform: 'uppercase',
                                                            fontWeight: 500
                                                        }}>
                                                            {student.seat_number % 2 !== 0 ? 'Left' : 'Right'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 500 }}>{student.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                            {student.roll_no}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{
                                                    padding: '2px 8px',
                                                    borderRadius: '12px',
                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                    fontSize: '0.75rem',
                                                    color: getSubjectColor(student.subject),
                                                    border: `1px solid ${getSubjectColor(student.subject)}40`
                                                }}>
                                                    {student.subject}
                                                </div>
                                            </div>
                                        ))}
                                    {room.students.some(s => {
                                        const query = (searchQueries[room.id] || '').toLowerCase();
                                        return !query || s.name.toLowerCase().includes(query) || s.roll_no.toLowerCase().includes(query);
                                    }) ? null : (
                                        <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                            No matches found
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={{
                                    padding: '1rem',
                                    textAlign: 'center',
                                    color: 'var(--text-muted)',
                                    fontSize: '0.85rem',
                                    fontStyle: 'italic'
                                }}>
                                    No students assigned to this room.
                                </div>
                            )}
                        </div>

                        {/* Seating Grid */}
                        <div style={{
                            display: 'grid',
                            gap: '20px',
                            gridTemplateColumns: `repeat(${room.cols}, 1fr)`
                        }}>
                            {Array.from({ length: room.rows * room.cols }).map((_, benchIdx) => {
                                const seatA_Num = (benchIdx * 2) + 1;
                                const seatB_Num = (benchIdx * 2) + 2;

                                const studentA = room.students.find(s => s.seat_number === seatA_Num);
                                const studentB = room.students.find(s => s.seat_number === seatB_Num);

                                const blockedSet = new Set(room.blocked_seats ? room.blocked_seats.split(',').map(Number) : []);

                                return (
                                    <div
                                        key={benchIdx}
                                        className="bench-box"
                                        style={{
                                            animationDelay: `${0.15 * (idx + 1) + 0.03 * benchIdx}s`
                                        }}
                                    >
                                        <div className="bench-label">
                                            Bench {benchIdx + 1}
                                        </div>

                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <SeatBox
                                                student={studentA}
                                                seatNum={seatA_Num}
                                                isBlocked={blockedSet.has(seatA_Num)}
                                                getColor={getSubjectColor}
                                            />
                                            <SeatBox
                                                student={studentB}
                                                seatNum={seatB_Num}
                                                isBlocked={blockedSet.has(seatB_Num)}
                                                getColor={getSubjectColor}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SeatBox({ student, seatNum, isBlocked, getColor }) {
    const bgColor = student ? getColor(student.subject) : (isBlocked ? 'var(--error)' : 'transparent');

    // Parse hex color to rgba
    const getRgba = (hex, alpha) => {
        if (!hex || !hex.startsWith('#')) return `rgba(255, 255, 255, ${alpha})`;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    return (
        <div
            className="seat-box"
            style={{
                background: student
                    ? getRgba(bgColor, 0.15)
                    : (isBlocked ? 'rgba(255, 77, 77, 0.15)' : 'rgba(255, 255, 255, 0.02)'),
                border: `1px solid ${isBlocked ? 'var(--error)' : (student ? getRgba(bgColor, 0.4) : 'var(--glass-border)')}`
            }}
        >
            <span className="seat-number">#{seatNum}</span>

            {student ? (
                <>
                    <div style={{
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginBottom: '4px',
                        maxWidth: '100%'
                    }} title={student.name}>
                        {student.name}
                    </div>
                    <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '4px'
                    }}>{student.roll_no}</div>
                    <div style={{
                        fontSize: '0.65rem',
                        color: bgColor,
                        fontWeight: 600,
                        padding: '2px 6px',
                        background: getRgba(bgColor, 0.15),
                        borderRadius: '4px',
                        display: 'inline-block'
                    }}>
                        {student.subject}
                    </div>
                </>
            ) : (
                <div style={{
                    fontSize: '0.75rem',
                    opacity: 0.4,
                    fontWeight: isBlocked ? 600 : 400,
                    color: isBlocked ? 'var(--error)' : 'inherit'
                }}>
                    {isBlocked ? 'BLOCKED' : '— Empty —'}
                </div>
            )}
        </div>
    );
}

export default SeatingView;
