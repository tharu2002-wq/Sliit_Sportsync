/**
 * @param {unknown} player
 * @returns {string} Comma-separated team names, or em dash.
 */
export function formatPlayerTeamsLine(player) {
  if (Array.isArray(player?.teams) && player.teams.length > 0) {
    return player.teams
      .map((t) => (typeof t === "object" && t?.teamName ? t.teamName : null))
      .filter(Boolean)
      .join(", ");
  }
  if (player?.team?.teamName) return player.team.teamName;
  return "—";
}
