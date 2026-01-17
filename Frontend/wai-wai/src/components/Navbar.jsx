// frontend/wai-wai/src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    ...(user?.user_metadata?.role === "employer"
      ? [
          {
            path: "/generate-job",
            label: "Job Generator",
            icon: <FiBriefcase />,
          },
        ]
      : []),
  ];

  return (
    <motion.nav
      style={{
        ...styles.nav,
        ...(scrolled ? styles.navScrolled : {}),
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div style={styles.container}>
        {/* Logo */}
        <Link to="/" style={styles.logoLink}>
          <motion.div
            style={styles.logo}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div style={styles.logoIcon}>
              <FiBriefcase />
            </div>
            <span style={styles.logoText}>Wevolve AI</span>
          </motion.div>
        </Link>

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

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            style={styles.mobileMenu}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {navLinks.map((link, index) => (
              <Link
                key={link.path}
                to={link.path}
                style={{ textDecoration: "none" }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <motion.div
                  style={{
                    ...styles.mobileNavLink,
                    ...(isActive(link.path) ? styles.mobileNavLinkActive : {}),
                  }}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <span style={styles.navIcon}>{link.icon}</span>
                  {link.label}
                </motion.div>
              </Link>
            ))}

            {user ? (
              <>
                <div style={styles.mobileUserInfo}>
                  <FiUser style={styles.userIcon} />
                  <span>{user.email}</span>
                </div>
                <motion.button
                  onClick={handleLogout}
                  style={styles.mobileLogoutBtn}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: navLinks.length * 0.1 }}
                >
                  <FiLogOut style={styles.btnIcon} />
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
                  style={styles.mobileCtaButton}
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
  );
};

const styles = {
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    transition: "all 0.3s ease",
  },
  navScrolled: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },
  container: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "1rem 1.5rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoLink: {
    textDecoration: "none",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    cursor: "pointer",
  },
  logoIcon: {
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
    color: "white",
    background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
    borderRadius: "0.75rem",
  },
  logoText: {
    fontSize: "1.5rem",
    fontWeight: "800",
    background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  desktopLinks: {
    display: "flex",
    alignItems: "center",
    gap: "2rem",
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem 1rem",
    fontSize: "1rem",
    fontWeight: "600",
    color: "#6B7280",
    borderRadius: "0.5rem",
    transition: "all 0.2s ease",
    cursor: "pointer",
  },
  navLinkActive: {
    color: "#4F46E5",
    backgroundColor: "#EEF2FF",
  },
  navIcon: {
    fontSize: "1.125rem",
    display: "flex",
    alignItems: "center",
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem 1rem",
    backgroundColor: "#F9FAFB",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    color: "#6B7280",
  },
  userIcon: {
    fontSize: "1rem",
  },
  userEmail: {
    maxWidth: "150px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem 1rem",
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "#DC2626",
    backgroundColor: "#FEE2E2",
    border: "none",
    borderRadius: "0.5rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  ctaButton: {
    padding: "0.75rem 1.5rem",
    fontSize: "1rem",
    fontWeight: "600",
    color: "white",
    background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
    border: "none",
    borderRadius: "0.75rem",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
    transition: "all 0.3s ease",
  },
  btnIcon: {
    fontSize: "1rem",
  },
  mobileMenuBtn: {
    display: "none",
    padding: "0.5rem",
    backgroundColor: "transparent",
    border: "none",
    color: "#4F46E5",
    cursor: "pointer",
  },
  mobileMenu: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    padding: "1rem 1.5rem",
    backgroundColor: "white",
    borderTop: "1px solid #E5E7EB",
    overflow: "hidden",
  },
  mobileNavLink: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.75rem 1rem",
    fontSize: "1rem",
    fontWeight: "600",
    color: "#6B7280",
    borderRadius: "0.5rem",
    transition: "all 0.2s ease",
  },
  mobileNavLinkActive: {
    color: "#4F46E5",
    backgroundColor: "#EEF2FF",
  },
  mobileUserInfo: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.75rem 1rem",
    backgroundColor: "#F9FAFB",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    color: "#6B7280",
    marginTop: "0.5rem",
  },
  mobileLogoutBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "0.75rem 1rem",
    fontSize: "1rem",
    fontWeight: "600",
    color: "#DC2626",
    backgroundColor: "#FEE2E2",
    border: "none",
    borderRadius: "0.5rem",
    cursor: "pointer",
    width: "100%",
  },
  mobileCtaButton: {
    padding: "0.75rem 1.5rem",
    fontSize: "1rem",
    fontWeight: "600",
    color: "white",
    background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
    border: "none",
    borderRadius: "0.5rem",
    cursor: "pointer",
    width: "100%",
  },
};

// Media query for mobile menu button
if (typeof window !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @media (max-width: 768px) {
      nav > div > div:nth-child(2) {
        display: none !important;
      }
      nav button[style*="mobileMenuBtn"] {
        display: block !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export default Navbar;
