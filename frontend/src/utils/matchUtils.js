export function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Past / finished for listing: completed, or match day before today.
 * Future cancelled matches stay in upcoming (like events).
 */
export function isPastMatch(match) {
  if (!match) return false;
  if (match.status === "completed") return true;
  if (!match.date) return false;
  const day = new Date(match.date);
  day.setHours(0, 0, 0, 0);
  return day < startOfToday();
}

export function collectMatchSportTypes(matches) {
  const set = new Set();
  for (const m of matches) {
    const s = (m.event?.sportType ?? m.teamA?.sportType ?? "").trim();
    if (s) set.add(s);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function filterMatches(matches, { searchQuery, sportType }) {
  const q = searchQuery.trim().toLowerCase();
  return matches.filter((m) => {
    const sport = m.event?.sportType ?? m.teamA?.sportType ?? "";
    if (sportType && sport !== sportType) return false;
    if (!q) return true;
    const hay = [
      m.event?.title,
      m.teamA?.teamName,
      m.teamB?.teamName,
      m.venue?.venueName,
      m.round,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

/**
 * Sport label for display (event is authoritative; falls back to team).
 * @param {Record<string, unknown> | null | undefined} match
 * @returns {string}
 */
export function getMatchSportTypeLabel(match) {
  if (!match || typeof match !== "object") return "";
  const ev = match.event?.sportType;
  if (typeof ev === "string" && ev.trim()) return ev.trim();
  const a = match.teamA?.sportType;
  const b = match.teamB?.sportType;
  const fromTeam =
    typeof a === "string" && a.trim() ? a.trim() : typeof b === "string" && b.trim() ? b.trim() : "";
  return fromTeam;
}

export function formatMatchDay(iso) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export function formatMatchTimeRange(startTime, endTime) {
  if (!startTime || !endTime) return "—";
  return `${startTime} – ${endTime}`;
}
