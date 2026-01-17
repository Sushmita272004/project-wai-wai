import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiBriefcase,
  FiMail,
  FiLinkedin,
  FiTwitter,
  FiGithub,
  FiHeart,
} from "react-icons/fi";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: "Job Generator", path: "/generate-job" },
      { label: "Features", path: "/" },
      { label: "Pricing", path: "/" },
    ],
    company: [
      { label: "About Us", path: "/" },
      { label: "Careers", path: "/" },
      { label: "Contact", path: "/" },
    ],
    legal: [
      { label: "Privacy Policy", path: "/" },
      { label: "Terms of Service", path: "/" },
      { label: "Cookie Policy", path: "/" },
    ],
  };

  const socialLinks = [
    { icon: <FiTwitter />, url: "#", label: "Twitter" },
    { icon: <FiLinkedin />, url: "#", label: "LinkedIn" },
    { icon: <FiGithub />, url: "#", label: "GitHub" },
  ];

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        {/* Top Section */}
        <div style={styles.topSection}>
          {/* Brand Column */}
          <div style={styles.brandColumn}>
            <div style={styles.logo}>
              <div style={styles.logoIcon}>
                <FiBriefcase />
              </div>
              <span style={styles.logoText}>Wevolve AI</span>
            </div>
            <p style={styles.brandDescription}>
              Empowering recruiters with AI-driven tools to find the perfect
              talent faster and more efficiently.
            </p>
            <div style={styles.socialLinks}>
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.url}
                  style={styles.socialIcon}
                  whileHover={{ scale: 1.1, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={social.label}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div style={styles.linksSection}>
            <div style={styles.linkColumn}>
              <h4 style={styles.linkColumnTitle}>Product</h4>
              {footerLinks.product.map((link, index) => (
                <Link key={index} to={link.path} style={styles.footerLink}>
                  <motion.span whileHover={{ x: 5 }} style={styles.linkText}>
                    {link.label}
                  </motion.span>
                </Link>
              ))}
            </div>

            <div style={styles.linkColumn}>
              <h4 style={styles.linkColumnTitle}>Company</h4>
              {footerLinks.company.map((link, index) => (
                <Link key={index} to={link.path} style={styles.footerLink}>
                  <motion.span whileHover={{ x: 5 }} style={styles.linkText}>
                    {link.label}
                  </motion.span>
                </Link>
              ))}
            </div>

            <div style={styles.linkColumn}>
              <h4 style={styles.linkColumnTitle}>Legal</h4>
              {footerLinks.legal.map((link, index) => (
                <Link key={index} to={link.path} style={styles.footerLink}>
                  <motion.span whileHover={{ x: 5 }} style={styles.linkText}>
                    {link.label}
                  </motion.span>
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter Column */}
          <div style={styles.newsletterColumn}>
            <h4 style={styles.linkColumnTitle}>Stay Updated</h4>
            <p style={styles.newsletterText}>
              Get the latest updates on AI-powered recruitment.
            </p>
            <div style={styles.newsletterForm}>
              <div style={styles.inputWrapper}>
                <FiMail style={styles.inputIcon} />
                <input
                  type="email"
                  placeholder="Enter your email"
                  style={styles.emailInput}
                />
              </div>
              <motion.button
                style={styles.subscribeBtn}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={styles.divider}></div>

        {/* Bottom Section */}
        <div style={styles.bottomSection}>
          <p style={styles.copyright}>
            © {currentYear} Wevolve AI. All rights reserved.
          </p>
          <p style={styles.madeWith}>
            Made with <FiHeart style={styles.heartIcon} /> by the Wevolve Team
          </p>
        </div>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: "#111827",
    color: "#D1D5DB",
    marginTop: "auto",
    paddingTop: "4rem",
    paddingBottom: "2rem",
  },
  container: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "0 1.5rem",
  },
  topSection: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "3rem",
    marginBottom: "3rem",
  },
  brandColumn: {
    gridColumn: "span 1",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginBottom: "1rem",
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
    color: "white",
  },
  brandDescription: {
    fontSize: "0.95rem",
    lineHeight: "1.6",
    color: "#9CA3AF",
    marginBottom: "1.5rem",
  },
  socialLinks: {
    display: "flex",
    gap: "1rem",
  },
  socialIcon: {
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.25rem",
    color: "#D1D5DB",
    backgroundColor: "#1F2937",
    borderRadius: "0.5rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textDecoration: "none",
  },
  linksSection: {
    display: "contents",
  },
  linkColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  linkColumnTitle: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "white",
    marginBottom: "0.5rem",
  },
  footerLink: {
    textDecoration: "none",
    display: "inline-block",
  },
  linkText: {
    fontSize: "0.95rem",
    color: "#9CA3AF",
    transition: "color 0.2s ease",
    display: "inline-block",
  },
  newsletterColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  newsletterText: {
    fontSize: "0.95rem",
    color: "#9CA3AF",
    marginBottom: "0.5rem",
  },
  newsletterForm: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
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
    color: "#6B7280",
  },
  emailInput: {
    width: "100%",
    padding: "0.75rem 1rem 0.75rem 2.75rem",
    backgroundColor: "#1F2937",
    border: "1px solid #374151",
    borderRadius: "0.5rem",
    color: "white",
    fontSize: "0.95rem",
  },
  subscribeBtn: {
    padding: "0.75rem 1.5rem",
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "white",
    background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
    border: "none",
    borderRadius: "0.5rem",
    cursor: "pointer",
  },
  divider: {
    height: "1px",
    backgroundColor: "#374151",
    margin: "2rem 0",
  },
  bottomSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1rem",
  },
  copyright: {
    fontSize: "0.875rem",
    color: "#9CA3AF",
  },
  madeWith: {
    fontSize: "0.875rem",
    color: "#9CA3AF",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  heartIcon: {
    color: "#EF4444",
    fontSize: "1rem",
  },
};

export default Footer;
