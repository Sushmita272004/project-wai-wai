// frontend/wai-wai/src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import wevolveLogo from "../assets/wevolve_logo.png";
import {
  FiHome,
  FiBriefcase,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiBarChart2,
  FiBell,
  FiInfo, // Added for Toast Icon
} from "react-icons/fi";
import "../styles/Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // --- REAL-TIME NOTIFICATION STATE ---
  const [socket, setSocket] = useState(null);
  const [toast, setToast] = useState(null); // Stores the latest notification for the popup

  // 1. Initial Fetch of Unread Count & Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    if (user?.email) {
      const API_BASE =
        import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";
      fetch(`${API_BASE}/notifications/user/${user.email}/unread-count`)
        .then((res) => res.json())
        .then((data) => setUnreadCount(data.count))
        .catch((err) => console.error(err));
    }
    return () => window.removeEventListener("scroll", handleScroll);
  }, [user]);

  // 2. WEBSOCKET CONNECTION
  useEffect(() => {
    if (!user?.email) return;

    // Connect to Backend WebSocket
    const API_BASE =
      import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";
    const WS_URL = API_BASE.replace(/^https/, "wss").replace(/^http/, "ws");
    const ws = new WebSocket(`${WS_URL}/ws/${user.email}`);

    ws.onopen = () => {
      console.log("🟢 Connected to Real-Time Notification Server");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("📩 Real-Time Update Received:", data);

      if (data.type === "NEW_NOTIFICATION") {
        // A. Increment Badge
        setUnreadCount((prev) => prev + 1);

        // B. Show Toast
        setToast(data.notification);

        // Auto-hide toast after 5 seconds
        setTimeout(() => setToast(null), 5000);
      }
    };

    ws.onclose = () => console.log("🔴 Disconnected from Notification Server");
    setSocket(ws);

    return () => {
      ws.close(); // Cleanup on unmount/logout
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      setMobileMenuOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout. Please try again.");
    }
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: "/", label: "Home", icon: <FiHome /> },
    ...(user?.user_metadata?.role === "candidate"
      ? [
          {
            path: "/jobs",
            label: "Job Dashboard",
            icon: <FiBriefcase />,
          },
        ]
      : []),
    ...(user?.user_metadata?.role === "employer"
      ? [
          {
            path: "/generate-job",
            label: "Job Generator",
            icon: <FiBriefcase />,
          },
          {
            path: "/analytics",
            label: "Analytics",
            icon: <FiBarChart2 />,
          },
        ]
      : []),
    // Add Resume Parser to main nav for visibility
    ...(user
      ? [
          {
            path: "/resume-parser",
            label: "Smart Resume",
            icon: <FiUser />,
          },
        ]
      : []),
  ];

  return (
    <>
      <motion.nav
        className={`${scrolled ? "scrolled" : ""}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="navbar-container">
          {/* Logo (hidden on mobile via CSS) */}
          <Link to="/" className="logo-link">
            <motion.div
              className="logo"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img
                src={wevolveLogo}
                alt="Wevolve AI"
                style={{ height: "40px", width: "auto", marginRight: "10px" }}
              />
              <span className="logo-text">Wevolve AI</span>
            </motion.div>
          </Link>

          {/* Desktop Links */}
          <div className="desktop-links">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                style={{ textDecoration: "none" }}
              >
                <div
                  className={`nav-link ${isActive(link.path) ? "active" : ""}`}
                >
                  {link.label}
                </div>
              </Link>
            ))}
          </div>

          {/* User Actions (Desktop) */}
          <div className="desktop-actions">
            {user ? (
              <>
                {/* NOTIFICATION BELL WITH REAL-TIME BADGE */}
                <Link to="/notifications" className="nav-icon-link">
                  <div className="notification-bell">
                    <FiBell size={20} />
                    {unreadCount > 0 && (
                      <span className="nav-badge">{unreadCount}</span>
                    )}
                  </div>
                </Link>

                <button onClick={handleLogout} className="cta-button">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/auth" className="cta-button">
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Mobile Logo inside hamburger */}
              <Link
                to="/"
                style={{ textDecoration: "none" }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <motion.div
                  className="mobile-logo"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.05 }}
                >
                  <img src={wevolveLogo} alt="Wevolve AI" />
                  <span className="mobile-logo-text">Wevolve AI</span>
                </motion.div>
              </Link>
              {navLinks.map((link, index) => (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{ textDecoration: "none" }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <motion.div
                    className={`mobile-nav-link ${
                      isActive(link.path) ? "active" : ""
                    }`}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <span className="nav-icon">{link.icon}</span>
                    {link.label}
                  </motion.div>
                </Link>
              ))}

              {user ? (
                <>
                  <div className="mobile-user-info">
                    <FiUser className="user-icon" />
                    <span>{user.email}</span>
                  </div>
                  {/* Mobile Notification Link */}
                  <Link
                    to="/notifications"
                    style={{ textDecoration: "none" }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <motion.div
                      className={`mobile-nav-link ${
                        isActive("/notifications") ? "active" : ""
                      }`}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: navLinks.length * 0.1 }}
                    >
                      <span className="nav-icon">
                        <FiBell />
                      </span>
                      Notifications {unreadCount > 0 && `(${unreadCount})`}
                    </motion.div>
                  </Link>

                  <motion.button
                    onClick={handleLogout}
                    className="mobile-logout-btn"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: navLinks.length * 0.1 + 0.1 }}
                  >
                    <FiLogOut className="btn-icon" />
                    Logout
                  </motion.button>
                </>
              ) : (
                <Link
                  to="/auth"
                  style={{ textDecoration: "none" }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <motion.button
                    className="mobile-cta-button"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: navLinks.length * 0.1 }}
                  >
                    Get Started
                  </motion.button>
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* --- REAL-TIME TOAST NOTIFICATION UI --- */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="realtime-toast"
            initial={{ opacity: 0, y: 50, x: 50 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="toast-icon">
              <FiBell />
            </div>
            <div className="toast-content">
              <h4>{toast.title}</h4>
              <p>{toast.message}</p>
            </div>
            <button className="toast-close" onClick={() => setToast(null)}>
              <FiX />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
