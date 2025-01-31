import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useAuth } from '../../Auth/Auth';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState({});
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [flatLoading, setFlatLoading] = useState({}); // Track loading state for each flat
  const { user, isLoggedIn } = useAuth();
  const debounceTimeout = useRef(null);

  useEffect(() => {
    if (!isLoggedIn || !user) {
      setFavorites({});
      setLoadingFavorites(false);
      return;
    }

    const favoritesRef = doc(db, 'favorites', user.uid);

    const unsubscribe = onSnapshot(
      favoritesRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setFavorites(snapshot.data().flats || {});
        } else {
          // Initialize an empty document if none exists
          setDoc(favoritesRef, { flats: {} });
          setFavorites({});
        }
        setLoadingFavorites(false);
      },
      (error) => {
        console.error('Error fetching favorites:', error);
        setFavorites({});
        setLoadingFavorites(false);
      }
    );

    return () => unsubscribe(); // Clean up Firestore listener on unmount
  }, [user, isLoggedIn]);

  const toggleFavorite = async (flatId) => {
    if (!isLoggedIn || !user) {
      alert('Please log in to save favorites');
      return;
    }

    const newFavorites = { ...favorites };

    // Optimistically update local state
    if (newFavorites[flatId]) {
      delete newFavorites[flatId];
    } else {
      newFavorites[flatId] = true;
    }
    setFavorites(newFavorites);

    // Mark flat as loading
    setFlatLoading((prev) => ({ ...prev, [flatId]: true }));

    clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(async () => {
      try {
        const favoritesRef = doc(db, 'favorites', user.uid);

        // Update Firestore with the new state
        await updateDoc(favoritesRef, { flats: newFavorites });
      } catch (error) {
        console.error('Error updating favorites:', error);
        // Rollback optimistic update in case of an error
        setFavorites(favorites);
      } finally {
        // Clear loading state for the flat
        setFlatLoading((prev) => ({ ...prev, [flatId]: false }));
      }
    }, 500);
  };

  const isFavorite = (flatId) => !!favorites[flatId];
  const isFlatLoading = (flatId) => !!flatLoading[flatId];

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, isFlatLoading, loadingFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
