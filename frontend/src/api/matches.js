import { api } from "./client";

export async function getMatches() {
  const { data } = await api.get("/matches");
  return data;
}

export async function getMatchById(id) {
  const { data } = await api.get(`/matches/${id}`);
  return data;
}

export async function getMatchesByEvent(eventId) {
  const { data } = await api.get(`/matches/event/${eventId}`);
  return data;
}

/**
 * @param {Record<string, unknown>} payload
 */
export async function createMatch(payload) {
  const { data } = await api.post("/matches", payload);
  return data;
}

/**
 * @param {string} id
 * @param {Record<string, unknown>} payload
 */
export async function updateMatch(id, payload) {
  const { data } = await api.put(`/matches/${id}`, payload);
  return data;
}

export async function cancelMatch(id) {
  const { data } = await api.patch(`/matches/${id}/cancel`);
  return data;
}

export async function deleteCancelledMatch(id) {
  const { data } = await api.delete(`/matches/${id}`);
  return data;
}
