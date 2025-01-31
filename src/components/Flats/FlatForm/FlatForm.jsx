import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { addDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../config/firebase';
import { getAuth } from 'firebase/auth';
import { collection } from 'firebase/firestore';
import { ImageUpload } from '../../CommonComponents/ImageUpload';
import { useToast } from '../../Context/ToastContext/ToastContext';
import { validateFlat } from '../../Utils/FormValidation';
import styles from '../AddFlat/AddFlat.module.css';
import { FaSpinner } from 'react-icons/fa';

const FlatForm = ({ refreshList }) => {
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    streetName: "",
    streetNumber: "",
    areaSize: "",
    hasAC: false,
    yearBuilt: "",
    rentPrice: "",
    image: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const auth = getAuth();
  const { addToast } = useToast();
  const navigate = useNavigate(); // Initialize useNavigate

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleImageSelect = (file) => {
    setFormData(prev => ({ ...prev, image: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      if (!auth.currentUser) {
        addToast('You must be logged in to add a flat', 'error');
        return;
      }

      const flatData = {
        name: formData.name,
        city: formData.city,
        streetName: formData.streetName,
        streetNumber: Number(formData.streetNumber),
        areaSize: Number(formData.areaSize),
        hasAC: formData.hasAC,
        yearBuilt: Number(formData.yearBuilt),
        rentPrice: Number(formData.rentPrice),
        userId: auth.currentUser.uid,
        createdAt: new Date()
      };

      const validationErrors = validateFlat(flatData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        addToast('Please fix the errors in the form', 'error');
        return;
      }

      if (formData.image) {
        const storageRef = ref(storage, `images/${Date.now()}_${formData.image.name}`);
        const uploadTask = uploadBytesResumable(storageRef, formData.image);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            },
            (error) => reject(error),
            async () => {
              try {
                const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(imageUrl);
              } catch (error) {
                reject(error);
              }
            }
          );
        }).then((imageUrl) => {
          flatData.imageUrl = imageUrl;
        });
      }

      await addDoc(collection(db, 'flats'), flatData);
      addToast('Flat added successfully!', 'success');
      refreshList?.();
      navigate('/'); // Redirect to MyFlats page
    } catch (error) {
      console.error('Error creating flat:', error);
      addToast('Error adding flat. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label className={styles.label}>Flat Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
          placeholder="Enter flat name"
        />
        {errors.name && <span className={styles.error}>{errors.name}</span>}
      </div>

      <div className={styles.inputGrid}>
        <div className={styles.formGroup}>
          <label className={styles.label}>City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={`${styles.input} ${errors.city ? styles.inputError : ''}`}
            placeholder="Enter city"
          />
          {errors.city && <span className={styles.error}>{errors.city}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Street Name</label>
          <input
            type="text"
            name="streetName"
            value={formData.streetName}
            onChange={handleChange}
            className={`${styles.input} ${errors.streetName ? styles.inputError : ''}`}
            placeholder="Enter street name"
          />
          {errors.streetName && <span className={styles.error}>{errors.streetName}</span>}
        </div>
      </div>

      <div className={styles.inputGrid}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Street Number</label>
          <input
            type="number"
            name="streetNumber"
            value={formData.streetNumber}
            onChange={handleChange}
            onKeyDown={(e) => e.key === 'e' && e.preventDefault()}
            step="1"
            className={`${styles.input} ${errors.streetNumber ? styles.inputError : ''}`}
            placeholder="Enter street number"
          />
          {errors.streetNumber && <span className={styles.error}>{errors.streetNumber}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Area Size (m²)</label>
          <input
            type="number"
            name="areaSize"
            value={formData.areaSize}
            onChange={handleChange}
            onKeyDown={(e) => e.key === 'e' && e.preventDefault()}
            step="1"
            className={`${styles.input} ${errors.areaSize ? styles.inputError : ''}`}
            placeholder="Enter area size"
          />
          {errors.areaSize && <span className={styles.error}>{errors.areaSize}</span>}
        </div>
      </div>

      <div className={styles.inputGrid}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Year Built</label>
          <input
            type="number"
            name="yearBuilt"
            value={formData.yearBuilt}
            onChange={handleChange}
            onKeyDown={(e) => e.key === 'e' && e.preventDefault()}
            step="1"
            className={`${styles.input} ${errors.yearBuilt ? styles.inputError : ''}`}
            placeholder="Enter year built"
          />
          {errors.yearBuilt && <span className={styles.error}>{errors.yearBuilt}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Rent Price ($)</label>
          <input
            type="number"
            name="rentPrice"
            value={formData.rentPrice}
            onChange={handleChange}
            onKeyDown={(e) => e.key === 'e' && e.preventDefault()}
            step="1"
            className={`${styles.input} ${errors.rentPrice ? styles.inputError : ''}`}
            placeholder="Enter rent price"
          />
          {errors.rentPrice && <span className={styles.error}>{errors.rentPrice}</span>}
        </div>
      </div>

      <div className={styles.formGroup}>
        <div className={styles.checkboxGroup}>
          <input
            type="checkbox"
            name="hasAC"
            checked={formData.hasAC}
            onChange={handleChange}
            className={styles.checkbox}
            id="hasAC"
          />
          <label htmlFor="hasAC" className={styles.label}>Has Air Conditioning</label>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Property Image</label>
        <div className={styles.imageSection}>
          <ImageUpload onImageSelect={handleImageSelect} currentImage={null} />
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      </div>

      <div className={styles.buttonGroup}>
        <button
          type="submit"
          disabled={isSubmitting}
          className={styles.submitButton}
        >
          {isSubmitting ? (
            <>
              <FaSpinner className={styles.loadingSpinner} />
              Adding Flat...
            </>
          ) : (
            'Add Flat'
          )}
        </button>
      </div>
    </form>
  );
};

export default FlatForm;