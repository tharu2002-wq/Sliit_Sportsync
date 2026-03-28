import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { getAuthToken } from "../utils/authStorage";

/**
 * Shared Axios instance for the backend API.
 * Attaches Bearer token when present (protected routes).
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 20_000,
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
