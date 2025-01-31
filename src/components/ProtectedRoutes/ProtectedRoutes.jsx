import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth/Auth';
import { LoadingSpinner } from '../CommonComponents/LoadingSpinner';

export const ProtectedRoute = ({ children, adminRequired = false, requireAuth = true }) => {
  const { user, isAdmin, loading, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading) {
      if (requireAuth && !isLoggedIn) {
        navigate('/login');
      } else if (adminRequired && !isAdmin) {
        navigate('/');
      }
    }
  }, [loading, isLoggedIn, isAdmin, adminRequired, requireAuth, navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if ((requireAuth && !isLoggedIn) || (adminRequired && !isAdmin)) {
    return null;
  }

  return children;
};

export default ProtectedRoute;