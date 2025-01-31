import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../Auth/Auth';
import styles from './FlatMessagingComponent.module.css';

const FlatMessage = ({ flat }) => {
  const [message, setMessage] = useState('');
  const [ownerData, setOwnerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, isLoggedIn } = useAuth();

  useEffect(() => {
    const fetchOwner = async () => {
      if (!flat.userId) return;
      try {
        const userQuery = query(
          collection(db, 'users'),
          where('uid', '==', flat.userId)
        );
        const querySnapshot = await getDocs(userQuery);
        if (!querySnapshot.empty) {
          setOwnerData(querySnapshot.docs[0].data());
        }
      } catch (err) {
        console.error('Error fetching owner data:', err);
      }
    };
    fetchOwner();
  }, [flat.userId]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!isLoggedIn) return;
      try {
        const messagesQuery = query(
          collection(db, 'messages'),
          where('flatId', '==', flat.id),
          where('recipientId', '==', user?.uid)
        );
        const querySnapshot = await getDocs(messagesQuery);
        const messages = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate()
        }));
        setReceivedMessages(messages);
        setUnreadCount(messages.filter(msg => !msg.read).length);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };
    fetchMessages();
  }, [flat.id, user, isLoggedIn]);

  const markAllAsRead = async () => {
    try {
      setReceivedMessages(prev => prev.map(msg => ({ ...msg, read: true })));
      setUnreadCount(0);

      const unreadMessages = receivedMessages.filter(msg => !msg.read);
      const updatePromises = unreadMessages.map(msg => {
        const messageRef = doc(db, 'messages', msg.id);
        return updateDoc(messageRef, { read: true });
      });
      await Promise.all(updatePromises);
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  const handleMessageButtonClick = () => {
    if (!showMessageForm) {
      markAllAsRead();
    }
    setShowMessageForm(!showMessageForm);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      alert('Please log in to send messages');
      return;
    }
    if (!message.trim() || !ownerData) {
      setError('Please write a message');
      return;
    }
    if (user.uid === flat.userId) {
      setError('You cannot send a message to yourself');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'messages'), {
        flatId: flat.id,
        flatName: flat.name,
        senderId: user.uid,
        senderEmail: user.email,
        recipientId: flat.userId,
        recipientEmail: ownerData.email,
        message,
        timestamp: serverTimestamp(),
        read: false
      });
      setMessage('');
      setShowMessageForm(false);
      setError('');
      alert('Message sent successfully!');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) return null;

  if (user.uid === flat.userId) {
    return (
      <div className={styles.messageContainer}>
        <button
          className={styles.messageButton}
          onClick={handleMessageButtonClick}
        >
          Messages
          {unreadCount > 0 && <span className={styles.unreadBadge}>{unreadCount}</span>}
        </button>

        {showMessageForm && receivedMessages.length > 0 && (
          <div className={styles.messageHistory}>
            {receivedMessages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.messageCard} ${!msg.read ? styles.unread : ''}`}
              >
                <div className={styles.messageHeader}>
                  <span className={styles.sender}>From: {msg.senderEmail}</span>
                  <span className={styles.timestamp}>
                    {msg.timestamp?.toLocaleString()}
                  </span>
                </div>
                <p className={styles.messageContent}>{msg.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.messageContainer}>
      <button
        className={styles.messageButton}
        onClick={() => setShowMessageForm(!showMessageForm)}
      >
        Contact Owner
      </button>

      {showMessageForm && (
        <div className={styles.messageForm}>
          <h3 className={styles.formTitle}>Send Message about {flat.name}</h3>
          {ownerData ? (
            <p className={styles.ownerInfo}>
              Owner: <strong>{ownerData.firstName} {ownerData.lastName}</strong> (<spa>{ownerData.email}</spa>)
            </p>
          ) : (
            <p className={styles.ownerInfo}>
              Loading owner information...
            </p>
          )}
          <form onSubmit={handleSend}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={styles.messageTextarea}
              placeholder="Write your message..."
              required
            />
            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className={styles.sendButton}
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default FlatMessage;