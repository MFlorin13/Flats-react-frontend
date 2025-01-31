import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { FaUserCircle } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../Auth/Auth";
import styles from "./NavBar.module.css";
import DeleteAccount from "../DeleteAccount/DeleteAccount";

const NavBar = () => {
  const [isLoading, setIsLoading] = useState(true);
  const auth = getAuth();
  const navigate = useNavigate();
  const { isLoggedIn, isAdmin, handleLogout, userData } = useAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const logoutAndRedirect = () => {
    handleLogout();
    navigate("/login");
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarContainer}>
        <div className={styles.logo}>FlatFinder</div>
        <div className={styles.navLinks}>
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
            </div>
          ) : (
            <>
              {isLoggedIn ? (
                <>
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      isActive ? styles.activeLink : styles.link
                    }
                  >
                    All Flats
                  </NavLink>
                  <NavLink
                    to="/my-flats"
                    className={({ isActive }) =>
                      isActive ? styles.activeLink : styles.link
                    }
                  >
                    My Flats
                  </NavLink>
                  <NavLink
                    to="/favorites"
                    className={({ isActive }) =>
                      isActive ? styles.activeLink : styles.link
                    }
                  >
                    Favorites
                  </NavLink>
                  <NavLink
                    to="/add-flat"
                    className={({ isActive }) =>
                      isActive ? styles.activeLink : styles.link
                    }
                  >
                    Add Flat
                  </NavLink>
                  <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                      isActive ? styles.activeLink : styles.link
                    }
                  >
                    Update Profile
                  </NavLink>
                  <DeleteAccount />
                  {isAdmin && (
                    <NavLink
                      to="/admin"
                      className={({ isActive }) =>
                        isActive ? styles.activeLink : styles.link
                      }
                    >
                      Admin
                    </NavLink>
                  )}
                  <div className={styles.userInfo}>
                    <FaUserCircle className={styles.avatar} />
                    <span className={styles.userName}>
                      {userData ? `${userData.firstName} ${userData.lastName}` : 'Loading...'}
                    </span>
                  </div>
                  <button
                    className={`${styles.navbarButton} ${styles.link}`}
                    onClick={logoutAndRedirect}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      isActive ? styles.activeLink : styles.link
                    }
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/register"
                    className={({ isActive }) =>
                      isActive ? styles.activeLink : styles.link
                    }
                  >
                    Register
                  </NavLink>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;