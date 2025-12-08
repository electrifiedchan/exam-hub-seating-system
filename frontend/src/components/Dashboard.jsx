import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx'; // Need to install this for preview

function Dashboard() {
    const [exams, setExams] = useState([]);
    const [view, setView] = useState('dashboard'); // dashboard, create
    const [activeTab, setActiveTab] = useState('exams'); // exams, staff

    // Staff State
    const [staff, setStaff] = useState([]);
    const [staffName, setStaffName] = useState('');
    const [staffDepartment, setStaffDepartment] = useState('');
    const [editingStaff, setEditingStaff] = useState(null);
    const [staffMsg, setStaffMsg] = useState('');

    // Create Exam State
    const [examName, setExamName] = useState('');
    const [examDate, setExamDate] = useState('');
    const [examDuration, setExamDuration] = useState(60);
    const [rooms, setRooms] = useState([]); // [{name, rows, cols, blocked: Set}]
    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState([]);
    const [msg, setMsg] = useState('');

    // Room Input State
    const [roomName, setRoomName] = useState('');
    const [rows, setRows] = useState(5);
    const [cols, setCols] = useState(4);
    const [blockedSeats, setBlockedSeats] = useState(new Set());
    const [examTime, setExamTime] = useState('09:00');

    // Subject Distribution from file
    const [subjectDistribution, setSubjectDistribution] = useState({});
    const [totalStudents, setTotalStudents] = useState(0);

    useEffect(() => {
        fetchExams();
        fetchStaff();
    }, []);

    const fetchExams = async () => {
        try {
            const res = await fetch('http://127.0.0.1:5000/api/exams');
            if (res.ok) setExams(await res.json());
        } catch (err) { console.error(err); }
    };

    const deleteExam = async (examId, examName) => {
        if (!window.confirm(`Are you sure you want to delete "${examName}"? This cannot be undone.`)) {
            return;
        }
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/exams/${examId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchExams();
            }
        } catch (err) {
            console.error(err);
        }
    };

    // --- STAFF FUNCTIONS ---
    const fetchStaff = async () => {
        try {
            const res = await fetch('http://127.0.0.1:5000/api/staff');
            if (res.ok) setStaff(await res.json());
        } catch (err) { console.error(err); }
    };

    const handleAddStaff = async () => {
        if (!staffName || !staffDepartment) {
            setStaffMsg('Please fill in all fields');
            return;
        }
        try {
            const res = await fetch('http://127.0.0.1:5000/api/staff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: staffName, department: staffDepartment })
            });
            if (res.ok) {
                setStaffMsg('Staff added successfully!');
                setStaffName('');
                setStaffDepartment('');
                fetchStaff();
            } else {
                const data = await res.json();
                setStaffMsg('Error: ' + data.error);
            }
        } catch (err) {
            setStaffMsg('Server error');
        }
    };

    const handleUpdateStaff = async () => {
        if (!staffName || !staffDepartment) {
            setStaffMsg('Please fill in all fields');
            return;
        }
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/staff/${editingStaff.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: staffName, department: staffDepartment })
            });
            if (res.ok) {
                setStaffMsg('Staff updated successfully!');
                setStaffName('');
                setStaffDepartment('');
                setEditingStaff(null);
                fetchStaff();
            } else {
                const data = await res.json();
                setStaffMsg('Error: ' + data.error);
            }
        } catch (err) {
            setStaffMsg('Server error');
        }
    };

    const handleDeleteStaff = async (staffId, name) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/staff/${staffId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchStaff();
                setStaffMsg('Staff deleted successfully');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const startEditStaff = (staffMember) => {
        setEditingStaff(staffMember);
        setStaffName(staffMember.name);
        setStaffDepartment(staffMember.department);
    };

    const cancelEditStaff = () => {
        setEditingStaff(null);
        setStaffName('');
        setStaffDepartment('');
    };

    const handleStaffUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setStaffMsg('Uploading...');
            const res = await fetch('http://127.0.0.1:5000/api/staff/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (res.ok) {
                setStaffMsg(data.message);
                fetchStaff();
            } else {
                setStaffMsg('Error: ' + data.error);
            }
        } catch (err) {
            setStaffMsg('Upload failed');
            console.error(err);
        }
        // Reset input
        e.target.value = '';
    };

    // File Preview Logic
    const handleFileChange = (e) => {
        const f = e.target.files[0];
        setFile(f);
        if (f) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
                setFilePreview(data.slice(0, 6)); // Header + 5 rows

                // Calculate subject distribution
                const fullData = XLSX.utils.sheet_to_json(ws);
                const distribution = {};
                fullData.forEach(row => {
                    const subject = row['Subject'] || row['subject'];
                    if (subject) {
                        distribution[subject] = (distribution[subject] || 0) + 1;
                    }
                });
                setSubjectDistribution(distribution);
                setTotalStudents(fullData.length);
            };
            reader.readAsBinaryString(f);
        } else {
            setSubjectDistribution({});
            setTotalStudents(0);
        }
    };

    // Calculate total capacity from all rooms
    const getTotalCapacity = () => {
        return rooms.reduce((acc, r) => {
            const maxSeats = r.rows * r.cols * 2;
            const blocked = r.blocked ? r.blocked.size : 0;
            return acc + (maxSeats - blocked);
        }, 0);
    };

    // Check if capacity is sufficient
    const isCapacitySufficient = () => {
        if (totalStudents === 0) return true;
        return getTotalCapacity() >= totalStudents;
    };

    // Room Logic
    const toggleBlocked = (seatNum) => {
        const newBlocked = new Set(blockedSeats);
        if (newBlocked.has(seatNum)) newBlocked.delete(seatNum);
        else newBlocked.add(seatNum);
        setBlockedSeats(newBlocked);
    };

    const addRoom = () => {
        if (!roomName) return;
        setRooms([...rooms, {
            name: roomName,
            rows: parseInt(rows),
            cols: parseInt(cols),
            blocked: new Set(blockedSeats)
        }]);
        setRoomName('');
        setBlockedSeats(new Set());
    };

    const removeRoom = (idx) => {
        const newRooms = [...rooms];
        newRooms.splice(idx, 1);
        setRooms(newRooms);
    };

    const handleSubmit = async () => {
        setMsg('Processing...');

        // Prepare Rooms JSON
        const roomsJson = JSON.stringify(rooms.map(r => ({
            name: r.name,
            rows: r.rows,
            cols: r.cols,
            blocked: Array.from(r.blocked).join(',')
        })));

        const data = new FormData();
        data.append('exam_name', examName);
        data.append('exam_date', examDate);
        data.append('exam_time', examTime);
        data.append('exam_duration', examDuration);
        data.append('rooms_json', roomsJson);
        data.append('student_file', file);

        try {
            const res = await fetch('http://127.0.0.1:5000/api/generate', {
                method: 'POST',
                body: data,
            });

            const result = await res.json();
            if (res.ok) {
                setMsg('Success! Exam created.');
                fetchExams();
                setView('dashboard');
                // Reset
                setExamName(''); setExamDate(''); setExamTime('09:00'); setExamDuration(60);
                setRooms([]); setFile(null); setFilePreview([]);
                setSubjectDistribution({}); setTotalStudents(0);
            } else {
                setMsg('Error: ' + result.error);
            }
        } catch (err) {
            setMsg('Server error.');
        }
    };

    return (
        <>
            {/* Dashboard Overlay for softer background */}
            <div className="dashboard-overlay"></div>

            <div className="dashboard-page" style={{ padding: '1rem 2rem' }}>
                {/* Header Stats */}
                {view === 'dashboard' && (
                    <>
                        {/* Welcome Banner */}
                        <div style={{
                            marginBottom: '2rem',
                            paddingLeft: '0.5rem',
                            animation: 'fadeInUp 0.5s ease forwards'
                        }}>
                            <h1 style={{
                                fontSize: '2rem',
                                marginBottom: '0.5rem',
                                background: 'linear-gradient(135deg, #fff, var(--accent-cyan))',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>
                                Command Center
                            </h1>
                            <p style={{ color: 'var(--text-secondary)' }}>Manage your exams and seating arrangements</p>
                        </div>

                        {/* Tab Navigation */}
                        <div style={{
                            display: 'flex',
                            gap: '0.5rem',
                            marginBottom: '2rem',
                            background: 'rgba(0,0,0,0.2)',
                            padding: '0.5rem',
                            borderRadius: '12px',
                            width: 'fit-content'
                        }}>
                            <button
                                onClick={() => setActiveTab('exams')}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: activeTab === 'exams' ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))' : 'transparent',
                                    color: activeTab === 'exams' ? 'white' : 'var(--text-secondary)',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="7" height="7" rx="1" />
                                    <rect x="14" y="3" width="7" height="7" rx="1" />
                                    <rect x="3" y="14" width="7" height="7" rx="1" />
                                    <rect x="14" y="14" width="7" height="7" rx="1" />
                                </svg>
                                Exams
                            </button>
                            <button
                                onClick={() => setActiveTab('staff')}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: activeTab === 'staff' ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))' : 'transparent',
                                    color: activeTab === 'staff' ? 'white' : 'var(--text-secondary)',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                                Staff
                            </button>
                        </div>

                        {/* EXAMS TAB CONTENT */}
                        {activeTab === 'exams' && (
                            <>
                                {/* Stats Grid */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: '1.5rem',
                                    marginBottom: '2.5rem'
                                }}>
                                    <div className="glass-card accent-cyan stat-card" style={{
                                        animationDelay: '0.1s',
                                        opacity: 0,
                                        animation: 'fadeInUp 0.5s ease 0.1s forwards'
                                    }}>
                                        <div className="stat-icon cyan">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="1.5">
                                                <rect x="3" y="3" width="7" height="7" rx="1" />
                                                <rect x="14" y="3" width="7" height="7" rx="1" />
                                                <rect x="3" y="14" width="7" height="7" rx="1" />
                                                <rect x="14" y="14" width="7" height="7" rx="1" />
                                            </svg>
                                        </div>
                                        <div className="stat-value">{exams.length}</div>
                                        <div className="stat-label">Active Exams</div>
                                    </div>
                                    <div className="glass-card accent-purple stat-card" style={{
                                        animationDelay: '0.2s',
                                        opacity: 0,
                                        animation: 'fadeInUp 0.5s ease 0.2s forwards'
                                    }}>
                                        <div className="stat-icon purple">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" strokeWidth="1.5">
                                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                                <polyline points="9,22 9,12 15,12 15,22" />
                                            </svg>
                                        </div>
                                        <div className="stat-value" style={{
                                            background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent'
                                        }}>
                                            {exams.reduce((acc, curr) => acc + curr.total_rooms, 0)}
                                        </div>
                                        <div className="stat-label">Total Rooms</div>
                                    </div>
                                    <div className="glass-card accent-green stat-card" style={{
                                        animationDelay: '0.3s',
                                        opacity: 0,
                                        animation: 'fadeInUp 0.5s ease 0.3s forwards'
                                    }}>
                                        <div className="stat-icon green">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="1.5">
                                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                                            </svg>
                                        </div>
                                        <div style={{
                                            fontSize: '1.2rem',
                                            fontWeight: 600,
                                            color: 'var(--success)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px'
                                        }}>
                                            <span style={{
                                                width: '8px',
                                                height: '8px',
                                                background: 'var(--success)',
                                                borderRadius: '50%',
                                                animation: 'pulse-glow 2s infinite'
                                            }}></span>
                                            Online
                                        </div>
                                        <div className="stat-label">System Status</div>
                                    </div>
                                </div>

                                {/* Recent Exams Header */}
                                <div className="recent-exams-header" style={{
                                    animation: 'fadeInUp 0.5s ease 0.4s forwards',
                                    opacity: 0,
                                    paddingLeft: '0.5rem'
                                }}>
                                    <h2>Recent Exams</h2>
                                    <button
                                        className="primary"
                                        onClick={() => setView('create')}
                                        style={{
                                            width: 'auto',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '0.6rem 1.25rem'
                                        }}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <line x1="12" y1="5" x2="12" y2="19" />
                                            <line x1="5" y1="12" x2="19" y2="12" />
                                        </svg>
                                        Create New Exam
                                    </button>
                                </div>

                                {/* Exams List */}
                                <div className="glass-card" style={{
                                    animation: 'fadeInUp 0.5s ease 0.5s forwards',
                                    opacity: 0,
                                    padding: '0.75rem'
                                }}>
                                    {exams.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {exams.map((exam, idx) => (
                                                <div key={exam.id} className="exam-list-item">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                        <div className="exam-icon">
                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="1.5">
                                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                                <polyline points="14,2 14,8 20,8" />
                                                                <line x1="16" y1="13" x2="8" y2="13" />
                                                                <line x1="16" y1="17" x2="8" y2="17" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <h4 style={{ margin: 0, color: 'white', fontSize: '1.1rem' }}>{exam.name}</h4>
                                                            <div style={{
                                                                display: 'flex',
                                                                gap: '0.75rem',
                                                                marginTop: '0.3rem',
                                                                fontSize: '0.85rem',
                                                                color: 'var(--text-secondary)',
                                                                alignItems: 'center',
                                                                flexWrap: 'wrap'
                                                            }}>
                                                                <span>{exam.date}</span>
                                                                {exam.time && <span className="badge green" style={{ padding: '0.15rem 0.5rem' }}>{exam.time}</span>}
                                                                <span className="badge purple" style={{ padding: '0.15rem 0.5rem' }}>
                                                                    {exam.duration || 60} min
                                                                </span>
                                                                <span className="badge cyan" style={{ padding: '0.15rem 0.5rem' }}>
                                                                    {exam.total_rooms} rooms
                                                                </span>
                                                                <span className="badge orange" style={{ padding: '0.15rem 0.5rem' }}>
                                                                    {exam.total_students}/{exam.total_capacity} seats ({exam.utilization})
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <Link
                                                            to={`/seating/${exam.id}`}
                                                            className="btn-link"
                                                            style={{
                                                                color: 'var(--accent-cyan)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '6px'
                                                            }}
                                                        >
                                                            View Details →
                                                        </Link>
                                                        <button
                                                            onClick={() => deleteExam(exam.id, exam.name)}
                                                            className="btn-delete"
                                                            title="Delete Exam"
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <polyline points="3,6 5,6 21,6" />
                                                                <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6" />
                                                                <line x1="10" y1="11" x2="10" y2="17" />
                                                                <line x1="14" y1="11" x2="14" y2="17" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{
                                            textAlign: 'center',
                                            padding: '3rem',
                                            color: 'var(--text-secondary)'
                                        }}>
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1" style={{ opacity: 0.4, marginBottom: '1rem' }}>
                                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                                <line x1="8" y1="12" x2="16" y2="12" />
                                            </svg>
                                            <p>No exams created yet.</p>
                                            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Click "Create New Exam" to get started!</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* STAFF TAB CONTENT */}
                        {activeTab === 'staff' && (
                            <div style={{ animation: 'fadeInUp 0.5s ease forwards' }}>
                                {/* Staff Header */}
                                <div className="recent-exams-header" style={{
                                    marginBottom: '1.5rem',
                                    paddingLeft: '0.5rem'
                                }}>
                                    <h2 style={{
                                        background: 'linear-gradient(135deg, #fff, var(--accent-purple))',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text'
                                    }}>Staff Management</h2>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <span className="badge purple">{staff.length} staff members</span>
                                        <label style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '0.4rem 0.8rem',
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            border: '1px solid var(--glass-border)',
                                            transition: 'all 0.2s ease'
                                        }}
                                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                <polyline points="17 8 12 3 7 8" />
                                                <line x1="12" y1="3" x2="12" y2="15" />
                                            </svg>
                                            Upload CSV
                                            <input
                                                type="file"
                                                accept=".csv, .xlsx"
                                                onChange={handleStaffUpload}
                                                style={{ display: 'none' }}
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div className="grid-2">
                                    {/* Left: Staff List */}
                                    <div className="glass-card accent-purple" style={{
                                        animation: 'fadeInUp 0.5s ease 0.1s forwards',
                                        opacity: 0
                                    }}>
                                        <h3 style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            marginBottom: '1.5rem'
                                        }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" strokeWidth="1.5">
                                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                                <circle cx="9" cy="7" r="4" />
                                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                            </svg>
                                            Staff List
                                        </h3>

                                        {staff.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {staff.map((s) => (
                                                    <div key={s.id} style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        padding: '1rem',
                                                        background: 'rgba(255,255,255,0.03)',
                                                        borderRadius: '10px',
                                                        border: '1px solid var(--glass-border)',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                                                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                            <div style={{
                                                                width: '40px',
                                                                height: '40px',
                                                                borderRadius: '50%',
                                                                background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontWeight: 700,
                                                                fontSize: '1rem',
                                                                color: 'white'
                                                            }}>
                                                                {s.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <h4 style={{ margin: 0, color: 'white', fontSize: '1rem' }}>{s.name}</h4>
                                                                <span className="badge purple" style={{ marginTop: '4px' }}>{s.department}</span>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button
                                                                onClick={() => startEditStaff(s)}
                                                                style={{
                                                                    padding: '0.4rem 0.75rem',
                                                                    borderRadius: '6px',
                                                                    border: '1px solid var(--accent-cyan)',
                                                                    background: 'transparent',
                                                                    color: 'var(--accent-cyan)',
                                                                    cursor: 'pointer',
                                                                    fontSize: '0.8rem',
                                                                    transition: 'all 0.2s ease'
                                                                }}
                                                                onMouseOver={(e) => e.currentTarget.style.background = 'var(--accent-cyan-soft)'}
                                                                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteStaff(s.id, s.name)}
                                                                className="btn-delete"
                                                                title="Delete Staff"
                                                            >
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <polyline points="3,6 5,6 21,6" />
                                                                    <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div style={{
                                                textAlign: 'center',
                                                padding: '3rem',
                                                color: 'var(--text-secondary)'
                                            }}>
                                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1" style={{ opacity: 0.4, marginBottom: '1rem' }}>
                                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                                    <circle cx="9" cy="7" r="4" />
                                                </svg>
                                                <p>No staff members yet.</p>
                                                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Add your first staff member!</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Add/Edit Staff Form */}
                                    <div className="glass-card accent-cyan" style={{
                                        animation: 'fadeInUp 0.5s ease 0.2s forwards',
                                        opacity: 0
                                    }}>
                                        <h3 style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            marginBottom: '1.5rem'
                                        }}>
                                            <span style={{
                                                background: 'var(--accent-cyan-soft)',
                                                padding: '0.5rem 0.75rem',
                                                borderRadius: '8px'
                                            }}>
                                                {editingStaff ? '✏️' : '+'}
                                            </span>
                                            {editingStaff ? 'Edit Staff Member' : 'Add New Staff'}
                                        </h3>

                                        {staffMsg && (
                                            <div className={staffMsg.includes('Error') ? 'error-msg' : 'message success'} style={{ marginBottom: '1rem' }}>
                                                {staffMsg}
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <div>
                                                <label style={{
                                                    display: 'block',
                                                    marginBottom: '6px',
                                                    fontSize: '0.85rem',
                                                    color: 'var(--text-secondary)',
                                                    fontWeight: 500
                                                }}>Full Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Dr. John Smith"
                                                    value={staffName}
                                                    onChange={e => setStaffName(e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label style={{
                                                    display: 'block',
                                                    marginBottom: '6px',
                                                    fontSize: '0.85rem',
                                                    color: 'var(--text-secondary)',
                                                    fontWeight: 500
                                                }}>Department</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Computer Science"
                                                    value={staffDepartment}
                                                    onChange={e => setStaffDepartment(e.target.value)}
                                                />
                                            </div>

                                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                                                <button
                                                    className="primary"
                                                    onClick={editingStaff ? handleUpdateStaff : handleAddStaff}
                                                    style={{
                                                        flex: 1,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '8px'
                                                    }}
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                        {editingStaff ? (
                                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                                        ) : (
                                                            <>
                                                                <line x1="12" y1="5" x2="12" y2="19" />
                                                                <line x1="5" y1="12" x2="19" y2="12" />
                                                            </>
                                                        )}
                                                    </svg>
                                                    {editingStaff ? 'Update Staff' : 'Add Staff'}
                                                </button>
                                                {editingStaff && (
                                                    <button
                                                        className="secondary"
                                                        onClick={cancelEditStaff}
                                                        style={{ flex: 1 }}
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
                {/* Create Exam View */}
                {view === 'create' && (
                    <div style={{ animation: 'fadeInUp 0.5s ease forwards' }}>
                        <button
                            onClick={() => setView('dashboard')}
                            className="back-btn"
                            style={{ marginBottom: '1.5rem' }}
                        >
                            ← Back to Dashboard
                        </button>

                        <h2 style={{
                            marginBottom: '2rem',
                            background: 'linear-gradient(135deg, #fff, var(--accent-green))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                            Create New Exam
                        </h2>

                        <div className="grid-2">
                            {/* Left: Configuration */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                                {/* 1. Basic Info */}
                                <div className="glass-card accent-cyan" style={{
                                    animation: 'fadeInUp 0.5s ease 0.1s forwards',
                                    opacity: 0
                                }}>
                                    <h3 style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        marginBottom: '1.5rem'
                                    }}>
                                        <span style={{
                                            background: 'var(--accent-cyan-soft)',
                                            padding: '0.5rem 0.75rem',
                                            borderRadius: '8px'
                                        }}>1</span>
                                        Exam Details
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <input
                                            type="text"
                                            placeholder="Exam Name (e.g., Midterm 2024)"
                                            value={examName}
                                            onChange={e => setExamName(e.target.value)}
                                        />
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div>
                                                <label style={{
                                                    display: 'block',
                                                    marginBottom: '6px',
                                                    fontSize: '0.85rem',
                                                    color: 'var(--text-secondary)',
                                                    fontWeight: 500
                                                }}>Date</label>
                                                <input
                                                    type="date"
                                                    value={examDate}
                                                    onChange={e => setExamDate(e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label style={{
                                                    display: 'block',
                                                    marginBottom: '6px',
                                                    fontSize: '0.85rem',
                                                    color: 'var(--text-secondary)',
                                                    fontWeight: 500
                                                }}>Time Slot</label>
                                                <input
                                                    type="time"
                                                    value={examTime}
                                                    onChange={e => setExamTime(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div style={{ position: 'relative' }}>
                                            <label style={{
                                                display: 'block',
                                                marginBottom: '6px',
                                                fontSize: '0.85rem',
                                                color: 'var(--text-secondary)',
                                                fontWeight: 500
                                            }}>Duration</label>
                                            <input
                                                type="number"
                                                placeholder="Duration"
                                                value={examDuration}
                                                onChange={e => setExamDuration(e.target.value)}
                                                min="15"
                                                max="300"
                                                style={{ paddingRight: '50px' }}
                                            />
                                            <span style={{
                                                position: 'absolute',
                                                right: '12px',
                                                bottom: '14px',
                                                color: 'var(--text-secondary)',
                                                fontSize: '0.85rem'
                                            }}>mins</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Room Config */}
                                <div className="glass-card accent-purple" style={{
                                    animation: 'fadeInUp 0.5s ease 0.2s forwards',
                                    opacity: 0
                                }}>
                                    <h3 style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        marginBottom: '1.5rem'
                                    }}>
                                        <span style={{
                                            background: 'var(--accent-purple-soft)',
                                            padding: '0.5rem 0.75rem',
                                            borderRadius: '8px'
                                        }}>2</span>
                                        Room Configuration
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                        <div>
                                            <label style={{
                                                display: 'block',
                                                marginBottom: '6px',
                                                fontSize: '0.85rem',
                                                color: 'var(--text-secondary)',
                                                fontWeight: 500
                                            }}>Room No</label>
                                            <input type="text" placeholder="e.g. 101" value={roomName} onChange={e => setRoomName(e.target.value)} />
                                        </div>
                                        <div>
                                            <label style={{
                                                display: 'block',
                                                marginBottom: '6px',
                                                fontSize: '0.85rem',
                                                color: 'var(--text-secondary)',
                                                fontWeight: 500
                                            }}>Rows</label>
                                            <input type="number" placeholder="Rows" value={rows} onChange={e => setRows(e.target.value)} />
                                        </div>
                                        <div>
                                            <label style={{
                                                display: 'block',
                                                marginBottom: '6px',
                                                fontSize: '0.85rem',
                                                color: 'var(--text-secondary)',
                                                fontWeight: 500
                                            }}>Columns</label>
                                            <input type="number" placeholder="Cols" value={cols} onChange={e => setCols(e.target.value)} />
                                        </div>
                                    </div>

                                    {/* Auto Capacity Display */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '0.75rem 1rem',
                                        background: 'linear-gradient(135deg, rgba(0, 255, 157, 0.1), rgba(0, 243, 255, 0.05))',
                                        borderRadius: '8px',
                                        marginTop: '1rem',
                                        border: '1px solid rgba(0, 255, 157, 0.2)'
                                    }}>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                            Auto-Calculated Capacity:
                                        </span>
                                        <span style={{
                                            fontWeight: 700,
                                            fontSize: '1.1rem',
                                            color: 'var(--accent-green)'
                                        }}>
                                            {rows * cols * 2 - blockedSeats.size} seats
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                                                ({rows}×{cols}×2{blockedSeats.size > 0 ? ` - ${blockedSeats.size} blocked` : ''})
                                            </span>
                                        </span>
                                    </div>

                                    {/* Visual Preview */}
                                    <div style={{
                                        margin: '1.5rem 0',
                                        padding: '1.25rem',
                                        background: 'rgba(0,0,0,0.25)',
                                        borderRadius: '12px',
                                        border: '1px solid var(--glass-border)'
                                    }}>
                                        <p style={{
                                            fontSize: '0.85rem',
                                            marginBottom: '1rem',
                                            color: 'var(--text-secondary)'
                                        }}>
                                            Click seats to mark as blocked
                                        </p>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: `repeat(${cols}, 1fr)`,
                                            gap: '6px',
                                            maxWidth: '100%',
                                            overflow: 'auto'
                                        }}>
                                            {Array.from({ length: rows * cols * 2 }).map((_, i) => {
                                                const seatNum = i + 1;
                                                const isBlocked = blockedSeats.has(seatNum);
                                                return (
                                                    <div key={i}
                                                        onClick={() => toggleBlocked(seatNum)}
                                                        style={{
                                                            height: '28px',
                                                            background: isBlocked
                                                                ? 'linear-gradient(135deg, var(--error), rgba(255, 77, 77, 0.7))'
                                                                : 'rgba(255,255,255,0.08)',
                                                            border: isBlocked
                                                                ? '1px solid var(--error)'
                                                                : '1px solid rgba(255,255,255,0.15)',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.65rem',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            transition: 'all 0.2s ease',
                                                            color: isBlocked ? 'white' : 'var(--text-muted)'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            if (!isBlocked) e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                                                        }}
                                                        onMouseOut={(e) => {
                                                            if (!isBlocked) e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                                        }}
                                                    >
                                                        {seatNum}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <button className="secondary" onClick={addRoom} style={{ width: '100%' }}>
                                        + Add Room
                                    </button>

                                    {/* Added Rooms List */}
                                    {rooms.length > 0 && (
                                        <div style={{ marginTop: '1.5rem' }}>
                                            <p style={{
                                                fontSize: '0.85rem',
                                                color: 'var(--text-secondary)',
                                                marginBottom: '0.75rem'
                                            }}>
                                                Added Rooms ({rooms.length})
                                            </p>
                                            {rooms.map((r, idx) => (
                                                <div key={idx} style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    fontSize: '0.9rem',
                                                    padding: '0.75rem 1rem',
                                                    background: 'rgba(255,255,255,0.03)',
                                                    borderRadius: '8px',
                                                    marginBottom: '0.5rem',
                                                    border: '1px solid var(--glass-border)'
                                                }}>
                                                    <span>
                                                        <strong style={{ color: 'var(--accent-purple)' }}>{r.name}</strong>
                                                        {' '}({r.rows}×{r.cols})
                                                        {r.blocked.size > 0 && (
                                                            <span className="badge orange" style={{ marginLeft: '8px' }}>
                                                                {r.blocked.size} blocked
                                                            </span>
                                                        )}
                                                    </span>
                                                    <span
                                                        onClick={() => removeRoom(idx)}
                                                        style={{
                                                            color: 'var(--error)',
                                                            cursor: 'pointer',
                                                            padding: '0.25rem 0.5rem',
                                                            borderRadius: '4px',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 77, 77, 0.1)'}
                                                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                                    >
                                                        ✕ Remove
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                            </div>

                            {/* Right: Upload & Submit */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                                {/* 3. Student Upload */}
                                <div className="glass-card accent-green" style={{
                                    animation: 'fadeInUp 0.5s ease 0.3s forwards',
                                    opacity: 0
                                }}>
                                    <h3 style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        marginBottom: '1.5rem'
                                    }}>
                                        <span style={{
                                            background: 'var(--accent-green-soft)',
                                            padding: '0.5rem 0.75rem',
                                            borderRadius: '8px'
                                        }}>3</span>
                                        Student Data
                                    </h3>
                                    <div style={{
                                        border: '2px dashed rgba(0, 255, 157, 0.3)',
                                        padding: '2.5rem 2rem',
                                        textAlign: 'center',
                                        borderRadius: '12px',
                                        marginBottom: '1rem',
                                        background: 'rgba(0, 255, 157, 0.02)',
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer'
                                    }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.borderColor = 'var(--accent-green)';
                                            e.currentTarget.style.background = 'rgba(0, 255, 157, 0.05)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.borderColor = 'rgba(0, 255, 157, 0.3)';
                                            e.currentTarget.style.background = 'rgba(0, 255, 157, 0.02)';
                                        }}
                                    >
                                        <input type="file" accept=".csv, .xlsx, .xls" onChange={handleFileChange} style={{ display: 'none' }} id="fileUpload" />
                                        <label htmlFor="fileUpload" style={{ cursor: 'pointer' }}>
                                            <div style={{ marginBottom: '1rem' }}>
                                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="1.5" style={{ opacity: 0.8 }}>
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                    <polyline points="17,8 12,3 7,8" />
                                                    <line x1="12" y1="3" x2="12" y2="15" />
                                                </svg>
                                            </div>
                                            <div style={{ color: 'var(--accent-green)', fontWeight: 500, marginBottom: '0.5rem' }}>
                                                Click to Upload Excel/CSV
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                Supported formats: .xlsx, .xls, .csv
                                            </div>
                                        </label>
                                    </div>
                                    {file && (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            padding: '0.75rem 1rem',
                                            background: 'var(--accent-green-soft)',
                                            borderRadius: '8px',
                                            marginBottom: '1rem'
                                        }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="2">
                                                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                                            </svg>
                                            <span style={{ color: 'var(--accent-green)' }}>{file.name}</span>
                                        </div>
                                    )}

                                    {/* Preview Table */}
                                    {filePreview.length > 0 && (
                                        <div style={{
                                            overflowX: 'auto',
                                            borderRadius: '8px',
                                            border: '1px solid var(--glass-border)'
                                        }}>
                                            <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                                                <tbody>
                                                    {filePreview.map((row, rIdx) => (
                                                        <tr key={rIdx} style={{
                                                            background: rIdx === 0 ? 'rgba(0, 255, 157, 0.1)' : 'transparent'
                                                        }}>
                                                            {row.map((cell, cIdx) => (
                                                                <td key={cIdx} style={{
                                                                    padding: '8px 12px',
                                                                    border: '1px solid rgba(255,255,255,0.08)',
                                                                    fontWeight: rIdx === 0 ? 600 : 400
                                                                }}>{cell}</td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* Subject Distribution Card */}
                                    {Object.keys(subjectDistribution).length > 0 && (
                                        <div style={{
                                            marginTop: '1rem',
                                            padding: '1rem',
                                            background: 'rgba(123, 97, 255, 0.08)',
                                            borderRadius: '10px',
                                            border: '1px solid rgba(123, 97, 255, 0.2)'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: '0.75rem'
                                            }}>
                                                <span style={{ fontWeight: 600, color: 'var(--accent-purple)' }}>
                                                    Subject Distribution
                                                </span>
                                                <span className="badge purple">{totalStudents} students</span>
                                            </div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                {Object.entries(subjectDistribution).map(([subject, count]) => (
                                                    <div key={subject} style={{
                                                        padding: '0.4rem 0.75rem',
                                                        background: 'rgba(255,255,255,0.05)',
                                                        borderRadius: '6px',
                                                        fontSize: '0.8rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}>
                                                        <span style={{ color: 'var(--text-secondary)' }}>{subject}:</span>
                                                        <span style={{ fontWeight: 600 }}>{count}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Capacity Warning System */}
                                    {totalStudents > 0 && (
                                        <div style={{
                                            marginTop: '1rem',
                                            padding: '1rem',
                                            background: isCapacitySufficient()
                                                ? 'rgba(0, 255, 157, 0.08)'
                                                : 'rgba(255, 77, 77, 0.15)',
                                            borderRadius: '10px',
                                            border: `1px solid ${isCapacitySufficient() ? 'rgba(0, 255, 157, 0.3)' : 'var(--error)'}`,
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {isCapacitySufficient() ? (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="2">
                                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                                        <polyline points="22,4 12,14.01 9,11.01" />
                                                    </svg>
                                                ) : (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="2">
                                                        <circle cx="12" cy="12" r="10" />
                                                        <line x1="12" y1="8" x2="12" y2="12" />
                                                        <line x1="12" y1="16" x2="12.01" y2="16" />
                                                    </svg>
                                                )}
                                                <span style={{
                                                    fontWeight: 600,
                                                    color: isCapacitySufficient() ? 'var(--accent-green)' : 'var(--error)'
                                                }}>
                                                    {isCapacitySufficient() ? 'Capacity OK' : 'CAPACITY OVERFLOW!'}
                                                </span>
                                            </div>
                                            <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
                                                <div style={{ color: 'var(--text-secondary)' }}>
                                                    Students: <strong>{totalStudents}</strong> / Capacity: <strong>{getTotalCapacity()}</strong>
                                                </div>
                                                {!isCapacitySufficient() && (
                                                    <div style={{ color: 'var(--error)', fontWeight: 600, marginTop: '4px' }}>
                                                        Need {totalStudents - getTotalCapacity()} more seats!
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* 4. Submit */}
                                <div className="glass-card" style={{
                                    animation: 'fadeInUp 0.5s ease 0.4s forwards',
                                    opacity: 0,
                                    background: 'linear-gradient(135deg, rgba(0, 255, 157, 0.05), rgba(0, 243, 255, 0.03))',
                                    borderColor: 'rgba(0, 255, 157, 0.2)'
                                }}>
                                    <h3 style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        marginBottom: '1.5rem'
                                    }}>
                                        <span style={{
                                            background: 'var(--accent-orange-soft)',
                                            padding: '0.5rem 0.75rem',
                                            borderRadius: '8px'
                                        }}>4</span>
                                        Finalize & Generate
                                    </h3>
                                    {msg && (
                                        <div className={msg.includes('Error') ? 'error-msg' : 'message success'} style={{ marginBottom: '1rem' }}>
                                            {msg}
                                        </div>
                                    )}
                                    <button
                                        className="primary"
                                        onClick={handleSubmit}
                                        style={{
                                            width: '100%',
                                            fontSize: '1.1rem',
                                            padding: '1.1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '10px'
                                        }}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                            <polyline points="22,4 12,14.01 9,11.01" />
                                        </svg>
                                        Generate Seating Plan
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default Dashboard;
