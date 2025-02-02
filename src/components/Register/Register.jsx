import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup, signInWithRedirect, getRedirectResult, browserLocalPersistence, setPersistence } from 'firebase/auth';
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
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Set persistence on component mount
    setPersistence(auth, browserLocalPersistence)
      .catch((error) => {
        console.error('Error setting persistence:', error);
      });

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    // Handle redirect result
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          const userDoc = doc(db, 'users', result.user.uid);
          await setDoc(userDoc, {
            firstName: formData.firstName || result.user.displayName?.split(' ')[0] || '',
            lastName: formData.lastName || result.user.displayName?.split(' ').slice(1).join(' ') || '',
            email: result.user.email,
            birthDate: formData.birthDate,
            uid: result.user.uid,
            isAdmin: false,
            createdAt: new Date(),
            isGoogleAccount: true
          });
          navigate('/');
        }
      } catch (error) {
        console.error('Redirect result error:', error);
        setError('Authentication failed. Please try again.');
      }
    };

    handleRedirectResult();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleGoogleSignIn = async () => {
    try {
      if (isIOS) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        const result = await signInWithPopup(auth, googleProvider);
        // Handle the result similarly to the redirect result
        if (result?.user) {
          const userDoc = doc(db, 'users', result.user.uid);
          await setDoc(userDoc, {
            firstName: formData.firstName || result.user.displayName?.split(' ')[0] || '',
            lastName: formData.lastName || result.user.displayName?.split(' ').slice(1).join(' ') || '',
            email: result.user.email,
            birthDate: formData.birthDate,
            uid: result.user.uid,
            isAdmin: false,
            createdAt: new Date(),
            isGoogleAccount: true
          });
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      if (error.code === 'auth/popup-blocked') {
        // If popup is blocked, fall back to redirect
        await signInWithRedirect(auth, googleProvider);
      } else {
        setError('Google sign-in failed. Please try again.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!isGoogleSignUp && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      await validateRegistration(formData, isGoogleSignUp);

      if (isGoogleSignUp) {
        if (isIOS) {
          await signInWithRedirect(auth, googleProvider);
        } else {
          await signInWithPopup(auth, googleProvider);
        }
      } else {
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
          </div>
        )}
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