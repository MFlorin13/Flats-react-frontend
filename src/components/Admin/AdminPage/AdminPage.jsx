import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { FaUserShield, FaTrash, FaUser } from 'react-icons/fa';
import styles from './AdminPage.module.css';
import UserViewButton from './UserViewButton/UserViewButton';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    userType: 'all',
    ageMin: '',
    ageMax: '',
    flatsMin: '',
    flatsMax: '',
    isAdmin: 'all'
  });
  const [sortConfig, setSortConfig] = useState({
    key: '',
    direction: 'asc'
  });
  const [userFlats, setUserFlats] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const flatsCollection = collection(db, 'flats');
        const flatsCountByUser = {};

        await Promise.all(usersData.map(async (user) => {
          const flatsQuery = query(flatsCollection, where('userId', '==', user.uid));
          const flatsSnapshot = await getDocs(flatsQuery);
          flatsCountByUser[user.uid] = flatsSnapshot.docs.length;
        }));

        setUserFlats(flatsCountByUser);
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

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

  const filterAndSortUsers = (users) => {
    // First apply filters
    let filteredUsers = users.filter(user => {
      const age = calculateAge(user.birthDate);
      const flatsCount = userFlats[user.uid] || 0;

      if (filters.userType !== 'all' && user.isAdmin !== (filters.userType === 'admin')) return false;
      if (filters.ageMin && age < parseInt(filters.ageMin)) return false;
      if (filters.ageMax && age > parseInt(filters.ageMax)) return false;
      if (filters.flatsMin && flatsCount < parseInt(filters.flatsMin)) return false;
      if (filters.flatsMax && flatsCount > parseInt(filters.flatsMax)) return false;
      if (filters.isAdmin !== 'all' && user.isAdmin !== (filters.isAdmin === 'true')) return false;

      return true;
    });

    // Then apply sorting
    if (sortConfig.key) {
      filteredUsers.sort((a, b) => {
        let comparison = 0;
        if (sortConfig.key === 'flatsCount') {
          comparison = (userFlats[a.uid] || 0) - (userFlats[b.uid] || 0);
        } else {
          comparison = a[sortConfig.key].localeCompare(b[sortConfig.key]);
        }
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return filteredUsers;
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const toggleAdminStatus = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const user = users.find(u => u.id === userId);
      await updateDoc(userRef, {
        isAdmin: !user.isAdmin
      });

      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, isAdmin: !u.isAdmin } : u
      ));
    } catch (error) {
      console.error('Error updating admin status:', error);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleUserUpdate = async (updatedUser) => {
    try {
      // Update the users state with the new user data
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === updatedUser.id ? { ...user, ...updatedUser } : user
        )
      );
    } catch (error) {
      console.error('Error updating user list:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return <div className={styles.loading}>Loading users...</div>;
  }

  const filteredUsers = filterAndSortUsers(users);

  return (
    <div className={styles.adminContainer}>
      <h1 className={styles.title}>User Management</h1>

      <div className={styles.filtersSection}>
        <h2 className={styles.sectionTitle}>Filter Options</h2>
        <div className={styles.filtersContainer}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>User Type</label>
            <select
              name="userType"
              value={filters.userType}
              onChange={handleFilterChange}
              className={styles.filterSelect}
            >
              <option value="all">All Users</option>
              <option value="admin">Admins</option>
              <option value="regular">Regular Users</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Age Range</label>
            <div className={styles.rangeInputs}>
              <input
                type="number"
                name="ageMin"
                placeholder="Min"
                value={filters.ageMin}
                onChange={handleFilterChange}
                className={styles.filterInput}
              />
              <input
                type="number"
                name="ageMax"
                placeholder="Max"
                value={filters.ageMax}
                onChange={handleFilterChange}
                className={styles.filterInput}
              />
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Flats Counter Range</label>
            <div className={styles.rangeInputs}>
              <input
                type="number"
                name="flatsMin"
                placeholder="Min"
                value={filters.flatsMin}
                onChange={handleFilterChange}
                className={styles.filterInput}
              />
              <input
                type="number"
                name="flatsMax"
                placeholder="Max"
                value={filters.flatsMax}
                onChange={handleFilterChange}
                className={styles.filterInput}
              />
            </div>
          </div>
        </div>

        <div className={styles.sortSection}>
          <h2 className={styles.sectionTitle}>Sort By</h2>
          <div className={styles.sortButtons}>
            <button
              onClick={() => handleSort('firstName')}
              className={`${styles.sortButton} ${sortConfig.key === 'firstName' ? styles.activeSortButton : ''}`}
            >
              First Name {sortConfig.key === 'firstName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSort('lastName')}
              className={`${styles.sortButton} ${sortConfig.key === 'lastName' ? styles.activeSortButton : ''}`}
            >
              Last Name {sortConfig.key === 'lastName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSort('flatsCount')}
              className={`${styles.sortButton} ${sortConfig.key === 'flatsCount' ? styles.activeSortButton : ''}`}
            >
              Flats Counter {sortConfig.key === 'flatsCount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>
      </div>

      <div className={styles.usersGrid}>
        {filteredUsers.length === 0 ? (
          <div className={styles.noResults}>
            No users match the current filters.
          </div>
        ) : (
          filteredUsers.map(user => (
            <div key={user.id} className={styles.userCard}>
              <div className={styles.userHeader}>
                <h2 className={styles.userName}>{user.firstName} {user.lastName}</h2>
                <div className={styles.userEmail}>{user.email}</div>
              </div>

              <div className={styles.userContent}>
                <div className={styles.userDetail}>
                  <span className={styles.detailLabel}>Age</span>
                  <span className={styles.detailValue}>
                    {calculateAge(user.birthDate)} years
                  </span>
                </div>

                <div className={styles.userDetail}>
                  <span className={styles.detailLabel}>Flats Count</span>
                  <span className={styles.detailValue}>
                    {userFlats[user.uid] || 0}
                  </span>
                </div>

                <div className={styles.userDetail}>
                  <span className={styles.detailLabel}>Status</span>
                  <span>
                    {user.isAdmin ? (
                      <span className={styles.adminBadge}>
                        <FaUserShield /> Admin
                      </span>
                    ) : (
                      <span className={styles.userBadge}>
                        <FaUser /> User
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <div className={styles.adminActions}>
                <button
                  onClick={() => toggleAdminStatus(user.id)}
                  className={`${styles.actionButton} ${styles.adminButton}`}
                  title={user.isAdmin ? "Remove admin status" : "Grant admin status"}
                >
                  <FaUserShield />
                  {user.isAdmin ? "Remove Admin" : "Make Admin"}
                </button>
                <button
                  onClick={() => deleteUser(user.id)}
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                  title="Delete user"
                >
                  <FaTrash />
                  Delete
                </button>
              </div>

              <div className={styles.viewProfileContainer}>
                <UserViewButton
                  user={user}
                  userFlats={userFlats}
                  onUserUpdate={handleUserUpdate} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPage;