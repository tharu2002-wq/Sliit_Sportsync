const TOKEN_KEY = "sportSync_token";
const USER_KEY = "sportSync_user";

export function setAuthSession({ token, _id, name, email, role, ...rest }) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify({ _id, name, email, role, ...rest }));
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * @returns {Record<string, unknown> & { _id: string; name: string; email: string; role: string } | null}
 */
export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw);
    if (user && user._id) return user;
  } catch {
    /* invalid JSON */
  }
  return null;
}
