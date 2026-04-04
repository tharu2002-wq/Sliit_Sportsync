import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { loginRequest, registerRequest } from "../api/auth";
import { clearAuthSession, getAuthToken, getStoredUser, setAuthSession } from "../utils/authStorage";

const AuthContext = createContext(null);

function normalizeUser(payload) {
  if (!payload) return null;
  return {
    _id: payload._id,
    name: payload.name,
    email: payload.email,
    role: payload.role,
    academicYear: payload.academicYear ?? undefined,
    faculty: payload.faculty ?? undefined,
    studentId: payload.studentId ?? undefined,
    age:
      typeof payload.age === "number" && Number.isInteger(payload.age) ? payload.age : undefined,
    skills: Array.isArray(payload.skills) ? payload.skills : undefined,
    createdAt: payload.createdAt ?? undefined,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => getAuthToken());

  const applyAuthPayload = useCallback((payload) => {
    const nextUser = normalizeUser(payload);
    const nextToken = payload?.token ?? null;
    if (nextToken && nextUser) {
      setAuthSession({ token: nextToken, ...nextUser });
      setToken(nextToken);
      setUser(nextUser);
    }
  }, []);

  const login = useCallback(
    async (credentials) => {
      const data = await loginRequest(credentials);
      applyAuthPayload(data);
      return data;
    },
    [applyAuthPayload]
  );

  const register = useCallback(
    async (payload) => {
      const data = await registerRequest(payload);
      applyAuthPayload(data);
      return data;
    },
    [applyAuthPayload]
  );

  const logout = useCallback(() => {
    clearAuthSession();
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((partial) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = normalizeUser({ ...prev, ...partial });
      const t = getAuthToken();
      if (t && next) {
        setAuthSession({ token: t, ...next });
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      updateUser,
    }),
    [user, token, login, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook paired with provider
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
