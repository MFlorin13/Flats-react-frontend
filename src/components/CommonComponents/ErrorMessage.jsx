import React from 'react';
import styles from './ErrorMessage.module.css';

export const ErrorMessage = ({ message }) => (
  <div className={styles.errorMessage}>
    {message}
  </div>
);