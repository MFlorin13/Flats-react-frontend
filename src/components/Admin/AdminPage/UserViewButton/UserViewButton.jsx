import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Eye } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../config/firebase';
import { useToast } from '../../../Context/ToastContext/ToastContext';
import styles from './UserViewButton.module.css';

const Modal = ({ isOpen, onClose, children }) => {
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

const UserViewButton = ({ user, userFlats, onUserUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const [editableUser, setEditableUser] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    birthDate: user.birthDate,
  });

  const handleViewClick = (e) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditableUser({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      birthDate: user.birthDate,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const userRef = doc(db, 'users', user.id);

      const updatedUserData = {
        firstName: editableUser.firstName,
        lastName: editableUser.lastName,
        email: editableUser.email,
        birthDate: editableUser.birthDate,
      };

      // Update Firestore
      await updateDoc(userRef, updatedUserData);

      // Call the parent's update function with the new data
      if (onUserUpdate) {
        onUserUpdate({
          ...user,
          ...updatedUserData,
          id: user.id // Make sure to include the ID
        });
      }

      setIsEditing(false);
      addToast('User information updated successfully', 'success');
    } catch (error) {
      console.error('Error updating user:', error);
      addToast('Failed to update user information', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <>
      <button onClick={handleViewClick} className={styles.viewButton}>
        <Eye size={18} />
        View Profile
      </button>

      <Modal isOpen={isModalOpen} onClose={handleClose}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>User Profile</h2>
            <div className={styles.headerButtons}>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className={styles.editButton}
                >
                  Edit
                </button>
              )}
              <button onClick={handleClose} className={styles.closeButton}>
                ×
              </button>
            </div>
          </div>

          <div className={styles.userInfo}>
            <div className={styles.infoSection}>
              <h3 className={styles.sectionTitle}>Personal Information</h3>
              <div className={styles.infoGrid}>
                {isEditing ? (
                  <>
                    <div className={styles.infoCard}>
                      <label className={styles.infoLabel}>First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={editableUser.firstName}
                        onChange={handleInputChange}
                        className={styles.editInput}
                      />
                    </div>
                    <div className={styles.infoCard}>
                      <label className={styles.infoLabel}>Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={editableUser.lastName}
                        onChange={handleInputChange}
                        className={styles.editInput}
                      />
                    </div>
                    <div className={styles.infoCard}>
                      <label className={styles.infoLabel}>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={editableUser.email}
                        onChange={handleInputChange}
                        className={styles.editInput}
                      />
                    </div>
                    <div className={styles.infoCard}>
                      <label className={styles.infoLabel}>Birth Date</label>
                      <input
                        type="date"
                        name="birthDate"
                        value={editableUser.birthDate}
                        onChange={handleInputChange}
                        className={styles.editInput}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.infoCard}>
                      <div className={styles.infoLabel}>Full Name</div>
                      <div className={styles.infoValue}>{user.firstName} {user.lastName}</div>
                    </div>
                    <div className={styles.infoCard}>
                      <div className={styles.infoLabel}>Email</div>
                      <div className={styles.infoValue}>{user.email}</div>
                    </div>
                    <div className={styles.infoCard}>
                      <div className={styles.infoLabel}>Age</div>
                      <div className={styles.infoValue}>{calculateAge(user.birthDate)} years</div>
                    </div>
                    <div className={styles.infoCard}>
                      <div className={styles.infoLabel}>Birth Date</div>
                      <div className={styles.infoValue}>
                        {new Date(user.birthDate).toLocaleDateString()}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className={styles.infoSection}>
              <h3 className={styles.sectionTitle}>Account Information</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>Account Type</div>
                  <div className={styles.infoValue}>
                    <span className={user.isAdmin ? styles.adminBadge : styles.userBadge}>
                      {user.isAdmin ? 'Admin' : 'Regular User'}
                    </span>
                  </div>
                </div>
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>Number of Flats</div>
                  <div className={styles.infoValue}>{userFlats[user.uid] || 0}</div>
                </div>
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>Account Created</div>
                  <div className={styles.infoValue}>
                    {user.createdAt?.toDate().toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.modalFooter}>
            {isEditing ? (
              <div className={styles.editActions}>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className={styles.saveButton}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button onClick={handleClose} className={styles.closeModalButton}>
                Close
              </button>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default UserViewButton;