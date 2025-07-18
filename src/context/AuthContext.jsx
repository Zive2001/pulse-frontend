// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../config/msalConfig';
import { authService } from '../services/auth';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const { instance, accounts, inProgress } = useMsal();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if there's an active account
        if (accounts.length > 0) {
          const account = accounts[0];
          
          // Get or create user in your backend
          const result = await authService.loginWithAzureAD(account);
          if (result.success) {
            setUser(result.user);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    if (inProgress === 'none') {
    initializeAuth();
    }
  }, [accounts, inProgress]);

  const login = async () => {
    try {
      setLoading(true);
      
      // Use MSAL to login
      const response = await instance.loginPopup(loginRequest);
      
      if (response.account) {
        // Send the Azure AD user info to your backend
        const result = await authService.loginWithAzureAD(response.account);
        
        if (result.success) {
          setUser(result.user);
          return { success: true, user: result.user };
        } else {
          return { success: false, error: result.error };
        }
      }
      
      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      await instance.logoutPopup();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  const isAuthenticated = () => {
    return !!user && accounts.length > 0;
  };

  const value = {
    user,
    loading: loading || inProgress !== 'none',
    login,
    logout,
    hasRole,
    hasAnyRole,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};