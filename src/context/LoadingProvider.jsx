import React, { createContext, useContext, useState, useEffect } from 'react';

const LoadingContext = createContext();

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export const LoadingProvider = ({ children }) => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    // Show loader for 3.5 seconds on app start
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  const value = {
    isInitialLoading,
    setIsInitialLoading
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};