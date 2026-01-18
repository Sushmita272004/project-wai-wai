// frontend/wai-wai/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import JobDashboard from "./pages/JobDashboard";
import JobGenerator from "./pages/JobGenerator";
import ResumeParser from "./pages/ResumeParser";
import Analytics from "./pages/Analytics";
import Auth from "./pages/Auth";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

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
              {/* LANDING PAGE: Home with all features showcase */}
              <Route path="/" element={<Home />} />

              <Route path="/auth" element={<Auth />} />

              {/* Public informational pages */}
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/contact" element={<Contact />} />

              {/* Job Dashboard: Requires Login */}
              <Route
                path="/jobs"
                element={
                  <ProtectedRoute>
                    <JobDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Job Generator: Restricted to Employers */}
              <Route
                path="/generate-job"
                element={
                  <ProtectedRoute allowedRoles={["employer"]}>
                    <JobGenerator />
                  </ProtectedRoute>
                }
              />

              {/* Resume Parser: Available to both */}
              <Route
                path="/resume-parser"
                element={
                  <ProtectedRoute allowedRoles={["employer", "candidate"]}>
                    <ResumeParser />
                  </ProtectedRoute>
                }
              />

              {/* Analytics Dashboard: Restricted to Employers */}
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute allowedRoles={["employer"]}>
                    <Analytics />
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
