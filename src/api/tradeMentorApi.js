// src/api/tradeMentorApi.js

import { BASE_URL, JWT_TOKEN } from './config';

/**
 * Generic fetch utility for TradeMentor API.
 * Handles headers, JSON parsing, and basic error checks.
 */
const fetchApi = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Apply Bearer Token for authenticated endpoints
  if (JWT_TOKEN) {
    headers['Authorization'] = `Bearer ${JWT_TOKEN}`;
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Check for success status (2xx)
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: 'Server error' }));
      throw new Error(errorBody.message || `Request failed with status: ${response.status}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {};
    }
    
    return response.json();

  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error.message);
    throw error;
  }
};

// --- AUTHENTICATION & PROFILE ---

export const signupUser = (name, email, password) => 
  fetchApi('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
    headers: { 'Authorization': '' }, // Override: No auth for signup
  });

export const loginUser = (email, password) => 
  fetchApi('/api/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    headers: { 'Authorization': '' }, // Override: No auth for signin
  });

export const getProfile = () => 
  fetchApi('/api/auth/profile', { method: 'GET' });

// --- LIVE STOCK DATA & MARKET ---

export const getMarketOverview = () => 
  fetchApi('/api/stocks/market-overview', { method: 'GET' });

export const getWatchlist = () => 
  fetchApi('/api/stocks/watchlist', { method: 'GET' });

export const getStockData = (symbol) => 
  fetchApi(`/api/stocks/${symbol}`, { method: 'GET' });

// --- PORTFOLIO ---

export const getPortfolioSummary = () => 
  fetchApi('/api/portfolio/summary', { method: 'GET' });

// --- NEWS ---

export const getNews = (page = 1, limit = 10, query = '') => 
  fetchApi(`/api/news?page=${page}&limit=${limit}&q=${query}`, { method: 'GET' });

// --- IPO ---

export const getAllIpos = () => 
  fetchApi('/api/ipos', { method: 'GET' });

// --- AI & LEARN ---

export const chatWithAI = (message) => 
  fetchApi('/api/learn/chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
  
  fetch(`${BASE_URL}/auth/profile`)
  .then(res => console.log('✅ Connected to backend:', res.status))
  .catch(err => console.log('❌ Cannot connect to backend:', err.message));
