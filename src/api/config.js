// src/api/config.js

// Replace 'http://localhost:5000' with your live Render URL
export const BASE_URL = 'http://10.96.82.1:5001'; 

// Use a variable for temporary storage; for persistent storage 
// we will use SecureStore in the AuthContext.
export let JWT_TOKEN = '';

export const setJwtToken = (token) => {
  JWT_TOKEN = token;
};