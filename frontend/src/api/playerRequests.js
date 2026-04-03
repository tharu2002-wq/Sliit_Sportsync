import { api } from "./client";

export async function getMyPlayerRequest() {
  const { data } = await api.get("/player-requests/me");
  return data;
}

export async function createPlayerRequest() {
  const { data } = await api.post("/player-requests");
  return data;
}

export async function listPlayerRequests(params = {}) {
  const { data } = await api.get("/player-requests", { params });
  return Array.isArray(data) ? data : [];
}

/**
 * @param {string} id
 * @param {{ department: string; age: number; gender: string; sportTypes?: string[] }} payload
 */
export async function acceptPlayerRequest(id, payload) {
  const { data } = await api.patch(`/player-requests/${id}/accept`, payload);
  return data;
}

/**
 * @param {string} id
 * @param {{ reason?: string }} [payload]
 */
export async function rejectPlayerRequest(id, payload = {}) {
  const { data } = await api.patch(`/player-requests/${id}/reject`, payload);
  return data;
}
