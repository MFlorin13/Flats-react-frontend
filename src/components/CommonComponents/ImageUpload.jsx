import React, { useState, useEffect } from 'react';
import { FaUpload } from 'react-icons/fa';
import styles from './ImageUpload.module.css';

export const ImageUpload = ({ onImageSelect, currentImage = null }) => {
  const [preview, setPreview] = useState(currentImage);


  useEffect(() => {
    if (currentImage === null) {
      setPreview(null);
    }
  }, [currentImage]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
      onImageSelect(file);
    }
  };

  return (
    <div className={styles.imageUpload}>
      <label className={styles.uploadLabel}>
        <FaUpload className={styles.uploadIcon} />
        <span className={styles.uploadText}>Choose Image</span>
        <input
          type="file"
          onChange={handleImageChange}
          accept="image/*"
          hidden
        />
      </label>
      
      {preview && (
        <div className={styles.imagePreview}>
          <img
            src={preview}
            alt="Preview"
            className={styles.previewImage}
          />
        </div>
      )}
    </div>
  );
};