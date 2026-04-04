/** Start of local calendar day (matches eventController.normalizeDate). */
function normalizeDay(dateValue) {
  const d = new Date(dateValue);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * @param {{ sports?: string[] }} venue
 * @param {string} sportType
 * @returns {string | null} Error message or null if allowed.
 */
function venueSportError(venue, sportType) {
  const list = venue.sports;
  if (!Array.isArray(list) || list.length === 0) return null;
  const s = String(sportType ?? "").trim().toLowerCase();
  if (!s) return "Sport type is required for this venue";
  const ok = list.some((x) => String(x).trim().toLowerCase() === s);
  return ok ? null : `This venue only supports: ${list.join(", ")}`;
}

/**
 * @param {{ unavailableDates?: Date[] }} venue
 * @param {Date} rangeStart normalized start day
 * @param {Date} rangeEnd normalized end day
 * @returns {string | null}
 */
function venueUnavailableRangeError(venue, rangeStart, rangeEnd) {
  const blocked = venue.unavailableDates;
  if (!Array.isArray(blocked) || blocked.length === 0) return null;

  const blockedSet = new Set(blocked.map((x) => normalizeDay(x)));

  const cur = new Date(rangeStart);
  cur.setHours(0, 0, 0, 0);
  const end = new Date(rangeEnd);
  end.setHours(0, 0, 0, 0);

  while (cur.getTime() <= end.getTime()) {
    if (blockedSet.has(cur.getTime())) {
      return "The venue is marked unavailable on one or more dates in this range";
    }
    cur.setDate(cur.getDate() + 1);
  }
  return null;
}

module.exports = {
  venueSportError,
  venueUnavailableRangeError,
};
