import React, { useState } from "react";
import { FiBriefcase, FiLinkedin, FiTwitter, FiGithub } from "react-icons/fi";
import "../styles/Footer.css";

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

  const handleLinkClick = (path) => {
    // Handle navigation - replace with your routing logic
    console.log("Navigate to:", path);
  };

  return (
    <footer className="footer">
      <div className="footer__container">
        {/* Main Content */}
        <div className="footer__content">
          {/* Brand */}
          <div className="footer__brand">
            <div className="footer__logo">
              <FiBriefcase className="footer__logo-icon" />
              <span className="footer__logo-text">Wevolve AI</span>
            </div>
            <p className="footer__tagline">AI-powered recruitment solutions</p>
          </div>

          {/* Links */}
          <div className="footer__links">
            <button
              onClick={() => handleLinkClick("/generate-job")}
              className="footer__link"
            >
              Job Generator
            </button>
            <button
              onClick={() => handleLinkClick("/")}
              className="footer__link"
            >
              About
            </button>
            <button
              onClick={() => handleLinkClick("/")}
              className="footer__link"
            >
              Privacy
            </button>
            <button
              onClick={() => handleLinkClick("/")}
              className="footer__link"
            >
              Contact
            </button>
          </div>

          {/* Newsletter */}
          <form className="footer__newsletter" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="footer__input"
            />
            <button type="submit" className="footer__button">
              Subscribe
            </button>
          </form>

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
