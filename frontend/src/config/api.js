const raw = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

/** Base URL for REST API (no trailing slash). */
export const API_BASE_URL = raw.replace(/\/$/, "");
