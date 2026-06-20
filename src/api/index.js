// src/api/index.js — CEO Remote Frontend API
// In production: VITE_API_BASE = https://keji-ceo-api.up.railway.app
// In dev:        requests proxy to localhost:8001

const BASE = import.meta.env.VITE_API_BASE
  ? `${import.meta.env.VITE_API_BASE}/api`
  : "/api";

let _token = null;
const SESSION_KEY = "keji_ceo_token";

export function setToken(t)  { _token = t; sessionStorage.setItem(SESSION_KEY, t); }
export function clearToken() { _token = null; sessionStorage.removeItem(SESSION_KEY); }
export function getToken()   { return _token || sessionStorage.getItem(SESSION_KEY); }
export function isLoggedIn() { return !!getToken(); }

// Restore token on module load (page refresh)
const _saved = sessionStorage.getItem(SESSION_KEY);
if (_saved) _token = _saved;

async function request(method, path, body = null) {
  const token = getToken();
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (body)  headers["Content-Type"]  = "application/json";

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });
  } catch {
    throw new Error("Cannot reach the CEO API. Check your internet connection.");
  }

  if (res.status === 204) return null;

  if (res.status === 401) {
    clearToken();
    window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }

  let data;
  try { data = await res.json(); } catch { throw new Error(`Server error (${res.status})`); }

  if (!res.ok) {
    const msg = Array.isArray(data?.detail)
      ? data.detail.map(e => e.msg).join("; ")
      : (data?.detail || `Error ${res.status}`);
    throw new Error(msg);
  }

  return data;
}

const get = (path)        => request("GET",  path);
const post = (path, body) => request("POST", path, body);
const put  = (path, body) => request("PUT",  path, body);

// Auth
export async function login(email, password) {
  const form = new URLSearchParams({ username: email, password });
  let res;
  try {
    res = await fetch(`${BASE}/auth/login`, {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:    form,
    });
  } catch {
    throw new Error("Cannot reach the server. Check your internet connection.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail || "Invalid credentials.");
  setToken(data.access_token);
  return data;
}

export const getMyProfile = () => get("/auth/me");

// Reports
export function getKPI(dateFrom = null, dateTo = null) {
  const p = new URLSearchParams();
  if (dateFrom) p.append("date_from", dateFrom);
  if (dateTo)   p.append("date_to",   dateTo);
  return get(`/reports/kpi?${p}`);
}
export const getDailySummary        = (days = 30) => get(`/reports/daily?days=${days}`);
export const getDebtors             = ()          => get("/reports/debtors");
export const getStaffPerformance    = ()          => get("/reports/staff-performance");
export function getCategoryPerf(dateFrom = null, dateTo = null) {
  const p = new URLSearchParams();
  if (dateFrom) p.append("date_from", dateFrom);
  if (dateTo)   p.append("date_to",   dateTo);
  return get(`/reports/category-performance?${p}`);
}

// Inventory
export const getExpiryAlerts = (days = 90)    => get(`/inventory/expiry-alerts?days=${days}`);
export const getProducts     = (q = "")       => get(`/inventory/products?q=${encodeURIComponent(q)}`);

// v2b: updates all 5 price tiers, not just the base price.
// tiers = { retail_general, retail_subsidized, wholesale_general, wholesale_subsidized, wholesale_bulk }
export const updateBatchPrice = (batchId, tiers, reason = "") =>
  put(`/inventory/batches/${batchId}/price`, {
    new_selling_price:              tiers.retail_general ?? tiers,
    new_price_retail_general:       tiers.retail_general       ?? null,
    new_price_retail_subsidized:    tiers.retail_subsidized    ?? null,
    new_price_wholesale_general:    tiers.wholesale_general    ?? null,
    new_price_wholesale_subsidized: tiers.wholesale_subsidized ?? null,
    new_price_wholesale_bulk:       tiers.wholesale_bulk       ?? null,
    reason,
  });
