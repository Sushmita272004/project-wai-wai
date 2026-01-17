// frontend/wai-wai/src/pages/Auth.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  // State
  const [isLogin, setIsLogin] = useState(true); // Toggle Login vs Register
  const [userRole, setUserRole] = useState('employer'); // Toggle Employer vs Candidate
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // --- LOGIN LOGIC ---
        const { user } = await login(email, password);
        
        // STRICT ROLE CHECK
        // If the user tries to login as Employer but is actually a Candidate (or vice versa)
        const actualRole = user.user_metadata?.role;
        
        if (actualRole && actualRole !== userRole) {
          throw new Error(`Access Denied: You are registered as a ${actualRole}. Please switch tabs.`);
        }

        // Success - Redirect based on role
        if (userRole === 'employer') {
            navigate('/generate-job'); // Employers go to generator
        } else {
            navigate('/'); // Candidates go home (for now)
        }

      } else {
        // --- REGISTER LOGIC ---
        await register(email, password, userRole);
        alert("Registration successful! Please check your email for verification.");
        setIsLogin(true); // Switch to login view
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.header}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>

        {/* ROLE TABS */}
        <div style={styles.tabContainer}>
            <button 
                style={userRole === 'employer' ? styles.activeTab : styles.tab}
                onClick={() => setUserRole('employer')}
            >
                Employer
            </button>
            <button 
                style={userRole === 'candidate' ? styles.activeTab : styles.tab}
                onClick={() => setUserRole('candidate')}
            >
                Job Seeker
            </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
            {error && <div style={styles.error}>{error}</div>}

            <label style={styles.label}>Email</label>
            <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
                placeholder="name@company.com"
            />

            <label style={styles.label}>Password</label>
            <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
                placeholder="••••••••"
            />

            <button disabled={loading} style={styles.submitBtn}>
                {loading ? 'Processing...' : (isLogin ? `Login as ${userRole === 'employer' ? 'Employer' : 'Job Seeker'}` : 'Sign Up')}
            </button>
        </form>

        <p style={styles.switchText}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => setIsLogin(!isLogin)} style={styles.link}>
                {isLogin ? 'Register' : 'Login'}
            </span>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' },
  card: { width: '100%', maxWidth: '400px', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '8px', backgroundColor: 'white' },
  header: { textAlign: 'center', marginBottom: '1.5rem', color: '#333' },
  tabContainer: { display: 'flex', marginBottom: '1.5rem', borderBottom: '1px solid #ddd' },
  tab: { flex: 1, padding: '0.8rem', background: 'none', border: 'none', cursor: 'pointer', color: '#666', borderBottom: '2px solid transparent' },
  activeTab: { flex: 1, padding: '0.8rem', background: 'none', border: 'none', cursor: 'pointer', color: '#646cff', fontWeight: 'bold', borderBottom: '2px solid #646cff' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  label: { fontSize: '0.9rem', fontWeight: 'bold', color: '#444', textAlign: 'left' },
  input: { padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd' },
  submitBtn: { padding: '0.8rem', backgroundColor: '#646cff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '1rem' },
  switchText: { textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#666' },
  link: { color: '#646cff', cursor: 'pointer', fontWeight: 'bold' },
  error: { padding: '0.8rem', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '4px', fontSize: '0.9rem', textAlign: 'center' }
};

export default Auth;