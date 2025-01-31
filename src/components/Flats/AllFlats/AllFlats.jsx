import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { FaHeart, FaRegHeart, FaSort, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import { Search } from '../../CommonComponents/SearchComponent';
import { LoadingSpinner } from '../../CommonComponents/LoadingSpinner';
import { ErrorMessage } from '../../CommonComponents/ErrorMessage';
import { useFavorites } from '../../Context/FavoriteContext/FavoriteContext';
import { useToast } from '../../Context/ToastContext/ToastContext';
import FlatMessage from '../../FlatMessagingComponent/FlatMessagingComponent';
import { useAuth } from '../../Auth/Auth';
import { DEFAULT_FILTERS } from '../../Constants/FlatConstants';
import { applyFilters, sortFlats } from '../../Utils/FlatUtils';
import styles from './AllFlats.module.css';

const AllFlats = () => {
  const [flats, setFlats] = useState([]);
  const [filteredFlats, setFilteredFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [editingFlat, setEditingFlat] = useState(null);
  
  const { favorites, toggleFavorite } = useFavorites();
  const { addToast } = useToast();
  const { isLoggedIn, isAdmin } = useAuth();

  useEffect(() => {
    const fetchAllFlats = async () => {
      try {
        setLoading(true);
        const flatsCollection = collection(db, 'flats');
        const q = query(flatsCollection, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const allFlats = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setFlats(allFlats);
        setFilteredFlats(allFlats);
      } catch (err) {
        console.error('Error fetching flats:', err);
        setError('Failed to load flats');
        addToast('Failed to load flats', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchAllFlats();
  }, [addToast]);

  useEffect(() => {
    const filteredResults = applyFilters(flats, filters, searchQuery);
    setFilteredFlats(filteredResults);
  }, [searchQuery, filters, flats]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (flat) => {
    setEditingFlat({
      ...flat,
      editedValues: { ...flat }
    });
  };

  const handleDelete = async (flatId) => {
    if (!window.confirm('Are you sure you want to delete this flat?')) return;
    
    try {
      await deleteDoc(doc(db, 'flats', flatId));
      setFlats(prev => prev.filter(flat => flat.id !== flatId));
      setFilteredFlats(prev => prev.filter(flat => flat.id !== flatId));
      addToast('Flat deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting flat:', error);
      addToast('Failed to delete flat', 'error');
    }
  };

  const handleSave = async () => {
    try {
      const flatRef = doc(db, 'flats', editingFlat.id);
      await updateDoc(flatRef, editingFlat.editedValues);

      setFlats(prev => prev.map(flat =>
        flat.id === editingFlat.id ? { ...flat, ...editingFlat.editedValues } : flat
      ));
      setFilteredFlats(prev => prev.map(flat =>
        flat.id === editingFlat.id ? { ...flat, ...editingFlat.editedValues } : flat
      ));
      setEditingFlat(null);
      addToast('Flat updated successfully', 'success');
    } catch (error) {
      console.error('Error updating flat:', error);
      addToast('Failed to update flat', 'error');
    }
  };

  const handleInputChange = (e, field) => {
    const { value, type, checked } = e.target;
    setEditingFlat(prev => ({
      ...prev,
      editedValues: {
        ...prev.editedValues,
        [field]: type === 'checkbox' ? checked : 
                 type === 'number' ? Number(value) : 
                 value
      }
    }));
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedFlats = sortFlats(filteredFlats, key, direction);
    setFilteredFlats(sortedFlats);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>All Available Flats</h1>
        
        <div className={styles.filters}>
          <Search 
            value={searchQuery} 
            onChange={setSearchQuery}
            placeholder="Search by name, city, or street..."
          />
          
          <div className={styles.filterGrid}>
            <div className={styles.filterGroup}>
              <label>City</label>
              <input
                type="text"
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
                className={styles.filterInput}
                placeholder="Enter city"
              />
            </div>
            
            <div className={styles.filterGroup}>
              <label>Price Range ($)</label>
              <div className={styles.rangeInputs}>
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  className={styles.filterInput}
                  placeholder="Min"
                />
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  className={styles.filterInput}
                  placeholder="Max"
                />
              </div>
            </div>
            
            <div className={styles.filterGroup}>
              <label>Area Range (m²)</label>
              <div className={styles.rangeInputs}>
                <input
                  type="number"
                  name="minArea"
                  value={filters.minArea}
                  onChange={handleFilterChange}
                  className={styles.filterInput}
                  placeholder="Min"
                />
                <input
                  type="number"
                  name="maxArea"
                  value={filters.maxArea}
                  onChange={handleFilterChange}
                  className={styles.filterInput}
                  placeholder="Max"
                />
              </div>
            </div>
          </div>
        </div>
     
        <div className={styles.sortButtons}>
          <button onClick={() => handleSort('city')} className={styles.sortButton}>
            Sort by City <FaSort />
          </button>
          <button onClick={() => handleSort('rentPrice')} className={styles.sortButton}>
            Sort by Price <FaSort />
          </button>
          <button onClick={() => handleSort('areaSize')} className={styles.sortButton}>
            Sort by Area <FaSort />
          </button>
        </div>
      </div>

      {filteredFlats.length === 0 ? (
        <div className={styles.noResults}>No flats match your search criteria.</div>
      ) : (
        <div className={styles.flatsGrid}>
          {filteredFlats.map((flat) => (
            <div key={flat.id} className={styles.flatCard}>
              {editingFlat?.id === flat.id ? (
                <div className={styles.editForm}>
                  <div className={styles.editGrid}>
                    <div className={styles.editField}>
                      <label>Name:</label>
                      <input
                        type="text"
                        value={editingFlat.editedValues.name}
                        onChange={(e) => handleInputChange(e, 'name')}
                        className={styles.editInput}
                      />
                    </div>

                    <div className={styles.editField}>
                      <label>City:</label>
                      <input
                        type="text"
                        value={editingFlat.editedValues.city}
                        onChange={(e) => handleInputChange(e, 'city')}
                        className={styles.editInput}
                      />
                    </div>

                    <div className={styles.editField}>
                      <label>Street Name:</label>
                      <input
                        type="text"
                        value={editingFlat.editedValues.streetName}
                        onChange={(e) => handleInputChange(e, 'streetName')}
                        className={styles.editInput}
                      />
                    </div>

                    <div className={styles.editField}>
                      <label>Street Number:</label>
                      <input
                        type="number"
                        value={editingFlat.editedValues.streetNumber}
                        onChange={(e) => handleInputChange(e, 'streetNumber')}
                        className={styles.editInput}
                      />
                    </div>

                    <div className={styles.editField}>
                      <label>Area Size (m²):</label>
                      <input
                        type="number"
                        value={editingFlat.editedValues.areaSize}
                        onChange={(e) => handleInputChange(e, 'areaSize')}
                        className={styles.editInput}
                      />
                    </div>

                    <div className={styles.editField}>
                      <label>Rent Price ($):</label>
                      <input
                        type="number"
                        value={editingFlat.editedValues.rentPrice}
                        onChange={(e) => handleInputChange(e, 'rentPrice')}
                        className={styles.editInput}
                      />
                    </div>

                    <div className={styles.editField}>
                      <label>Year Built:</label>
                      <input
                        type="number"
                        value={editingFlat.editedValues.yearBuilt}
                        onChange={(e) => handleInputChange(e, 'yearBuilt')}
                        className={styles.editInput}
                      />
                    </div>

                    <div className={styles.editField}>
                      <label className={styles.checkboxContainer}>
                        <input
                          type="checkbox"
                          checked={editingFlat.editedValues.hasAC}
                          onChange={(e) => handleInputChange(e, 'hasAC')}
                          className={styles.checkbox}
                        />
                        Has AC
                      </label>
                    </div>
                  </div>

                  <div className={styles.buttonGroup}>
                    <button onClick={handleSave} className={styles.saveButton}>
                      <FaSave /> Save
                    </button>
                    <button onClick={() => setEditingFlat(null)} className={styles.cancelButton}>
                      <FaTimes /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className={styles.imageContainer}>
                    {flat.imageUrl && (
                      <img 
                        src={flat.imageUrl} 
                        alt={flat.name} 
                        className={styles.flatImage}
                      />
                    )}
                    <button
                      onClick={() => toggleFavorite(flat.id)}
                      className={styles.favoriteButton}
                    >
                      {favorites[flat.id] ? (
                        <FaHeart className={styles.favoriteIcon} />
                      ) : (
                        <FaRegHeart className={styles.favoriteIconOutline} />
                      )}
                    </button>
                  </div>

                  <div className={styles.flatContent}>
                    <div className={styles.flatHeader}>
                      <h2 className={styles.flatTitle}>{flat.name}</h2>
                      {isAdmin && (
                        <div className={styles.adminButtons}>
                          <button
                            onClick={() => handleEdit(flat)}
                            className={styles.editButton}
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(flat.id)}
                            className={styles.deleteButton}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className={styles.flatDetails}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Location:</span>
                        <span>{flat.city}, {flat.streetName} {flat.streetNumber}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Area:</span>
                        <span>{flat.areaSize} m²</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Year Built:</span>
                        <span>{flat.yearBuilt}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Rent:</span>
                        <span>${flat.rentPrice.toLocaleString()}/month</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>AC:</span>
                        <span>{flat.hasAC ? "Yes" : "No"}</span>
                      </div>
                    </div>

                    <div className={styles.listingDate}>
                      Listed on: {flat.createdAt?.toDate().toLocaleDateString()}
                    </div>

                    {isLoggedIn && <FlatMessage flat={flat} />}
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

export default AllFlats;