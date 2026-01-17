// frontend/wai-wai/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import JobGenerator from './pages/JobGenerator';
import ResumeParser from './pages/ResumeParser'; // Import the new page
import Auth from './pages/Auth';
import ProtectedRoute from './components/ProtectedRoute'; // Ensure this is imported for security
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
            width: "100%",
          }}
        >
          <Navbar />
          <main style={{ flex: 1, width: "100%" }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Job Generator: Restricted to Employers */}
              <Route 
                path="/generate-job" 
                element={
                  <ProtectedRoute allowedRoles={['employer']}>
                    <JobGenerator />
                  </ProtectedRoute>
                } 
              />

              {/* Resume Parser: Available to both */}
              <Route 
                path="/resume-parser" 
                element={
                  <ProtectedRoute allowedRoles={['employer', 'candidate']}>
                    <ResumeParser />
                  </ProtectedRoute>
                } 
              />
              
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
