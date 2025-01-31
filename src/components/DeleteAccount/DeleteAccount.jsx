import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, deleteUser } from 'firebase/auth';
import { doc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../Auth/Auth';
import { useToast } from '../Context/ToastContext/ToastContext';
import styles from './DeleteAccount.module.css';

const DeleteAccountButton = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const { user } = useAuth();
  const { addToast } = useToast();

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const userId = auth.currentUser.uid;

        // Delete user data from Firestore
        await deleteDoc(doc(db, 'users', userId));
        
        // Delete user's flats
        const flatsQuery = query(collection(db, 'flats'), where('userId', '==', userId));
        const flatsSnapshot = await getDocs(flatsQuery);
        await Promise.all(flatsSnapshot.docs.map(doc => deleteDoc(doc.ref)));
        
        // Delete favorites
        await deleteDoc(doc(db, 'favorites', userId));

        // Delete favorite flats references
        const favoritesQuery = query(collection(db, 'favoriteFlats'), where('userId', '==', userId));
        const favoritesSnapshot = await getDocs(favoritesQuery);
        await Promise.all(favoritesSnapshot.docs.map(doc => deleteDoc(doc.ref)));
        
        // Delete messages
        const sentMessagesQuery = query(collection(db, 'messages'), where('senderId', '==', userId));
        const receivedMessagesQuery = query(collection(db, 'messages'), where('recipientId', '==', userId));
        
        const [sentMessages, receivedMessages] = await Promise.all([
          getDocs(sentMessagesQuery),
          getDocs(receivedMessagesQuery)
        ]);
        
        await Promise.all([
          ...sentMessages.docs.map(doc => deleteDoc(doc.ref)),
          ...receivedMessages.docs.map(doc => deleteDoc(doc.ref))
        ]);

        // Delete authentication account
        await deleteUser(auth.currentUser);
        
        addToast('Account successfully deleted', 'success');
        navigate('/register');
      } catch (error) {
        console.error('Error deleting account:', error);
        addToast('Failed to delete account. Please try again.', 'error');
      }
    }
  };

  return (
    <button
      className={styles.deleteButton}
      onClick={handleDeleteAccount}
    >
      Delete Account
    </button>
  );
};

export default DeleteAccountButton;