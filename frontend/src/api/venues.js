import { api } from "./client";

export async function getVenues() {
  const { data } = await api.get("/venues");
  return data;
}

export async function getVenueById(id) {
  const { data } = await api.get(`/venues/${id}`);
  return data;
}

export async function createVenue(payload) {
  const { data } = await api.post("/venues", payload);
  return data;
}

export async function updateVenue(id, payload) {
  const { data } = await api.put(`/venues/${id}`, payload);
  return data;
}

export async function deleteVenue(id) {
  const { data } = await api.delete(`/venues/${id}`);
  return data;
}

/**
 * Partial update: `status` and/or `unavailableDates` (matches PATCH /venues/:id/availability).
 * @returns {{ message?: string; venue: unknown }}
 */
export async function patchVenueAvailability(id, body) {
  const { data } = await api.patch(`/venues/${id}/availability`, body);
  return data;
}
