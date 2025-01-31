import React from 'react';
import { FaYoutube, FaTwitter, FaInstagram } from 'react-icons/fa';
import styles from './Footer.module.css';
import logo from '../../assets/logo.jpg';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        {/* Logo Area */}
        <div className={styles.logoArea}>
          <img 
            src={logo}
            alt="RentEase Logo"
            className={styles.logo}
          />
        </div>

        {/* Social Links */}
        <div className={styles.socialLinks}>
          <a
            href="https://www.youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.iconLink}
          >
            <FaYoutube className={styles.icon} />
          </a>
          <a
            href="https://www.twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.iconLink}
          >
            <FaTwitter className={styles.icon} />
          </a>
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.iconLink}
          >
            <FaInstagram className={styles.icon} />
          </a>
        </div>

        {/* Footer Text */}
        <p className={styles.footerText}>
          © {new Date().getFullYear()} FlatFinder. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
