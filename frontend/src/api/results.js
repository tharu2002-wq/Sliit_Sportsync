import { api } from "./client";

export async function getResults() {
  const { data } = await api.get("/results");
  return data;
}

export async function getResultById(id) {
  const { data } = await api.get(`/results/${id}`);
  return data;
}

/** Result for a match (404 if not recorded yet). */
export async function getResultByMatchId(matchId) {
  const { data } = await api.get(`/results/match/${matchId}`);
  return data;
}

/**
 * @param {{ match: string; scoreA: number; scoreB: number; notes?: string; playerNotes?: Array<{ player: string; note: string }> }} payload
 */
export async function createResult(payload) {
  const { data } = await api.post("/results", payload);
  return data;
}

/**
 * @param {string} id
 * @param {{ scoreA?: number; scoreB?: number; notes?: string; playerNotes?: Array<{ player: string; note: string }> }} payload
 */
export async function updateResult(id, payload) {
  const { data } = await api.put(`/results/${id}`, payload);
  return data;
}

export async function deleteResult(id) {
  const { data } = await api.delete(`/results/${id}`);
  return data;
}

/**
 * League-style standings from recorded match results.
 * @param {string} [eventId] When set, only matches under this event are included.
 * @returns {Promise<Array<{
 *   teamId: string;
 *   teamName: string;
 *   played: number;
 *   wins: number;
 *   draws: number;
 *   losses: number;
 *   goalsFor: number;
 *   goalsAgainst: number;
 *   goalDifference: number;
 *   points: number;
 * }>>}
 */
export async function getLeaderboardTable(eventId) {
  const { data } = await api.get("/results/leaderboard/table", {
    params: eventId ? { eventId } : {},
  });
  return data;
}
