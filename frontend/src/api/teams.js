import { api } from "./client";

export async function getTeams() {
  const { data } = await api.get("/teams");
  return data;
}

export async function getTeamById(id) {
  const { data } = await api.get(`/teams/${id}`);
  return data;
}

/**
 * @param {Record<string, unknown>} payload — teamName, sportType, captain?, members?, scheduleNotes?
 */
export async function createTeam(payload) {
  const { data } = await api.post("/teams", payload);
  return data;
}

/**
 * @param {string} id
 * @param {Record<string, unknown>} payload — teamName?, sportType?, isActive?, scheduleNotes?
 */
export async function updateTeam(id, payload) {
  const { data } = await api.put(`/teams/${id}`, payload);
  return data;
}

export async function deactivateTeam(id) {
  const { data } = await api.patch(`/teams/${id}/deactivate`);
  return data;
}

/**
 * @param {string} teamId
 * @param {string[]} memberIds
 */
export async function addTeamMembers(teamId, memberIds) {
  const { data } = await api.patch(`/teams/${teamId}/members/add`, { memberIds });
  return data;
}

/**
 * @param {string} teamId
 * @param {string} memberId
 */
export async function removeTeamMember(teamId, memberId) {
  const { data } = await api.patch(`/teams/${teamId}/members/remove`, { memberId });
  return data;
}

/**
 * @param {string} teamId
 * @param {string} captainId
 */
export async function assignTeamCaptain(teamId, captainId) {
  const { data } = await api.patch(`/teams/${teamId}/captain`, { captainId });
  return data;
}
