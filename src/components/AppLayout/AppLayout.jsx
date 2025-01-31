import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import styles from './AppLayout.module.css';
import NavBar from '../Navbar/NavBar';
import Footer from '../Footer/Footer';

const AppLayout = () => {
  const location = useLocation();

  return (
    <div className={styles.container}>
        <NavBar />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
      {location.pathname !== '/login' && location.pathname !== '/register' && <Footer />}
    </div>
  );
};

export default AppLayout;