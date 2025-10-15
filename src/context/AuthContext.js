// src/context/AuthContext.js

import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { loginUser, signupUser, getProfile } from '../api/tradeMentorApi';
import { setJwtToken } from '../api/config';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
console.log('setJwtToken',setJwtToken);
  // Load token from secure storage on app launch
  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
          setJwtToken(token);
          // Try to fetch profile to validate token
          const profile = await getProfile();
          setUser(profile);
        }
      } catch (e) {
        console.error("Failed to load or validate token:", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);

  const signIn = async (email, password) => {
    const response = await loginUser(email, password);
    const { token, user: userData } = response;
    
    await SecureStore.setItemAsync('userToken', token);
    setJwtToken(token);
    setUser(userData);
  };

  const signUp = async (name, email, password) => {
    const response = await signupUser(name, email, password);
    const { token, user: userData } = response;

    await SecureStore.setItemAsync('userToken', token);
    setJwtToken(token);
    setUser(userData);
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync('userToken');
    setJwtToken('');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;