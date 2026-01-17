import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMail,
  FiLock,
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
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Left Side - Branding */}
        <motion.div
          style={styles.brandingSide}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div style={styles.brandingContent}>
            <motion.div
              style={styles.logoSection}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div style={styles.largeLogo}>
                <FiBriefcase />
              </div>
              <h2 style={styles.brandTitle}>Wevolve AI</h2>
            </motion.div>

            <motion.p
              style={styles.brandSubtitle}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Transform your hiring process with AI-powered job descriptions
            </motion.p>

            <motion.div
              style={styles.features}
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
                  style={styles.featureItem}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                >
                  <div style={styles.checkIcon}>✓</div>
                  <span>{feature}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Form */}
        <motion.div
          style={styles.formSide}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div style={styles.formContainer}>
            <motion.h2
              style={styles.formTitle}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {isLogin ? "Welcome Back!" : "Create Account"}
            </motion.h2>

            <motion.p
              style={styles.formSubtitle}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {isLogin ? "Sign in to continue" : "Get started with Wevolve AI"}
            </motion.p>

            {/* Role Tabs */}
            <motion.div
              style={styles.tabContainer}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <motion.button
                style={{
                  ...styles.tab,
                  ...(userRole === "employer" ? styles.activeTab : {}),
                }}
                onClick={() => setUserRole("employer")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiBriefcase style={styles.tabIcon} />
                Employer
              </motion.button>
              <motion.button
                style={{
                  ...styles.tab,
                  ...(userRole === "candidate" ? styles.activeTab : {}),
                }}
                onClick={() => setUserRole("candidate")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiUser style={styles.tabIcon} />
                Job Seeker
              </motion.button>
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  style={styles.errorBox}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <FiAlertCircle style={styles.errorIcon} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} style={styles.form}>
              <motion.div
                style={styles.inputGroup}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                <label style={styles.label}>Email Address</label>
                <div style={styles.inputWrapper}>
                  <FiMail style={styles.inputIcon} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={styles.input}
                    placeholder="name@company.com"
                  />
                </div>
              </motion.div>

              <motion.div
                style={styles.inputGroup}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.7 }}
              >
                <label style={styles.label}>Password</label>
                <div style={styles.inputWrapper}>
                  <FiLock style={styles.inputIcon} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={styles.input}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </motion.div>

              <motion.button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.submitBtn,
                  ...(loading ? styles.submitBtnDisabled : {}),
                }}
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.8 }}
              >
                {loading ? (
                  <>
                    <motion.div
                      style={styles.spinner}
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
              style={styles.switchText}
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
                style={styles.switchLink}
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

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem 1rem",
    background: "linear-gradient(135deg, #F9FAFB 0%, #EEF2FF 100%)",
  },
  wrapper: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    maxWidth: "1100px",
    width: "100%",
    backgroundColor: "white",
    borderRadius: "1.5rem",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
  },
  brandingSide: {
    background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
    padding: "4rem 3rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
  },
  brandingContent: {
    maxWidth: "400px",
  },
  logoSection: {
    textAlign: "center",
    marginBottom: "3rem",
  },
  largeLogo: {
    width: "80px",
    height: "80px",
    margin: "0 auto 1.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2.5rem",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: "1.5rem",
    backdropFilter: "blur(10px)",
  },
  brandTitle: {
    fontSize: "2.5rem",
    fontWeight: "800",
    marginBottom: "0.5rem",
  },
  brandSubtitle: {
    fontSize: "1.125rem",
    lineHeight: "1.7",
    opacity: 0.95,
    marginBottom: "3rem",
  },
  features: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    fontSize: "1rem",
  },
  checkIcon: {
    width: "24px",
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: "50%",
    fontWeight: "bold",
  },
  formSide: {
    padding: "4rem 3rem",
    display: "flex",
    alignItems: "center",
  },
  formContainer: {
    width: "100%",
    maxWidth: "400px",
    margin: "0 auto",
  },
  formTitle: {
    fontSize: "2rem",
    fontWeight: "800",
    marginBottom: "0.5rem",
    color: "#111827",
  },
  formSubtitle: {
    fontSize: "1rem",
    color: "#6B7280",
    marginBottom: "2rem",
  },
  tabContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.75rem",
    marginBottom: "2rem",
    padding: "0.5rem",
    backgroundColor: "#F3F4F6",
    borderRadius: "0.75rem",
  },
  tab: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "0.75rem 1rem",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "0.5rem",
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "#6B7280",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  activeTab: {
    backgroundColor: "white",
    color: "#4F46E5",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  tabIcon: {
    fontSize: "1.125rem",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "1rem",
    backgroundColor: "#FEE2E2",
    color: "#DC2626",
    borderRadius: "0.75rem",
    fontSize: "0.875rem",
    marginBottom: "1.5rem",
    border: "1px solid #FCA5A5",
  },
  errorIcon: {
    fontSize: "1.25rem",
    flexShrink: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#374151",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: "1rem",
    fontSize: "1.125rem",
    color: "#9CA3AF",
  },
  input: {
    width: "100%",
    padding: "0.875rem 1rem 0.875rem 3rem",
    border: "2px solid #E5E7EB",
    borderRadius: "0.75rem",
    fontSize: "1rem",
    transition: "all 0.2s ease",
    backgroundColor: "white",
  },
  eyeButton: {
    position: "absolute",
    right: "1rem",
    padding: "0.5rem",
    backgroundColor: "transparent",
    border: "none",
    color: "#9CA3AF",
    cursor: "pointer",
    fontSize: "1.125rem",
    display: "flex",
    alignItems: "center",
  },
  submitBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "1rem",
    fontSize: "1rem",
    fontWeight: "600",
    color: "white",
    background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
    border: "none",
    borderRadius: "0.75rem",
    cursor: "pointer",
    marginTop: "0.5rem",
    boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
    transition: "all 0.2s ease",
  },
  submitBtnDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
  },
  spinner: {
    width: "20px",
    height: "20px",
    border: "3px solid rgba(255,255,255,0.3)",
    borderTop: "3px solid white",
    borderRadius: "50%",
  },
  switchText: {
    textAlign: "center",
    fontSize: "0.95rem",
    color: "#6B7280",
    marginTop: "1.5rem",
  },
  switchLink: {
    color: "#4F46E5",
    fontWeight: "600",
    cursor: "pointer",
    display: "inline-block",
  },
};

// Responsive styles
if (typeof window !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @media (max-width: 968px) {
      .wrapper {
        grid-template-columns: 1fr !important;
      }
      .brandingSide {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export default Auth;
