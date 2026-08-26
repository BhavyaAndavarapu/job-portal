import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>Job Portal</Link>
      <div style={styles.links}>
        <Link to="/" style={styles.link}>Jobs</Link>
        {user?.role === 'candidate' && (
          <Link to="/my-applications" style={styles.link}>My Applications</Link>
        )}
        {user?.role === 'recruiter' && (
          <Link to="/recruiter/dashboard" style={styles.link}>Dashboard</Link>
        )}
        {user ? (
          <button onClick={handleLogout} style={styles.button}>Logout ({user.name})</button>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.link}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: '#1e293b', color: '#fff' },
  brand: { color: '#fff', fontWeight: 'bold', fontSize: '1.2rem', textDecoration: 'none' },
  links: { display: 'flex', gap: '1.2rem', alignItems: 'center' },
  link: { color: '#cbd5e1', textDecoration: 'none' },
  button: { background: '#ef4444', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }
};
