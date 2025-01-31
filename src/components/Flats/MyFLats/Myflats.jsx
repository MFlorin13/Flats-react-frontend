import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../../../config/firebase';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import styles from './MyFlats.module.css';
import FlatView from '../FlatView/FlatView';

const MyFlats = () => {
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingFlat, setEditingFlat] = useState(null);
  const auth = getAuth();

  const getFlatList = async () => {
    setLoading(true);
    try {
      if (!auth.currentUser) {
        setFlats([]);
        return;
      }

      const flatsCollectionRef = collection(db, 'flats');
      const q = query(flatsCollectionRef, where("userId", "==", auth.currentUser.uid));
      const data = await getDocs(q);

      const filteredData = data.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFlats(filteredData);
    } catch (error) {
      console.error('Error fetching flats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        getFlatList();
      } else {
        setFlats([]);
      }
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

  const handleStartEdit = (flat) => {
    setEditingFlat({
      ...flat,
      editedValues: { ...flat }
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingFlat(prev => ({
      ...prev,
      editedValues: {
        ...prev.editedValues,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleSave = async (flatId) => {
    try {
      const flatRef = doc(db, 'flats', flatId);
      const updatedData = { ...editingFlat.editedValues };
      delete updatedData.id;

      await updateDoc(flatRef, updatedData);

      setFlats(prev => prev.map(flat =>
        flat.id === flatId ? { ...flat, ...updatedData } : flat
      ));

      setEditingFlat(null);
    } catch (error) {
      console.error('Error updating flat:', error);
      alert('Failed to update flat');
    }
  };

  const handleCancelEdit = () => {
    setEditingFlat(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this flat?')) {
      try {
        await deleteDoc(doc(db, 'flats', id));
        getFlatList();
      } catch (error) {
        console.error('Error deleting flat:', error);
      }
    }
  };

  if (!auth.currentUser) {
    return <div className="p-4">Please log in to view your flats.</div>;
  }

  if (loading) return <div className="p-4">Loading flats...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>My Flats</h1>

      {flats.length === 0 ? (
        <p className={styles.emptyState}>You haven`t added any flats yet.</p>
      ) : (
        <div className={styles.flatsGrid}>
          {flats.map((flat) => (
            <div key={flat.id} className={styles.flatCard}>
              {editingFlat?.id === flat.id ? (
                <div className={styles.editForm}>
                  <div className={styles.formGroup}>
                    <label htmlFor={`name-${flat.id}`} className={styles.formLabel}>Flat Name:</label>
                    <input
                      id={`name-${flat.id}`}
                      type="text"
                      name="name"
                      value={editingFlat.editedValues.name}
                      onChange={handleInputChange}
                      className={styles.editInput}
                      placeholder="Enter flat name"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor={`city-${flat.id}`} className={styles.formLabel}>City:</label>
                    <input
                      id={`city-${flat.id}`}
                      type="text"
                      name="city"
                      value={editingFlat.editedValues.city}
                      onChange={handleInputChange}
                      className={styles.editInput}
                      placeholder="Enter city"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor={`streetName-${flat.id}`} className={styles.formLabel}>Street Name:</label>
                    <input
                      id={`streetName-${flat.id}`}
                      type="text"
                      name="streetName"
                      value={editingFlat.editedValues.streetName}
                      onChange={handleInputChange}
                      className={styles.editInput}
                      placeholder="Enter street name"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor={`streetNumber-${flat.id}`} className={styles.formLabel}>Street Number:</label>
                    <input
                      id={`streetNumber-${flat.id}`}
                      type="number"
                      name="streetNumber"
                      value={editingFlat.editedValues.streetNumber}
                      onChange={handleInputChange}
                      className={styles.editInput}
                      placeholder="Enter street number"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor={`areaSize-${flat.id}`} className={styles.formLabel}>Area Size:</label>
                    <input
                      id={`areaSize-${flat.id}`}
                      type="number"
                      name="areaSize"
                      value={editingFlat.editedValues.areaSize}
                      onChange={handleInputChange}
                      className={styles.editInput}
                      placeholder="Enter area size in m²"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor={`rentPrice-${flat.id}`} className={styles.formLabel}>Rent Price:</label>
                    <input
                      id={`rentPrice-${flat.id}`}
                      type="number"
                      name="rentPrice"
                      value={editingFlat.editedValues.rentPrice}
                      onChange={handleInputChange}
                      className={styles.editInput}
                      placeholder="Enter rent price in $"
                    />
                  </div>

                  <div className={styles.checkboxContainer}>
                    <input
                      type="checkbox"
                      id={`hasAC-${flat.id}`}
                      name="hasAC"
                      checked={editingFlat.editedValues.hasAC}
                      onChange={handleInputChange}
                      className={styles.checkbox}
                    />
                    <label htmlFor={`hasAC-${flat.id}`} className={styles.checkboxLabel}>
                      Has Air Conditioning
                    </label>
                  </div>

                  <div className={styles.buttonGroup}>
                    <button onClick={() => handleSave(flat.id)} className={styles.saveButton}>
                      <FaSave /> Save Changes
                    </button>
                    <button onClick={handleCancelEdit} className={styles.cancelButton}>
                      <FaTimes /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {flat.imageUrl && (
                    <div className={styles.imageContainer}>
                      <img
                        src={flat.imageUrl}
                        alt={flat.name}
                        className={styles.flatImage}
                      />
                    </div>
                  )}
                  <div className={styles.flatContent}>
                    <h2 className={styles.flatTitle}>{flat.name}</h2>

                    <div className={styles.flatDetails}>
                      <div className={styles.flatDetail}>
                        <span className={styles.detailLabel}>Location:</span>
                        <span>{flat.city}, {flat.streetName} {flat.streetNumber}</span>
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
                        <span>${flat.rentPrice?.toLocaleString()}/month</span>
                      </div>
                      <div className={styles.flatDetail}>
                        <span className={styles.detailLabel}>AC:</span>
                        <span>{flat.hasAC ? "Yes" : "No"}</span>
                      </div>
                    </div>

                    <div className={styles.listingDate}>
                      Listed on: {flat.createdAt?.toDate().toLocaleDateString()}
                    </div>
                    <div className={styles.cardActions}>
                      <FlatView flat={flat} />
                      <button
                        onClick={() => handleStartEdit(flat)}
                        className={styles.editButton}
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(flat.id)}
                        className={styles.deleteButton}
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyFlats;