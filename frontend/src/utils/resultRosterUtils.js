/**
 * @param {Record<string, unknown> | null | undefined} team
 * @returns {Array<{ _id: string; fullName: string; studentId?: string }>}
 */
export function collectTeamRoster(team) {
  if (!team || typeof team !== "object") return [];
  const byId = new Map();

  const add = (p) => {
    if (!p) return;
    if (typeof p === "object" && p !== null && p._id) {
      const id = String(p._id);
      if (!byId.has(id)) {
        byId.set(id, {
          _id: id,
          fullName: typeof p.fullName === "string" ? p.fullName : "Player",
          studentId: typeof p.studentId === "string" ? p.studentId : "",
        });
      }
    }
  };

  add(team.captain);
  const members = Array.isArray(team.members) ? team.members : [];
  members.forEach(add);

  return Array.from(byId.values()).sort((a, b) =>
    a.fullName.localeCompare(b.fullName, undefined, { sensitivity: "base" })
  );
}

/**
 * @param {Record<string, string>} notesByPlayerId
 * @returns {Array<{ player: string; note: string }>}
 */
export function buildPlayerNotesPayload(notesByPlayerId) {
  const out = [];
  for (const [playerId, note] of Object.entries(notesByPlayerId)) {
    const trimmed = String(note ?? "").trim();
    if (trimmed) out.push({ player: playerId, note: trimmed });
  }
  return out;
}

/**
 * @param {Array<{ player?: unknown; note?: string }> | null | undefined} rows
 * @returns {Record<string, string>}
 */
export function playerNotesArrayToMap(rows) {
  if (!Array.isArray(rows)) return {};
  const map = {};
  for (const row of rows) {
    const id =
      row.player && typeof row.player === "object" && row.player !== null && "_id" in row.player
        ? String(row.player._id)
        : row.player != null
          ? String(row.player)
          : "";
    if (!id) continue;
    map[id] = typeof row.note === "string" ? row.note : "";
  }
  return map;
}
