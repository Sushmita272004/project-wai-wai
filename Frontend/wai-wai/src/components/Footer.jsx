import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiLinkedin, FiTwitter, FiGithub } from "react-icons/fi";
import "../styles/Footer.css";
import wevolveLogo from "../assets/wevolve_logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      alert("Thanks for subscribing!");
      setEmail("");
    }
  };

  // No custom router logic needed; use <Link> for navigation

  return (
    <footer className="footer">
      <div className="footer__container">
        {/* Main Content */}
        <div className="footer__content">
          {/* Brand */}
          <div className="footer__brand">
            <div className="footer__logo">
              {/* Replaced Icon with Image */}
              <img
                src={wevolveLogo}
                alt="Wevolve AI"
                style={{ height: "32px", width: "auto", marginRight: "8px" }}
              />
              <span className="footer__logo-text">Wevolve AI</span>
            </div>
            <p className="footer__tagline">AI-powered recruitment solutions</p>
          </div>

          {/* Links */}
          <div className="footer__links">
            <Link to="/generate-job" className="footer__link">
              Job Generator
            </Link>
            <Link to="/about" className="footer__link">
              About
            </Link>
            <Link to="/privacy" className="footer__link">
              Privacy
            </Link>
            <Link to="/contact" className="footer__link">
              Contact
            </Link>
          </div>

          {/* Social */}
          <div className="footer__social">
            <a href="#" className="footer__social-link" aria-label="Twitter">
              <FiTwitter />
            </a>
            <a href="#" className="footer__social-link" aria-label="LinkedIn">
              <FiLinkedin />
            </a>
            <a href="#" className="footer__social-link" aria-label="GitHub">
              <FiGithub />
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer__bottom">
          <p className="footer__copyright">
            © {currentYear} Wevolve AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
