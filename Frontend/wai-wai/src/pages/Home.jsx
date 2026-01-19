// frontend/wai-wai/src/pages/Home.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiSearch,
  FiFileText,
  FiPlusCircle,
  FiBarChart2,
} from "react-icons/fi";


const Home = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();

  useEffect(() => {
    // Load Three.js
    const threeScript = document.createElement("script");
    threeScript.src = "/vanta/three.r134.min.js";
    threeScript.async = true;
    document.head.appendChild(threeScript);

    threeScript.onload = () => {
      // Load Vanta RINGS after Three.js loads
      const vantaScript = document.createElement("script");
      vantaScript.src = "/vanta/vanta.rings.min.js";
      vantaScript.async = true;
      document.head.appendChild(vantaScript);

      vantaScript.onload = () => {
        // Initialize Vanta after both scripts are loaded
        if (window.VANTA && window.VANTA.RINGS) {
          window.VANTA.RINGS({
            el: ".hero-section",
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200,
            minWidth: 200,
            scale: 1.0,
            scaleMobile: 1.0,
            backgroundColor: 0x29292a,
          });
        }
      };
    };

    return () => {
      // Cleanup on unmount
      if (document.head.contains(threeScript)) {
        document.head.removeChild(threeScript);
      }
    };
  }, []);

  const features = [
    {
      id: "job-dashboard",
      title: "Job Discovery",
      description:
        "Browse and search through available job opportunities with smart filtering",
      icon: <FiSearch size={40} />,
      route: "/jobs",
      color: "#4F46E5",
      allowedRoles: ["candidate", "employer"],
    },
    {
      id: "job-generator",
      title: "Job Generator",
      description: "Create compelling job descriptions with AI assistance",
      icon: <FiPlusCircle size={40} />,
      route: "/generate-job",
      color: "#10B981",
      allowedRoles: ["employer"],
    },
    {
      id: "resume-parser",
      title: "Resume Parser",
      description: "Extract and analyze resume information efficiently",
      icon: <FiFileText size={40} />,
      route: "/resume-parser",
      color: "#F59E0B",
      allowedRoles: ["candidate", "employer"],
    },
    {
      id: "analytics",
      title: "Analytics Dashboard",
      description: "Track and analyze job posting performance and metrics",
      icon: <FiBarChart2 size={40} />,
      route: "/analytics",
      color: "#EF4444",
      allowedRoles: ["employer"],
    },
  ];

  const handleFeatureClick = (feature) => {
    if (!user) {
      alert("Please log in to access this feature");
      navigate("/auth");
      return;
    }

    if (feature.allowedRoles && !feature.allowedRoles.includes(role)) {
      alert(
        `This feature is only available for ${feature.allowedRoles.join(" and ")} users`,
      );
      return;
    }

    navigate(feature.route);
  };

  return (
    <div className="home-container">
      <section className="hero-section">
        <h1 className="hero-title">Welcome to Wevolve AI</h1>
        {/* <p className="hero-subtitle">
          Your intelligent job matching and recruitment platform
        </p> */}
        {!user && (
          <button className="cta-button" onClick={() => navigate("/auth")}>
            Get Started
          </button>
        )}
      </section>

      <section className="features-section">
        <h2 className="features-title">Our Features</h2>
        <div className="features-grid">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="feature-card"
              onClick={() => handleFeatureClick(feature)}
              style={{ borderColor: feature.color }}
            >
              <div className="feature-icon" style={{ color: feature.color }}>
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              {!user && <span className="feature-lock">🔒 Login Required</span>}
              {user &&
                feature.allowedRoles &&
                !feature.allowedRoles.includes(role) && (
                  <span className="feature-lock">
                    🔒 {feature.allowedRoles.join("/")} Only
                  </span>
                )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
