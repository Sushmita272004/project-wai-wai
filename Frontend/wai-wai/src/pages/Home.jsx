// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={styles.heroContainer}>
      <h1 style={styles.title}>Where Ambition Becomes Direction</h1>
      <p style={styles.subtitle}>
        Revolutionizing recruitment with AI-powered tools. Create professional, ATS-friendly job descriptions in seconds.
      </p>
      <div style={styles.buttonGroup}>
        <Link to="/generate-job">
          <button style={styles.primaryBtn}>Try Job Generator</button>
        </Link>
      </div>
    </div>
  );
};

const styles = {
  heroContainer: {
    textAlign: 'center',
    padding: '4rem 2rem',
    maxWidth: '800px',
    margin: '0 auto',
  },
  title: {
    fontSize: '3.5rem',
    marginBottom: '1rem',
    lineHeight: '1.2',
  },
  subtitle: {
    fontSize: '1.25rem',
    color: '#666',
    marginBottom: '2rem',
  },
  primaryBtn: {
    fontSize: '1.1rem',
    padding: '0.8rem 1.6rem',
    backgroundColor: '#646cff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  }
};

export default Home;