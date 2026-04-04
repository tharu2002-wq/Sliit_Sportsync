import { api } from "./client";

/**
 * Current user profile (protected). Mirrors `GET /api/users/profile`.
 */
export async function getProfile() {
  const { data } = await api.get("/users/profile");
  return data;
}

/**
 * Update current user profile (protected). Mirrors `PATCH /api/users/profile`.
 * @param {{ name?: string; age?: number | null; academicYear?: string | null; faculty?: string | null; studentId?: string | null; skills?: string[] }} payload
 */
export async function updateProfile(payload) {
  const { data } = await api.patch("/users/profile", payload);
  return data;
}

/**
 * Permanently delete the current student account. Mirrors `DELETE /api/users/account`.
 */
export async function deleteAccount() {
  const { data } = await api.delete("/users/account");
  return data;
}
