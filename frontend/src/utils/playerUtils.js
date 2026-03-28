export function collectPlayerSportTypes(players) {
  const set = new Set();
  for (const p of players) {
    for (const s of p.sportTypes ?? []) {
      if (s?.trim()) set.add(s.trim());
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function filterPlayers(players, { searchQuery, sportType }) {
  const q = searchQuery.trim().toLowerCase();
  return players.filter((p) => {
    if (sportType) {
      const has = (p.sportTypes ?? []).some((s) => s === sportType);
      if (!has) return false;
    }
    if (!q) return true;
    const hay = [p.fullName, p.studentId, p.email, p.department, ...(p.sportTypes ?? [])]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

export function formatGender(g) {
  if (!g) return "—";
  return String(g).charAt(0).toUpperCase() + String(g).slice(1);
}

/**
 * Teams where this player is listed in `members`, merged with their primary `team` (if any).
 */
export function teamsForPlayer(allTeams, player) {
  if (!player?._id) return [];
  if (Array.isArray(player.teams) && player.teams.length > 0) {
    return player.teams.map((t) => {
      const full = allTeams.find((x) => x?._id && String(x._id) === String(t._id));
      return full ?? t;
    });
  }
  const pid = String(player._id);
  const map = new Map();
  for (const t of allTeams) {
    if (!t?._id) continue;
    const tid = String(t._id);
    const inMembers =
      Array.isArray(t.members) && t.members.some((m) => String(m._id ?? m) === pid);
    if (inMembers) map.set(tid, t);
  }
  const primaryId =
    player.team?._id != null ? String(player.team._id) : player.team != null ? String(player.team) : null;
  if (primaryId) {
    const t = allTeams.find((x) => x?._id && String(x._id) === primaryId);
    if (t) map.set(primaryId, t);
  }
  return [...map.values()];
}
