import { FcGoogle } from 'react-icons/fc';
import React, { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth';
import { auth, googleProvider, db } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import { doc, getDoc } from 'firebase/firestore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Set persistence
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
          const userDoc = await getDoc(doc(db, 'users', result.user.uid));

          if (!userDoc.exists()) {
            await auth.signOut();
            navigate('/register', {
              replace: true,
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
            navigate('/', { replace: true });
          }
        }
      } catch (error) {
        console.error('Redirect result error:', error);
        setError('Authentication failed. Please try again.');
      }
    };

    handleRedirectResult();
  }, [navigate]);

  async function login(e) {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
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

  async function loginWithGoogle() {
    setIsLoading(true);
    try {
      if (isIOS) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        const result = await signInWithPopup(auth, googleProvider);
        const userDoc = await getDoc(doc(db, 'users', result.user.uid));

        if (!userDoc.exists()) {
          await auth.signOut();
          navigate('/register', {
            replace: true,
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
          navigate('/', { replace: true });
        }
      }
    } catch (error) {
      console.error('Google login failed:', error);
      if (error.code === 'auth/popup-blocked') {
        // If popup is blocked, fall back to redirect
        await signInWithRedirect(auth, googleProvider);
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
        case 'auth/invalid-credential':
          setError('The login session expired. Please try again.');
          break;
        default:
          setError('Failed to login with Google. Please try again.');
      }
    } finally {
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
            disabled={isLoading}
          >
            <FcGoogle /> {isLoading ? 'Please wait...' : 'Login With Google'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;