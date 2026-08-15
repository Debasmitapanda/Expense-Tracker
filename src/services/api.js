// API Client service for Expense Tracker MongoDB Backend Server

const BASE_URL = '/api';
const TOKEN_KEY = 'gpay_auth_token';
const USER_KEY = 'gpay_auth_user';

// --- Auth Token Management ---

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function removeStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getStoredUser() {
  try {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function removeStoredUser() {
  localStorage.removeItem(USER_KEY);
}

function getAuthHeaders() {
  const token = getStoredToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// --- AUTHENTICATION API CALLS ---

export async function loginApi(username, password) {
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Login failed');
    }
    setStoredToken(data.token);
    setStoredUser(data.user);
    return data;
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function registerApi(username, name, password) {
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, name, password })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Registration failed');
    }
    setStoredToken(data.token);
    setStoredUser(data.user);
    return data;
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function getMeApi() {
  try {
    const token = getStoredToken();
    if (!token) return null;

    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.success && data.user) {
      setStoredUser(data.user);
      return data.user;
    }
    return null;
  } catch (err) {
    return null;
  }
}

export function logoutUser() {
  removeStoredToken();
  removeStoredUser();
}

// --- DATABASE HEALTH & DATA API CALLS ---

export async function checkDbHealth() {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    if (!res.ok) return { status: 'disconnected' };
    const data = await res.json();
    return data;
  } catch (err) {
    return { status: 'disconnected', error: err.message };
  }
}

export async function fetchDraftsFromDb() {
  try {
    const token = getStoredToken();
    if (!token) return {};

    const res = await fetch(`${BASE_URL}/drafts`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch drafts');
    const data = await res.json();
    return data.drafts || {};
  } catch (err) {
    console.error('Error fetching drafts from MongoDB:', err);
    return null;
  }
}

export async function syncDraftsToDb(draftsMap) {
  try {
    const token = getStoredToken();
    if (!token) return false;

    const res = await fetch(`${BASE_URL}/drafts/sync`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ drafts: draftsMap })
    });
    if (!res.ok) throw new Error('Failed to sync drafts');
    const data = await res.json();
    return data.success;
  } catch (err) {
    console.error('Error syncing drafts to MongoDB:', err);
    return false;
  }
}

export async function deleteDraftsForDateFromDb(dateStr) {
  try {
    const token = getStoredToken();
    if (!token) return false;

    const res = await fetch(`${BASE_URL}/drafts/date/${dateStr}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to reset drafts');
    const data = await res.json();
    return data.success;
  } catch (err) {
    console.error(`Error deleting drafts for date ${dateStr} from MongoDB:`, err);
    return false;
  }
}

export async function fetchHistoryFromDb() {
  try {
    const token = getStoredToken();
    if (!token) return {};

    const res = await fetch(`${BASE_URL}/history`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch history');
    const data = await res.json();
    return data.history || {};
  } catch (err) {
    console.error('Error fetching history from MongoDB:', err);
    return null;
  }
}

export async function saveHistoryRecordToDb(record) {
  try {
    const token = getStoredToken();
    if (!token) return false;

    const res = await fetch(`${BASE_URL}/history`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ record })
    });
    if (!res.ok) throw new Error('Failed to save history');
    const data = await res.json();
    return data.success;
  } catch (err) {
    console.error('Error saving history record to MongoDB:', err);
    return false;
  }
}

export async function restoreHistoryToDb(historyObj) {
  try {
    const token = getStoredToken();
    if (!token) return false;

    const res = await fetch(`${BASE_URL}/history/restore`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ historyObj })
    });
    if (!res.ok) throw new Error('Failed to restore history');
    const data = await res.json();
    return data.success;
  } catch (err) {
    console.error('Error restoring history to MongoDB:', err);
    return false;
  }
}export async function deleteHistoryDateFromDb(dateStr) {
  try {
    const token = getStoredToken();
    if (!token) return false;

    const res = await fetch(`${BASE_URL}/history/${dateStr}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete history record');
    const data = await res.json();
    return data.success;
  } catch (err) {
    console.error(`Error deleting history date ${dateStr} from MongoDB:`, err);
    return false;
  }
}
