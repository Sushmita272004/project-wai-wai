import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiArrowRight,
  FiBriefcase,
  FiUsers,
  FiTrendingUp,
  FiZap,
  FiCheckCircle,
  FiStar,
} from "react-icons/fi";

const Home = () => {
  const features = [
    {
      icon: <FiZap />,
      title: "AI-Powered Generation",
      description:
        "Create professional job descriptions in seconds using advanced AI technology",
    },
    {
      icon: <FiCheckCircle />,
      title: "ATS-Optimized",
      description:
        "Ensure your job posts get noticed with ATS-friendly formatting",
    },
    {
      icon: <FiTrendingUp />,
      title: "Industry Standards",
      description: "Follow best practices across 20+ industries automatically",
    },
    {
      icon: <FiStar />,
      title: "Customizable",
      description:
        "Tailor every description to match your company culture and needs",
    },
  ];

  const stats = [
    { value: "10K+", label: "Job Descriptions" },
    { value: "500+", label: "Companies" },
    { value: "98%", label: "Satisfaction" },
    { value: "24/7", label: "Available" },
  ];

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.heroContent}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div style={styles.badge}>
              <FiBriefcase style={styles.badgeIcon} />
              <span>AI-Powered Recruitment Platform</span>
            </div>
          </motion.div>

          <motion.h1
            style={styles.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Where Ambition Meets{" "}
            <span style={styles.gradient}>Opportunity</span>
          </motion.h1>

          <motion.p
            style={styles.subtitle}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Revolutionizing recruitment with AI-powered tools. Create
            professional, ATS-friendly job descriptions in seconds and find the
            perfect talent for your team.
          </motion.p>

          <motion.div
            style={styles.buttonGroup}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link to="/generate-job" style={{ textDecoration: "none" }}>
              <motion.button
                style={styles.primaryBtn}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(79, 70, 229, 0.3)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Try Job Generator
                <FiArrowRight style={styles.buttonIcon} />
              </motion.button>
            </Link>
            <Link to="/auth" style={{ textDecoration: "none" }}>
              <motion.button
                style={styles.secondaryBtn}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started Free
              </motion.button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            style={styles.statsContainer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                style={styles.statItem}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              >
                <div style={styles.statValue}>{stat.value}</div>
                <div style={styles.statLabel}>{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.featuresSection}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 style={styles.sectionTitle}>Why Choose Wevolve AI?</h2>
          <p style={styles.sectionSubtitle}>
            Everything you need to create compelling job descriptions
          </p>
        </motion.div>

        <div style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <motion.div
              key={index}
              style={styles.featureCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
            >
              <div style={styles.featureIcon}>{feature.icon}</div>
              <h3 style={styles.featureTitle}>{feature.title}</h3>
              <p style={styles.featureDescription}>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <motion.div
          style={styles.ctaCard}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <FiUsers style={styles.ctaIcon} />
          <h2 style={styles.ctaTitle}>Ready to Transform Your Hiring?</h2>
          <p style={styles.ctaDescription}>
            Join hundreds of companies using AI to streamline their recruitment
            process
          </p>
          <Link to="/auth" style={{ textDecoration: "none" }}>
            <motion.button
              style={styles.ctaButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Your Free Trial
              <FiArrowRight style={styles.buttonIcon} />
            </motion.button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

const styles = {
  container: {
    width: "100%",
    overflow: "hidden",
  },
  heroSection: {
    minHeight: "90vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem 1.5rem",
    background:
      "linear-gradient(135deg, #F9FAFB 0%, #EEF2FF 50%, #E0E7FF 100%)",
    position: "relative",
  },
  heroContent: {
    maxWidth: "1200px",
    width: "100%",
    textAlign: "center",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem 1.25rem",
    backgroundColor: "white",
    borderRadius: "9999px",
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#4F46E5",
    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
    marginBottom: "2rem",
  },
  badgeIcon: {
    fontSize: "1rem",
  },
  title: {
    fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
    fontWeight: "800",
    marginBottom: "1.5rem",
    lineHeight: "1.1",
    color: "#111827",
    letterSpacing: "-0.02em",
  },
  gradient: {
    background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  subtitle: {
    fontSize: "clamp(1rem, 2vw, 1.25rem)",
    color: "#6B7280",
    marginBottom: "2.5rem",
    maxWidth: "700px",
    margin: "0 auto 2.5rem",
    lineHeight: "1.7",
  },
  buttonGroup: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: "4rem",
  },
  primaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "1rem 2rem",
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "white",
    background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
    border: "none",
    borderRadius: "0.75rem",
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(79, 70, 229, 0.3)",
    transition: "all 0.3s ease",
  },
  secondaryBtn: {
    padding: "1rem 2rem",
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#4F46E5",
    backgroundColor: "white",
    border: "2px solid #4F46E5",
    borderRadius: "0.75rem",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  buttonIcon: {
    fontSize: "1.25rem",
  },
  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "2rem",
    maxWidth: "800px",
    margin: "0 auto",
  },
  statItem: {
    textAlign: "center",
  },
  statValue: {
    fontSize: "2.5rem",
    fontWeight: "800",
    color: "#4F46E5",
    marginBottom: "0.25rem",
  },
  statLabel: {
    fontSize: "0.875rem",
    color: "#6B7280",
    fontWeight: "500",
  },
  featuresSection: {
    padding: "6rem 1.5rem",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  sectionTitle: {
    fontSize: "clamp(2rem, 4vw, 3rem)",
    fontWeight: "800",
    textAlign: "center",
    marginBottom: "1rem",
    color: "#111827",
  },
  sectionSubtitle: {
    fontSize: "1.125rem",
    color: "#6B7280",
    textAlign: "center",
    marginBottom: "4rem",
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "2rem",
  },
  featureCard: {
    padding: "2.5rem",
    backgroundColor: "white",
    borderRadius: "1rem",
    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
    transition: "all 0.3s ease",
    cursor: "pointer",
  },
  featureIcon: {
    width: "60px",
    height: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.75rem",
    color: "#4F46E5",
    backgroundColor: "#EEF2FF",
    borderRadius: "1rem",
    marginBottom: "1.5rem",
  },
  featureTitle: {
    fontSize: "1.25rem",
    fontWeight: "700",
    marginBottom: "0.75rem",
    color: "#111827",
  },
  featureDescription: {
    fontSize: "1rem",
    color: "#6B7280",
    lineHeight: "1.6",
  },
  ctaSection: {
    padding: "4rem 1.5rem 6rem",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  ctaCard: {
    padding: "4rem 2rem",
    background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
    borderRadius: "2rem",
    textAlign: "center",
    boxShadow: "0 20px 40px rgba(79, 70, 229, 0.3)",
  },
  ctaIcon: {
    fontSize: "3rem",
    color: "white",
    marginBottom: "1.5rem",
  },
  ctaTitle: {
    fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
    fontWeight: "800",
    color: "white",
    marginBottom: "1rem",
  },
  ctaDescription: {
    fontSize: "1.125rem",
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: "2rem",
    maxWidth: "600px",
    margin: "0 auto 2rem",
  },
  ctaButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "1rem 2.5rem",
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#4F46E5",
    backgroundColor: "white",
    border: "none",
    borderRadius: "0.75rem",
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
  },
};

export default Home;
