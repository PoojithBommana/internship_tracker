import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { authAPI } from '../services/authapis/authapis.tsx';

interface ProtectedRouteProps {
  children: any;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is authenticated
        if (authAPI.isAuthenticated()) {
          const storedUser = authAPI.getStoredUser();
          if (storedUser) {
            setIsAuthenticated(true);
          } else {
            // Try to get current user from API
            const response = await authAPI.getCurrentUser();
            if (response.success) {
              setIsAuthenticated(true);
            } else {
              setIsAuthenticated(false);
            }
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
 