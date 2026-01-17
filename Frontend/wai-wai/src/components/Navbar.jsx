// src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>Wevolve AI</div>
      <div style={styles.links}>
        <Link to="/" style={styles.link}>Home</Link>
        {/* The requested link in the Navbar */}
        <Link to="/generate-job" style={styles.ctaButton}>Job Generator</Link>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 1000
  },
  logo: {
    fontWeight: 'bold',
    fontSize: '1.5rem',
    color: '#333'
  },
  links: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center'
  },
  link: {
    textDecoration: 'none',
    color: '#555',
    fontWeight: '500'
  },
  ctaButton: {
    textDecoration: 'none',
    backgroundColor: '#646cff',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    fontWeight: 'bold',
    transition: 'background 0.3s'
  }
};

export default Navbar;