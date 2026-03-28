import { api } from "./client";

/**
 * Current user profile (protected). Mirrors `GET /api/users/profile`.
 */
export async function getProfile() {
  const { data } = await api.get("/users/profile");
  return data;
}
