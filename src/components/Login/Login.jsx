import { FcGoogle } from 'react-icons/fc';
import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, db } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import { collection, getDocs, query, where, doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const navigate = useNavigate();

  async function login(e) {
    e.preventDefault();
    setError('');

    // Input validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (error) {
      console.error('Error during login:', error);
      switch (error.code) {
        case 'auth/invalid-email':
          setError('Invalid email address');
          break;
        case 'auth/user-not-found':
          setError('No account found with this email');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password');
          break;
        default:
          setError('Failed to login. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function loginWithGoogle(e) {
    e.preventDefault();
    if (isPopupOpen) return;
  
    setIsLoading(true);
    try {
      setIsPopupOpen(true);
      const result = await signInWithPopup(auth, googleProvider);
      
      // Check if the user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        // Sign out the user since they need to complete registration
        await auth.signOut();
        
        // Use replace instead of navigate to ensure clean history
        navigate('/register', { 
          replace: true, // Add this line
          state: { 
            isGoogleSignUp: true,
            uid: result.user.uid,
            email: result.user.email,
            firstName: result.user.displayName?.split(' ')[0] || '',
            lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '',
            photoURL: result.user.photoURL
          } 
        });
      } else {
        // User exists - go to homepage
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Google login failed:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        return;
      }

      switch (error.code) {
        case 'auth/account-exists-with-different-credential':
          setError('An account already exists with this email but with a different sign-in method.');
          break;
        case 'auth/cancelled-popup-request':
          setError('Please close any other login windows and try again.');
          break;
        case 'auth/popup-blocked':
          setError('Login popup was blocked. Please enable popups for this site.');
          break;
        default:
          setError('Failed to login with Google. Please try again.');
      }
    } finally {
      setIsPopupOpen(false);
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h2 className={styles.title}>Login</h2>
        {error && <div className={styles.error}>{error}</div>}
        <form className={styles.form} onSubmit={login}>
          <div className={styles.inputGroup}>
            <input
              type="email"
              className={styles.input}
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label className={styles.label}>Email</label>
          </div>
          <div className={styles.inputGroup}>
            <input
              type="password"
              className={styles.input}
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label className={styles.label}>Password</label>
          </div>
          <button
            type="submit"
            className={styles.button}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
          <button
            type="button"
            className={styles.googleButton}
            onClick={loginWithGoogle}
            disabled={isLoading || isPopupOpen}
          >
            <FcGoogle /> {isLoading ? 'Please wait...' : 'Login With Google'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;