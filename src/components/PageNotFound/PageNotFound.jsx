import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import { motion } from 'framer-motion'; // Import Framer Motion
import styles from './PageNotFound.module.css';

const NotFound = () => {
  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0 }} // Initial state for animation
      animate={{ opacity: 1 }} // End state for animation
      exit={{ opacity: 0 }} // Exit animation
      transition={{ duration: 0.5 }} // Transition duration
    >
      <motion.div
        className={styles.content}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <motion.div
          className={styles.errorCode}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.7, ease: "backOut" }}
        >
          404
        </motion.div>
        <motion.h1
          className={styles.title}
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          Page Not Found
        </motion.h1>
        <motion.p
          className={styles.description}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </motion.p>
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <Link to="/" className={styles.button}>
            <FaHome className={styles.icon} />
            Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default NotFound;
