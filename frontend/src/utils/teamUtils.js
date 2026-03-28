export function collectTeamSportTypes(teams) {
  const set = new Set();
  for (const t of teams) {
    if (t?.sportType?.trim()) set.add(t.sportType.trim());
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function filterTeams(teams, { searchQuery, sportType }) {
  const q = searchQuery.trim().toLowerCase();
  return teams.filter((t) => {
    if (sportType && t.sportType !== sportType) return false;
    if (!q) return true;
    const hay = [
      t.teamName,
      t.sportType,
      t.captain?.fullName,
      ...(Array.isArray(t.members) ? t.members.map((m) => m?.fullName) : []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

/** Match involves this team (populated or raw id). */
export function matchInvolvesTeam(match, teamId) {
  if (!match || teamId == null) return false;
  const tid = String(teamId);
  const a = match.teamA?._id != null ? String(match.teamA._id) : String(match.teamA ?? "");
  const b = match.teamB?._id != null ? String(match.teamB._id) : String(match.teamB ?? "");
  return a === tid || b === tid;
}

export function getOpponentName(match, teamId) {
  const tid = String(teamId);
  const a = match.teamA?._id != null ? String(match.teamA._id) : String(match.teamA ?? "");
  if (a === tid) return match.teamB?.teamName ?? "Opponent";
  return match.teamA?.teamName ?? "Opponent";
}

/** When the player may belong to either side, pass all of their team ids. */
export function getOpponentNameForPlayerTeams(match, teamIds) {
  const set = teamIds instanceof Set ? teamIds : new Set(teamIds);
  const a = String(match.teamA?._id ?? match.teamA ?? "");
  const b = String(match.teamB?._id ?? match.teamB ?? "");
  if (set.has(a)) return match.teamB?.teamName ?? "Opponent";
  if (set.has(b)) return match.teamA?.teamName ?? "Opponent";
  return match.teamA?.teamName ?? "Opponent";
}
