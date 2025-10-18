// src/api/tradeMentorApi.js

import { BASE_URL, JWT_TOKEN } from './config';

/**
 * Generic fetch utility for TradeMentor API.
 * Handles headers, JSON parsing, and basic error checks.
 */
const fetchApi = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
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

// --- HEALTH ---

export const healthCheck = () => fetchApi('/', { method: 'GET' });

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

export const updateProfile = (payload) =>
  fetchApi('/api/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

// --- LIVE STOCK DATA & MARKET ---

export const getMarketOverview = () => 
  fetchApi('/api/stocks/market-overview', { method: 'GET' });

export const getWatchlist = () => 
  fetchApi('/api/stocks/watchlist', { method: 'GET' });

export const getStockData = (symbol) => 
  fetchApi(`/api/stocks/${symbol}`, { method: 'GET' });

export const getLatestStock = (symbol) =>
  fetchApi(`/api/stocks/${symbol}`, { method: 'GET' });

export const addToWatchlist = (symbol) =>
  fetchApi('/api/stocks/watchlist/add', {
    method: 'POST',
    body: JSON.stringify({ symbol }),
  });

export const removeFromWatchlist = (symbol) =>
  fetchApi(`/api/stocks/watchlist/remove/${encodeURIComponent(symbol)}`, { method: 'DELETE' });

export const getStockHistory = (symbol) =>
  fetchApi(`/api/stocks/${symbol}/history`, { method: 'GET' });

export const searchStocks = (query) =>
  fetchApi(`/api/stocks/search?query=${encodeURIComponent(query)}`, { method: 'GET' });

export const getSectorStocks = (sector) =>
  fetchApi(`/api/stocks/sector/${encodeURIComponent(sector)}`, { method: 'GET' });

export const getCompanyInfo = (symbol) =>
  fetchApi(`/api/stock-details/company/${encodeURIComponent(symbol)}`, { method: 'GET' });

// --- PORTFOLIO ---

export const getPortfolioSummary = () => 
  fetchApi('/api/portfolio/summary', { method: 'GET' });

export const getPortfolioHoldings = () =>
  fetchApi('/api/portfolio/holdings', { method: 'GET' });

export const getPortfolioTransactions = (page = 1, limit = 20) =>
  fetchApi(`/api/portfolio/transactions?page=${page}&limit=${limit}`, { method: 'GET' });

export const getPortfolioPerformance = () =>
  fetchApi('/api/portfolio/performance', { method: 'GET' });

// --- NEWS ---

export const getNews = (page = 1, limit = 10, query = '') => 
  fetchApi(`/api/news?page=${page}&limit=${limit}&q=${query}`, { method: 'GET' });

export const getNewsById = (id) =>
  fetchApi(`/api/news/${id}`, { method: 'GET' });

export const refreshNewsAdmin = (adminSecret, payload) =>
  fetchApi('/api/news/admin/refresh', {
    method: 'POST',
    headers: { 'x-admin-secret': adminSecret },
    body: JSON.stringify(payload),
  });

// --- IPO ---

export const getAllIpos = () => 
  fetchApi('/api/ipos', { method: 'GET' });

export const getIpoById = (ipoId) =>
  fetchApi(`/api/ipos/${ipoId}`, { method: 'GET' });

export const getIpoBySymbol = (symbol) =>
  fetchApi(`/api/ipos/symbol/${encodeURIComponent(symbol)}`, { method: 'GET' });

export const applyForIpo = (ipoId, userId, appliedLots) =>
  fetchApi(`/api/ipos/${ipoId}/apply`, {
    method: 'POST',
    body: JSON.stringify({ userId, appliedLots }),
  });

export const getIpoApplications = (ipoId) =>
  fetchApi(`/api/ipos/${ipoId}/applications`, { method: 'GET' });

export const getIpoAllotment = (ipoId) =>
  fetchApi(`/api/ipos/${ipoId}/allotment`, { method: 'GET' });

// --- AI & LEARN ---

export const chatWithAI = (message) => 
  fetchApi('/api/learn/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  
export const getLearnContent = (level = 'beginner') =>
  fetchApi(`/api/learn/content/${level}`, { method: 'GET' });

export const searchLearnContent = (level = 'beginner', q = '') =>
  fetchApi(`/api/learn/content/${level}/search?q=${encodeURIComponent(q)}`, { method: 'GET' });

export const resetLearnChat = () =>
  fetchApi('/api/learn/reset', { method: 'POST' });

// --- TRADING ---

export const placeOrder = async ({ symbol, type, qty, price }) => {
  try {
    const response = await fetchApi('/api/trade/place', {
      method: 'POST',
      body: JSON.stringify({ symbol, type, qty, price }),
    });

    console.log("✅ Order placed successfully:", response);
    return response; // pass response back to component

  } catch (error) {
    console.error("❌ Error placing order:", error.message || error);
    // You can choose to show a user-friendly error in your UI later
    throw error; // rethrow so caller knows it failed
  }
};


export const getTradingHistory = (page = 1, limit = 20) =>
  fetchApi(`/api/trade/history?page=${page}&limit=${limit}`, { method: 'GET' });

// --- STOP LOSS ---

export const createStopLoss = ({ symbol, stopLossPrice, quantity }) =>
  fetchApi('/api/stop-loss', {
    method: 'POST',
    body: JSON.stringify({ symbol, stopLossPrice, quantity }),
  });

export const getStopLossOrders = () =>
  fetchApi('/api/stop-loss', { method: 'GET' });

export const updateStopLoss = (stopLossId, { stopLossPrice, quantity }) =>
  fetchApi(`/api/stop-loss/${stopLossId}`, {
    method: 'PUT',
    body: JSON.stringify({ stopLossPrice, quantity }),
  });

export const deleteStopLoss = (stopLossId) =>
  fetchApi(`/api/stop-loss/${stopLossId}`, { method: 'DELETE' });

// --- AI PORTFOLIO ---

export const analyzePortfolio = () =>
  fetchApi('/api/ai/portfolio/analyze', { method: 'GET' });

export const getAIRecommendations = (marketData) =>
  fetchApi('/api/ai/recommendations', {
    method: 'POST',
    body: JSON.stringify({ marketData }),
  });

export const getMarketInsights = (symbolsCsv) =>
  fetchApi(`/api/ai/market-insights?symbols=${encodeURIComponent(symbolsCsv)}`, { method: 'GET' });
  
  // Connectivity check removed (hit wrong path and caused noisy logs)
