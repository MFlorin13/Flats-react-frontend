import React, { useState, useEffect } from 'react';
import { getAuth, updateEmail, updatePassword } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import styles from './UpdateProfile.module.css';
import { useNavigate } from 'react-router-dom';

const UpdateProfile = () => {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    birthDate: '',
    uid: ''
  });
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          setLoading(true);
          const userDoc = await getDoc(doc(db, 'users', user.uid));

          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData({
              firstName: data.firstName || '',
              lastName: data.lastName || '',
              email: data.email || '',
              birthDate: data.birthDate || '',
              uid: data.uid || ''
            });
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          setError('Failed to load user data');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return;
  
    try {
      setLoading(true);
      setError('');
      setSuccess('');
  
      if (!userData.firstName || !userData.lastName || !userData.email) {
        setError('Please fill in all required fields');
        return;
      }
  
      // Handle password update if new password is provided
      if (passwords.newPassword || passwords.confirmPassword) {
        if (passwords.newPassword !== passwords.confirmPassword) {
          setError('Passwords do not match');
          return;
        }
  
        if (!validatePassword(passwords.newPassword)) {
          setError('Password must be at least 6 characters long, contain one uppercase letter, one number, and one special character');
          return;
        }
  
        try {
          await updatePassword(auth.currentUser, passwords.newPassword);
        } catch (passwordError) {
          console.error('Error updating password:', passwordError);
          setError('Failed to update password. You may need to re-login first.');
          return;
        }
      }
  
      // Handle email update
      if (userData.email !== auth.currentUser.email) {
        try {
          await updateEmail(auth.currentUser, userData.email);
        } catch (emailError) {
          console.error('Error updating email:', emailError);
          setError('Failed to update email. You may need to re-login first.');
          return;
        }
      }
  
      // Update user data in Firestore
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        birthDate: userData.birthDate,
        uid: userData.uid
      });
  
      setSuccess('Profile updated successfully!');
      setPasswords({ newPassword: '', confirmPassword: '' }); // Clear password fields
  
      // Redirect to the all-flats page after success
      navigate('/');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Update Profile</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>First Name *</label>
          <input
            type="text"
            name="firstName"
            value={userData.firstName}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Last Name *</label>
          <input
            type="text"
            name="lastName"
            value={userData.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Email *</label>
          <input
            type="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Birth Date</label>
          <input
            type="date"
            name="birthDate"
            value={userData.birthDate}
            onChange={handleChange}
          />
        </div>

        <div className={styles.passwordSection}>
          <h2>Change Password</h2>
          <div>
            <label>New Password</label>
            <input
              type="password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handlePasswordChange}
              placeholder="Leave blank to keep current password"
            />
          </div>

          <div>
            <label>Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="Confirm new password"
            />
          </div>
        </div>

        {error && <div className={styles['error-message']}>{error}</div>}
        {success && <div className={styles['success-message']}>{success}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

export default UpdateProfile;