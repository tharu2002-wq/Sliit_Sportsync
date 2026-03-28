import { VENUE_STATUS_OPTIONS } from "../constants/venueStatus";
import { toDateInputValue } from "./eventFormUtils";

/** Re-export for filters (value matches Venue.status). */
export const VENUE_STATUS_FILTER_OPTIONS = VENUE_STATUS_OPTIONS;

export function filterVenues(venues, { searchQuery, status }) {
  const q = searchQuery.trim().toLowerCase();
  return venues.filter((v) => {
    if (status && v.status !== status) return false;
    if (!q) return true;
    const hay = [v.venueName, v.location, String(v.capacity ?? "")]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

/**
 * @param {unknown} dates Venue.availableDates from API
 * @returns {string[]} Unique `YYYY-MM-DD` strings, sorted (for form state).
 */
export function normalizeAvailableDatesFromApi(dates) {
  if (!Array.isArray(dates)) return [];
  const set = new Set();
  for (const d of dates) {
    const ymd = toDateInputValue(d);
    if (ymd) set.add(ymd);
  }
  return Array.from(set).sort();
}

/**
 * @param {string | Date | undefined | null} d
 */
export function formatVenueDateDisplay(d) {
  try {
    return new Date(d).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return String(d ?? "");
  }
}
