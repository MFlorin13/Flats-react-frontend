import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { setDoc, doc } from 'firebase/firestore';
import { db, googleProvider } from '../../config/firebase';
import { validateRegistration } from './RegisterValidation';
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import styles from './Register.module.css';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: ''
  });
  

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const googleUserInfo = location.state;
  const isGoogleSignUp = googleUserInfo?.isGoogleSignUp;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
  
    // Only check passwords match for email/password registration
    if (!isGoogleSignUp && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
  
    setIsSubmitting(true);
    try {
      // Pass isGoogleSignUp flag to validation
      await validateRegistration(formData, isGoogleSignUp);
  
      if (isGoogleSignUp) {
        // Handle Google sign-up
        await setDoc(doc(db, 'users', googleUserInfo.uid), {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          birthDate: formData.birthDate,
          uid: googleUserInfo.uid,
          isAdmin: false,
          createdAt: new Date(),
          isGoogleAccount: true
        });
  
        // Sign in with Google again
        await signInWithPopup(auth, googleProvider);
      } else {
        // Handle email/password sign-up
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
  
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          birthDate: formData.birthDate,
          uid: userCredential.user.uid,
          isAdmin: false,
          createdAt: new Date(),
          isGoogleAccount: false
        });
      }
  
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h2 className={styles.title}>Create Account</h2>
        {isGoogleSignUp && (
          <div className={styles.googleInfo}>
            Complete your profile to continue
          </div>)}
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.nameGroup}>
            <div className={styles.inputGroup}>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={styles.input}
                placeholder=" "
                required
              />
              <label className={styles.label}>First Name</label>
            </div>

            <div className={styles.inputGroup}>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={styles.input}
                placeholder=" "
                required
              />
              <label className={styles.label}>Last Name</label>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
              placeholder=" "
              required
              disabled={isGoogleSignUp} // Disable email field for Google sign-up
            />
            <label className={styles.label}>Email</label>
          </div>
          {!isGoogleSignUp && (
            <>
              {/* Password fields only shown for email/password sign-up */}
              <div className={styles.inputGroup}>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder=" "
                  required
                />
                <label className={styles.label}>Password</label>
              </div>

              <div className={styles.inputGroup}>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder=" "
                  required
                />
                <label className={styles.label}>Confirm Password</label>
              </div>
            </>
          )}
          <div className={styles.inputGroup}>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              className={styles.input}
              required
            />
            <label className={styles.label}>Birth Date</label>
          </div>

          <button
            type="submit"
            className={styles.button}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Register'}
          </button>

          <div className={styles.loginLink}>
            Already have an account? <Link to="/login">Log in</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;