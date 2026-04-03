import { api } from "./client";

export async function getEvents() {
  const { data } = await api.get("/events");
  return data;
}

export async function getEventById(id) {
  const { data } = await api.get(`/events/${id}`);
  return data;
}

/**
 * @param {Record<string, unknown>} payload
 */
export async function createEvent(payload) {
  const { data } = await api.post("/events", payload);
  return data;
}

/**
 * @param {string} id
 * @param {Record<string, unknown>} payload
 */
export async function updateEvent(id, payload) {
  const { data } = await api.put(`/events/${id}`, payload);
  return data;
}

export async function cancelEvent(id) {
  const { data } = await api.patch(`/events/${id}/cancel`);
  return data;
}

/** Removes a cancelled event from the system (server rejects non-cancelled). */
export async function deleteCancelledEvent(id) {
  const { data } = await api.delete(`/events/${id}`);
  return data;
}
