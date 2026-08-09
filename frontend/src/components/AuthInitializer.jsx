import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser, selectIsAuthenticated, selectAuthLoading, selectUser } from '../store/authSlice';

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const loading = useSelector(selectAuthLoading);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      
      // If we have a token but no user data, fetch user data
      if (token && !user) {
        try {
          await dispatch(getCurrentUser()).unwrap();
        } catch (error) {
          // If token is invalid, clear it
          localStorage.removeItem('token');
          console.log('Invalid token removed');
        }
      }
      
      setInitializing(false);
    };

    initializeAuth();
  }, [dispatch, user]);

  // Show loading spinner during initialization
  if (initializing || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return children;
};

export default AuthInitializer;
