import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import SeatingView from './components/SeatingView';
import StudentSearch from './components/StudentSearch';
import AuroraBackground from './components/AuroraBackground';
import './index.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleLogin = (username) => {
    setUser(username);
    localStorage.setItem('user', username);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <Router>
      {/* Aurora Background - Static dawn image + animated aurora video */}
      <div className="aurora-bg">
        {/* Static dawn/horizon background */}
        <img
          src="/aurora-bg.webp"
          alt=""
          className="aurora-dawn"
        />
        {/* Animated aurora lights video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="aurora-video"
        >
          <source src="/beam.webm" type="video/webm" />
        </video>
      </div>

      <div className="app-container">
        <nav className="navbar">
          <Link to="/" className="brand-logo">
            <span className="brand-text-white">EXAM</span>
            <span className="brand-box-orange">HUB</span>
          </Link>
          <div className="nav-links">
            {user ? (
              <>
                <Link to="/dashboard">Dashboard</Link>
                <button onClick={handleLogout} className="btn-link">Logout</button>
              </>
            ) : (
              <>
                <Link to="/student">Student</Link>
                <Link to="/admin">Admin</Link>
              </>
            )}
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/student" element={<StudentSearch />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin" element={user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} />
          <Route path="/login" element={<Navigate to="/admin" />} /> {/* Redirect old route */}
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/admin" />} />
          <Route path="/seating/:id" element={user ? <SeatingView /> : <Navigate to="/admin" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
