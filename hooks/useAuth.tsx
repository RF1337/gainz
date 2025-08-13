// utils/hooks/useAuth.tsx

import * as SecureStore from 'expo-secure-store'; // for example, to persist tokens
import React, { createContext, useContext, useEffect, useState } from 'react';

type AuthContextType = {
  isLoading: boolean;       // true while checking for a stored token
  isSignedIn: boolean;      // becomes true once token is found/valid
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
};

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // On mount, check if a token exists in SecureStore (or AsyncStorage, whatever you use)
  useEffect(() => {
    async function checkToken() {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        setIsSignedIn(!!token);
      } catch (e) {
        console.error('Error fetching auth token:', e);
        setIsSignedIn(false);
      } finally {
        setIsLoading(false);
      }
    }
    checkToken();
  }, []);

  // Example signIn function. Replace with your real API call.
  const signIn = async (email: string, password: string): Promise<boolean> => {
    // ▶︎ Query your back end, verify credentials, get a token
    // For demo purposes, we’ll just accept any non-empty values:
    if (email.length > 0 && password.length > 0) {
      const fakeToken = 'abc123'; // in reality, come from your server
      await SecureStore.setItemAsync('userToken', fakeToken);
      setIsSignedIn(true);
      return true;
    }
    return false;
  };

  // Example signOut function
  const signOut = async () => {
    await SecureStore.deleteItemAsync('userToken');
    setIsSignedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoading, isSignedIn, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to consume
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}