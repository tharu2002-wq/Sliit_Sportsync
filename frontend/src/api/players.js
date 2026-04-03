import { api } from "./client";

export async function getPlayers() {
  const { data } = await api.get("/players");
  return data;
}

/**
 * Athlete profiles whose `studentId` matches the current user’s profile Student ID.
 * Mirrors `GET /api/players/me` (empty array if Student ID is not set or no match).
 */
export async function getMyLinkedPlayers() {
  const { data } = await api.get("/players/me");
  return Array.isArray(data) ? data : [];
}

export async function getPlayerById(id) {
  const { data } = await api.get(`/players/${id}`);
  return data;
}

/**
 * @param {Record<string, unknown>} payload
 */
export async function createPlayer(payload) {
  const { data } = await api.post("/players", payload);
  return data;
}

/**
 * @param {string} id
 * @param {Record<string, unknown>} payload
 */
export async function updatePlayer(id, payload) {
  const { data } = await api.put(`/players/${id}`, payload);
  return data;
}

/**
 * @param {string} id
 */
export async function deletePlayer(id) {
  const { data } = await api.delete(`/players/${id}`);
  return data;
}
