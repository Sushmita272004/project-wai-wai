// frontend/wai-wai/src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>Wevolve AI</div>
      <div style={styles.links}>
        <Link to="/" style={styles.link}>Home</Link>
        
        {/* Only show Job Generator to Employers */}
        {user?.user_metadata?.role === 'employer' && (
             <Link to="/generate-job" style={styles.link}>Job Generator</Link>
        )}

        {/* Show Smart Resume to all logged-in users */}
        {user && (
             <Link to="/resume-parser" style={styles.link}>Smart Resume</Link>
        )}

        {user ? (
            <button onClick={handleLogout} style={styles.ctaButton}>Logout</button>
        ) : (
            <Link to="/auth" style={styles.ctaButton}>Login / Sign Up</Link>
        )}
      </div>
    </nav>
  );
};

const styles = {
    nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 1000 },
    logo: { fontWeight: 'bold', fontSize: '1.5rem', color: '#333' },
    links: { display: 'flex', gap: '20px', alignItems: 'center' },
    link: { textDecoration: 'none', color: '#555', fontWeight: '500' },
    ctaButton: { textDecoration: 'none', backgroundColor: '#646cff', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }
};

export default Navbar;