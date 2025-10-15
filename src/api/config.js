// src/api/config.js

// Resolve BASE_URL dynamically for Expo environments
// - Android emulator: use 10.0.2.2
// - iOS simulator / web: localhost is fine
// - Real devices: set EXPO_PUBLIC_API_HOST to your LAN IP (e.g., 192.168.x.x)
const getBaseUrl = () => {
  const envHost = process.env.EXPO_PUBLIC_API_HOST; // e.g., 192.168.0.105
  const envPort = process.env.EXPO_PUBLIC_API_PORT || '5001';

  if (envHost) return `http://${envHost}:${envPort}`;

  // Android emulator special case
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    // Heuristic: on Android emulator most common default is 10.0.2.2
    // If that doesn't work, supply EXPO_PUBLIC_API_HOST
    return 'http://192.168.0.105:5001';
  }

  // Default to localhost for web/ios simulator
  return 'http://localhost:5000';
};

export const BASE_URL = getBaseUrl(); 

// Use a variable for temporary storage; for persistent storage 
// we will use SecureStore in the AuthContext.
export let JWT_TOKEN = '';

export const setJwtToken = (token) => {
  JWT_TOKEN = token;
};