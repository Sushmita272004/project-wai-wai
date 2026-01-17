"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Briefcase,
  User,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Target,
  Zap,
  Search,
  FileText,
  Users,
} from "lucide-react";
import "../styles/Auth.css";

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
        const { data } = await login(email, password);
        const authedUser = data?.user || data?.session?.user;
        const actualRole = authedUser?.user_metadata?.role;

        if (actualRole && actualRole !== userRole) {
          throw new Error(
            `Access denied: you are registered as ${actualRole}. Switch to the correct tab.`,
          );
        }

        if (actualRole === "employer" || userRole === "employer") {
          navigate("/generate-job");
        } else {
          navigate("/");
        }
      } else {
        await register(email, password, userRole);
        setIsLogin(true);
      }
    } catch (err) {
      setError(err?.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const roleContent = {
    employer: {
      icon: Briefcase,
      title: "Wevolve AI",
      subtitle:
        "Transform your hiring process with AI-powered job descriptions",
      features: [
        { icon: Sparkles, text: "AI-Powered Generation" },
        { icon: Target, text: "ATS-Optimized" },
        { icon: Zap, text: "Save Time & Effort" },
      ],
      gradient: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
      accentColor: "#0ea5e9",
    },
    candidate: {
      icon: User,
      title: "Wevolve AI",
      subtitle: "Find your dream job with AI-powered career matching",
      features: [
        { icon: Search, text: "Smart Job Matching" },
        { icon: FileText, text: "Resume Optimization" },
        { icon: Users, text: "Connect with Employers" },
      ],
      gradient: "linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)",
      accentColor: "#10b981",
    },
  };

  const currentRole = roleContent[userRole];
  const RoleIcon = currentRole.icon;

  // Floating particles for background
  const particles = Array.from({ length: 6 }, (_, i) => i);

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        {/* Left Side - Branding with Role-based Animation */}
        <motion.div
          className="auth-branding-side"
          initial={{ opacity: 0, x: -50 }}
          animate={{
            opacity: 1,
            x: 0,
            background: currentRole.gradient,
          }}
          transition={{ duration: 0.6 }}
        >
          {/* Animated Background Particles */}
          <div className="auth-particles">
            {particles.map((i) => (
              <motion.div
                key={i}
                className="auth-particle"
                animate={{
                  y: [0, -30, 0],
                  x: [0, Math.sin(i) * 20, 0],
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.3,
                  ease: "easeInOut",
                }}
                style={{
                  left: `${15 + i * 15}%`,
                  top: `${20 + (i % 3) * 25}%`,
                }}
              />
            ))}
          </div>

          <div className="auth-branding-content">
            <AnimatePresence mode="wait">
              <motion.div
                key={userRole}
                className="auth-logo-section"
                initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                exit={{ scale: 0.8, opacity: 0, rotateY: 90 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
              >
                <motion.div
                  className="auth-large-logo"
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(255,255,255,0.2)",
                      "0 0 40px rgba(255,255,255,0.4)",
                      "0 0 20px rgba(255,255,255,0.2)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                  <motion.div
                    animate={{ rotate: userRole === "employer" ? 0 : 360 }}
                    transition={{ duration: 0.6, type: "spring" }}
                  >
                    <RoleIcon size={48} />
                  </motion.div>
                </motion.div>
                <h2 className="auth-brand-title">{currentRole.title}</h2>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.p
                key={`subtitle-${userRole}`}
                className="auth-brand-subtitle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {currentRole.subtitle}
              </motion.p>
            </AnimatePresence>

            <motion.div className="auth-features">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`features-${userRole}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentRole.features.map((feature, index) => {
                    const FeatureIcon = feature.icon;
                    return (
                      <motion.div
                        key={index}
                        className="auth-feature-item"
                        initial={{ x: -30, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{
                          duration: 0.4,
                          delay: 0.1 + index * 0.1,
                          type: "spring",
                          stiffness: 100,
                        }}
                      >
                        <motion.div
                          className="auth-feature-icon-wrapper"
                          whileHover={{ scale: 1.2, rotate: 10 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <FeatureIcon size={20} />
                        </motion.div>
                        <span>{feature.text}</span>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
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
            <AnimatePresence mode="wait">
              <motion.h2
                key={`heading-${isLogin}`}
                className="auth-heading"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {isLogin ? "Welcome Back!" : "Create Account"}
              </motion.h2>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.p
                key={`subheading-${isLogin}`}
                className="auth-subheading"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                {isLogin
                  ? "Sign in to continue"
                  : "Get started with Wevolve AI"}
              </motion.p>
            </AnimatePresence>

            {/* Role Tabs with Sliding Indicator */}
            <motion.div
              className="auth-role-selector"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Sliding Background Indicator */}
              <motion.div
                className="auth-role-indicator"
                layout
                animate={{
                  x: userRole === "employer" ? 0 : "100%",
                  background:
                    userRole === "employer"
                      ? "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)"
                      : "linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)",
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
              />

              <motion.button
                className={`auth-role-btn ${userRole === "employer" ? "auth-role-btn-active" : ""}`}
                onClick={() => setUserRole("employer")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  animate={{
                    rotate: userRole === "employer" ? [0, -10, 10, 0] : 0,
                    scale: userRole === "employer" ? [1, 1.2, 1] : 1,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <Briefcase className="auth-role-icon" size={18} />
                </motion.div>
                <span>Employer</span>
              </motion.button>

              <motion.button
                className={`auth-role-btn ${userRole === "candidate" ? "auth-role-btn-active" : ""}`}
                onClick={() => setUserRole("candidate")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  animate={{
                    rotate: userRole === "candidate" ? [0, -10, 10, 0] : 0,
                    scale: userRole === "candidate" ? [1, 1.2, 1] : 1,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <User className="auth-role-icon" size={18} />
                </motion.div>
                <span>Job Seeker</span>
              </motion.button>
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="auth-error-box"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                >
                  <AlertCircle className="auth-error-icon" size={20} />
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
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <label className="auth-label">Email Address</label>
                <motion.div
                  className="auth-input-wrapper"
                  whileFocus={{ scale: 1.01 }}
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="auth-input"
                    placeholder="name@company.com"
                  />
                </motion.div>
              </motion.div>

              <motion.div
                className="auth-input-group"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
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
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="auth-eye-button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={showPassword ? "visible" : "hidden"}
                        initial={{ opacity: 0, rotate: -90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 90 }}
                        transition={{ duration: 0.2 }}
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </motion.button>
                </div>
              </motion.div>

              <motion.button
                type="submit"
                disabled={loading}
                className={`auth-submit-btn ${loading ? "auth-submit-btn-disabled" : ""}`}
                whileHover={!loading ? { scale: 1.02, y: -2 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                initial={{ y: 20, opacity: 0 }}
                animate={{
                  y: 0,
                  opacity: 1,
                  background:
                    userRole === "employer"
                      ? "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)"
                      : "linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)",
                }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                {loading ? (
                  <>
                    <motion.div
                      className="auth-spinner"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                    />
                    Processing...
                  </>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`btn-${isLogin}-${userRole}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isLogin
                        ? `Sign In as ${userRole === "employer" ? "Employer" : "Job Seeker"}`
                        : "Create Account"}
                    </motion.span>
                  </AnimatePresence>
                )}
              </motion.button>
            </form>

            {/* Switch Auth Mode */}
            <motion.p
              className="auth-switch-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
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
                whileTap={{ scale: 0.95 }}
                style={{
                  color: currentRole.accentColor,
                }}
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
