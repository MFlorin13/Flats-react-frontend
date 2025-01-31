import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import { useFavorites } from '../Context/FavoriteContext/FavoriteContext';
import styles from './FavoritesPage.module.css';

const FavoritesPage = () => {
  const [favoriteFlats, setFavoriteFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingFlats, setLoadingFlats] = useState({}); // Track loading state for specific flats
  const [error, setError] = useState(null);
  const auth = getAuth();
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useFavorites();

  useEffect(() => {
    const fetchFavoriteFlats = async () => {
      if (!auth.currentUser) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const favoriteIds = Object.keys(favorites);

        if (favoriteIds.length === 0) {
          setFavoriteFlats([]);
          setLoading(false);
          return;
        }

        const flatsCollection = collection(db, 'flats');
        const q = query(flatsCollection, where('__name__', 'in', favoriteIds));
        const flatsSnapshot = await getDocs(q);

        const flats = flatsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setFavoriteFlats(flats);
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setError('Failed to load favorites');
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteFlats();
  }, [auth.currentUser, navigate, favorites]);

  const handleToggleFavorite = async (flatId) => {
    // Optimistic UI update: Remove the flat immediately from the displayed list
    const updatedFlats = favoriteFlats.filter((flat) => flat.id !== flatId);
    setFavoriteFlats(updatedFlats);

    // Set flat-specific loading state
    setLoadingFlats((prev) => ({ ...prev, [flatId]: true }));

    try {
      await toggleFavorite(flatId); // Update Firestore
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Rollback UI update in case of error
      const originalFlat = favoriteFlats.find((flat) => flat.id === flatId);
      setFavoriteFlats((prev) => [...prev, originalFlat]);
    } finally {
      // Clear flat-specific loading state
      setLoadingFlats((prev) => ({ ...prev, [flatId]: false }));
    }
  };

  if (!auth.currentUser) return null;
  if (loading) return <div>Loading favorites...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Favorite Flats</h1>
      </div>

      {favoriteFlats.length === 0 ? (
        <div className={styles.emptyState}>
          <p>You haven`t added any flats to your favorites yet.</p>
        </div>
      ) : (
        <div className={styles.flatsGrid}>
          {favoriteFlats.map((flat) => (
            <div key={flat.id} className={styles.flatCard}>
              {flat.imageUrl && (
                <div className={styles.imageContainer}>
                  <img
                    src={flat.imageUrl}
                    alt={flat.name}
                    className={styles.flatImage}
                  />
                  <button
                    onClick={() => handleToggleFavorite(flat.id)}
                    className={styles.favoriteButton}
                    disabled={loadingFlats[flat.id]} // Disable button during loading
                    title="Remove from favorites"
                  >
                    {loadingFlats[flat.id] ? (
                      <span>Updating...</span>
                    ) : (
                      <FaHeart className="text-red-500" />
                    )}
                  </button>
                </div>
              )}

              <div className={styles.flatContent}>
                <h2 className={styles.flatTitle}>{flat.name}</h2>

                <div className={styles.flatDetails}>
                  <div className={styles.flatDetail}>
                    <span className={styles.detailLabel}>Location:</span>
                    <span>
                      {flat.city}, {flat.streetName} {flat.streetNumber}
                    </span>
                  </div>
                  <div className={styles.flatDetail}>
                    <span className={styles.detailLabel}>Area:</span>
                    <span>{flat.areaSize} m²</span>
                  </div>
                  <div className={styles.flatDetail}>
                    <span className={styles.detailLabel}>Year Built:</span>
                    <span>{flat.yearBuilt}</span>
                  </div>
                  <div className={styles.flatDetail}>
                    <span className={styles.detailLabel}>Rent:</span>
                    <span>${flat.rentPrice.toLocaleString()}/month</span>
                  </div>
                  <div className={styles.flatDetail}>
                    <span className={styles.detailLabel}>AC:</span>
                    <span>{flat.hasAC ? 'Yes' : 'No'}</span>
                  </div>
                </div>

                <div className={styles.listingDate}>
                  Listed on: {flat.createdAt?.toDate().toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
