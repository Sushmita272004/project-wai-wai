import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/Auth.css";
import {
  FiBriefcase,
  FiUser,
  FiAlertCircle,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

const Auth = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [userRole, setUserRole] = useState("employer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const { user } = await login(email, password);
        const actualRole = user.user_metadata?.role;

        if (actualRole && actualRole !== userRole) {
          throw new Error(
            `Access Denied: You are registered as a ${actualRole}. Please switch tabs.`,
          );
        }

        if (userRole === "employer") {
          navigate("/generate-job");
        } else {
          navigate("/");
        }
      } else {
        await register(email, password, userRole);
        alert(
          "Registration successful! Please check your email for verification.",
        );
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        {/* Left Side - Branding */}
        <motion.div
          className="auth-branding-side"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="auth-branding-content">
            <motion.div
              className="auth-logo-section"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="auth-large-logo">
                <FiBriefcase />
              </div>
              <h2 className="auth-brand-title">Wevolve AI</h2>
            </motion.div>

            <motion.p
              className="auth-brand-subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Transform your hiring process with AI-powered job descriptions
            </motion.p>

            <motion.div
              className="auth-features"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              {[
                "AI-Powered Generation",
                "ATS-Optimized",
                "Save Time & Effort",
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="auth-feature-item"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                >
                  <div className="auth-feature-icon">✓</div>
                  <span>{feature}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Form */}
        <motion.div
          className="auth-form-side"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="auth-form-container">
            <motion.h2
              className="auth-heading"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {isLogin ? "Welcome Back!" : "Create Account"}
            </motion.h2>

            <motion.p
              className="auth-subheading"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {isLogin ? "Sign in to continue" : "Get started with Wevolve AI"}
            </motion.p>

            {/* Role Tabs */}
            <motion.div
              className="auth-role-selector"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <motion.button
                className={`auth-role-btn ${userRole === "employer" ? "auth-role-btn-active" : ""}`}
                onClick={() => setUserRole("employer")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiBriefcase className="auth-role-icon" />
                Employer
              </motion.button>
              <motion.button
                className={`auth-role-btn ${userRole === "candidate" ? "auth-role-btn-active" : ""}`}
                onClick={() => setUserRole("candidate")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiUser className="auth-role-icon" />
                Job Seeker
              </motion.button>
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="auth-error-box"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <FiAlertCircle className="auth-error-icon" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="auth-form">
              <motion.div
                className="auth-input-group"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                <label className="auth-label">Email Address</label>
                <div className="auth-input-wrapper">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="auth-input"
                    placeholder="name@company.com"
                  />
                </div>
              </motion.div>

              <motion.div
                className="auth-input-group"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.7 }}
              >
                <label className="auth-label">Password</label>
                <div className="auth-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="auth-input"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="auth-eye-button"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </motion.div>

              <motion.button
                type="submit"
                disabled={loading}
                className={`auth-submit-btn ${loading ? "auth-submit-btn-disabled" : ""}`}
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.8 }}
              >
                {loading ? (
                  <>
                    <motion.div
                      className="auth-spinner"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    Processing...
                  </>
                ) : isLogin ? (
                  `Sign In as ${userRole === "employer" ? "Employer" : "Job Seeker"}`
                ) : (
                  "Create Account"
                )}
              </motion.button>
            </form>

            {/* Switch Auth Mode */}
            <motion.p
              className="auth-switch-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
              <motion.span
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="auth-switch-link"
                whileHover={{ scale: 1.05 }}
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </motion.span>
            </motion.p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
