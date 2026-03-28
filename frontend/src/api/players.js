import { api } from "./client";

export async function getPlayers() {
  const { data } = await api.get("/players");
  return data;
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
