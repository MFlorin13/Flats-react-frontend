/* eslint-disable react-hooks/exhaustive-deps */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, query, where, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';

// Create context
const AuthContext = createContext(null);

// Custom hook for using auth context
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const auth = getAuth();

  // Function to subscribe to user data changes
  const subscribeToUserData = async (userId) => {
    const userRef = doc(db, 'users', userId);
    return onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setUserData(data);
        setIsAdmin(data.isAdmin || false);
        setUser(data);
      }
    });
  };

  useEffect(() => {
    let unsubscribeUserData = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setIsLoggedIn(!!user);

      if (user) {
        if (!localStorage.getItem('loginTime')) {
          localStorage.setItem('loginTime', new Date().getTime().toString());
        }

        try {
          // Initial fetch of user data
          const userQuery = query(
            collection(db, 'users'),
            where('uid', '==', user.uid)
          );
          const userDoc = await getDocs(userQuery);
          const userData = userDoc.docs[0]?.data();
          
          if (userData) {
            setUserData(userData);
            setIsAdmin(userData.isAdmin || false);
            setUser(userData);
          }

          // Set up real-time listener for user data changes
          unsubscribeUserData = await subscribeToUserData(user.uid);
        } catch (error) {
          console.error('Error checking user status:', error);
          setIsAdmin(false);
          setUser(null);
          setUserData(null);
        }
      } else {
        setIsAdmin(false);
        setUser(null);
        setUserData(null);
        localStorage.removeItem('loginTime');
      }
      setLoading(false);
    });

    // Set up session timeout check
    const sessionTimeout = setInterval(() => {
      const loginTime = Number(localStorage.getItem('loginTime'));
      if (loginTime) {
        const currentTime = new Date().getTime();
        const timeElapsed = Math.floor((currentTime - loginTime) / 1000);
        const timeRemaining = 3600 - timeElapsed;

        if (timeRemaining <= 0) {
          console.log('Session expired - logging out');
          handleLogout();
        }
      }
    }, 1000);

    // Cleanup function
    return () => {
      unsubscribeAuth();
      if (unsubscribeUserData) {
        unsubscribeUserData();
      }
      clearInterval(sessionTimeout);
    };
  }, [auth]);

  const updateUserData = async (newData) => {
    try {
      if (!auth.currentUser) throw new Error('No authenticated user');
      
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        ...newData,
        updatedAt: new Date()
      });

      // Snapshot listener will automatically update the state
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('loginTime');
      if (auth.currentUser) {
        await signOut(auth);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const value = {
    user,
    isAdmin,
    isLoggedIn,
    loading,
    handleLogout,
    userData,
    updateUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;