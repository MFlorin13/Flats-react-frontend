import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { ToastProvider } from './components/Context/ToastContext/ToastContext';
import { FavoritesProvider } from './components/Context/FavoriteContext/FavoriteContext';
import { AuthProvider } from './components/Auth/Auth';
import { ProtectedRoute } from './components/ProtectedRoutes/ProtectedRoutes';
import AppLayout from './components/AppLayout/AppLayout';
import AddFlat from './components/Flats/AddFlat/AddFlat';
import Register from './components/Register/Register';
import Login from './components/Login/Login';
import MyFlats from './components/Flats/MyFLats/Myflats';
import AdminPage from './components/Admin/AdminPage/AdminPage';
import AllFlats from './components/Flats/AllFlats/AllFlats';
import FavoritesPage from './components/FavoritesPage/FavoritesPage';
import UpdateProfile from './components/UpdateProfile/UpdateProfile';
import NotFound from './components/PageNotFound/PageNotFound';


const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: '/',
        element: (
          <ProtectedRoute>
            <AllFlats />
          </ProtectedRoute>
        )
      },
      { path: '/register', element: <Register /> },
      { path: '/login', element: <Login /> },
      { path: '*', element: <NotFound /> },

      {
        path: '/my-flats',
        element: (
          <ProtectedRoute>
            <MyFlats />
          </ProtectedRoute>
        )
      },

      {
        path: '/add-flat',
        element: (
          <ProtectedRoute>
            <AddFlat />
          </ProtectedRoute>
        )
      },
      {
        path: '/admin',
        element: (
          <ProtectedRoute adminRequired={true}>
            <AdminPage />
          </ProtectedRoute>
        )
      },
      {
        path: '/favorites',
        element: (
          <ProtectedRoute>
            <FavoritesPage />
          </ProtectedRoute>
        )
      },
      {
        path: '/profile',
        element: (
          <ProtectedRoute>
            <UpdateProfile />
          </ProtectedRoute>
        )
      },
    ],
  },
]);

const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <FavoritesProvider>
          <RouterProvider router={router} />
        </FavoritesProvider>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;