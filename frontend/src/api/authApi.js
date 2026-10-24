import axios from "axios";
import { toApiError } from "./historyAPI";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const TOKEN_KEY = "resumescope_token";

/* ------------------------------------------------------------------
   Token handling.
   The token is saved in localStorage (so a refresh keeps you logged in)
   and set as a default header on axios. Every request made anywhere in
   the app, including resumeApi.js and historyApi.js, now carries it
   without changing those files.
------------------------------------------------------------------- */

function applyToken(token) {
  if (token) axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete axios.defaults.headers.common.Authorization;
}

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null; // storage blocked (e.g. some private modes)
  }
}

export function saveSession(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* still works for this tab, just won't survive a refresh */
  }
  applyToken(token);
}

export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
  applyToken(null);
}

/* ------------------------------------------------------------------
   If the server says 401 on a normal request (token expired), forget the
   session and tell the app to send the user back to log in.
   Auth calls themselves are excluded: a wrong password is also a 401.
------------------------------------------------------------------- */

let onUnauthorized = null;
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthCall = String(error.config?.url || "").includes("/api/auth/");
    if (error.response?.status === 401 && !isAuthCall) {
      clearSession();
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

/* ------------------------------------------------------------------
   API calls
------------------------------------------------------------------- */

// POST /api/auth/register  ->  the new user (and the session is saved)
export async function registerUser({ name, email, password }) {
  try {
    const res = await axios.post(`${API_URL}/api/auth/register`, {
      name,
      email,
      password,
    });
    saveSession(res.data.token);
    return res.data.user;
  } catch (error) {
    throw toApiError(error);
  }
}

// POST /api/auth/login  ->  the user (and the session is saved)
export async function loginUser({ email, password }) {
  try {
    const res = await axios.post(`${API_URL}/api/auth/login`, {
      email,
      password,
    });
    saveSession(res.data.token);
    return res.data.user;
  } catch (error) {
    throw toApiError(error);
  }
}

// Used when the app opens: is the saved token still good?
// Resolves with the user, or null if nobody is logged in.
export async function getCurrentUser() {
  const token = getStoredToken();
  if (!token) return null;

  applyToken(token);
  try {
    const res = await axios.get(`${API_URL}/api/auth/me`);
    return res.data.user;
  } catch (error) {
    // Rejected token: forget it. Server simply unreachable: keep it,
    // so a backend restart doesn't log everyone out.
    if (error.response?.status === 401) clearSession();
    throw toApiError(error);
  }
}
