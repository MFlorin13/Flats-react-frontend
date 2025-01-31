import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Eye } from 'lucide-react';
import styles from './FlatView.module.css';

const Modal = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className={styles.modalRoot}>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modalContainer}>
        {children}
      </div>
    </div>,
    document.body
  );
};

const FlatViewButton = ({ flat, onView }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewClick = (e) => {
    e.stopPropagation();
    setIsModalOpen(true);
    if (onView) onView(flat);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        onClick={handleViewClick}
        className={styles.viewButton}
      >
        <Eye size={18} />
        View Details
      </button>

      <Modal isOpen={isModalOpen} onClose={handleClose}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>{flat.name}</h2>
            <button
              onClick={handleClose}
              className={styles.closeButton}
            >
              ×
            </button>
          </div>

          {flat.imageUrl && (
            <div className={styles.imageContainer}>
              <img
                src={flat.imageUrl}
                alt={flat.name}
                className={styles.flatImage}
              />
            </div>
          )}

          <div className={styles.detailsContainer}>
            <div className={styles.locationAlert}>
              <h3 className={styles.locationTitle}>Location</h3>
              <p className={styles.locationText}>
                {flat.city}, {flat.streetName} {flat.streetNumber}
              </p>
            </div>

            <div className={styles.detailsGrid}>
              <div className={styles.detailCard}>
                <div className={styles.detailLabel}>Area</div>
                <div className={styles.detailValue}>{flat.areaSize} m²</div>
              </div>
              <div className={styles.detailCard}>
                <div className={styles.detailLabel}>Year Built</div>
                <div className={styles.detailValue}>{flat.yearBuilt}</div>
              </div>
              <div className={styles.detailCard}>
                <div className={styles.detailLabel}>Monthly Rent</div>
                <div className={styles.detailValue}>${flat.rentPrice.toLocaleString()}</div>
              </div>
              <div className={styles.detailCard}>
                <div className={styles.detailLabel}>Air Conditioning</div>
                <div className={styles.detailValue}>{flat.hasAC ? "Yes" : "No"}</div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                onClick={handleClose}
                className={styles.closeModalButton}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default FlatViewButton;