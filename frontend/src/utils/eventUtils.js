/** Start of local calendar day. */
export function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Whole calendar days from today (local) until `dateValue` (start of that day). Can be negative if the date is in the past. */
export function daysUntilCalendarDate(dateValue) {
  if (!dateValue) return null;
  const today = startOfToday();
  const target = new Date(dateValue);
  if (Number.isNaN(target.getTime())) return null;
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

/** Past events: ended before today, or marked completed (still ongoing cancelled events stay in upcoming). */
export function isPastEvent(event) {
  if (!event?.endDate) return false;
  const end = new Date(event.endDate);
  end.setHours(0, 0, 0, 0);
  if (end < startOfToday()) return true;
  if (event.status === "completed") return true;
  return false;
}

export function collectSportTypes(events) {
  const set = new Set();
  for (const e of events) {
    if (e?.sportType?.trim()) set.add(e.sportType.trim());
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function filterEvents(events, { searchQuery, sportType }) {
  const q = searchQuery.trim().toLowerCase();
  return events.filter((e) => {
    if (sportType && e.sportType !== sportType) return false;
    if (q && !String(e.title ?? "").toLowerCase().includes(q)) return false;
    return true;
  });
}

export function formatEventDateRange(startIso, endIso) {
  try {
    const s = new Date(startIso);
    const e = new Date(endIso);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return "—";
    const opts = { month: "short", day: "numeric", year: "numeric" };
    const a = s.toLocaleDateString(undefined, opts);
    const b = e.toLocaleDateString(undefined, opts);
    return a === b ? a : `${a} – ${b}`;
  } catch {
    return "—";
  }
}

export function formatEventDateTime(iso) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}
