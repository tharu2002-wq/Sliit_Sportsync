import { VENUE_STATUS_OPTIONS } from "../constants/venueStatus";
import { refToId, toDateInputValue } from "./eventFormUtils";

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
 * @param {unknown} dates Venue.unavailableDates from API
 * @returns {string[]} Unique `YYYY-MM-DD` strings, sorted (for form state).
 */
export function normalizeUnavailableDatesFromApi(dates) {
  if (!Array.isArray(dates)) return [];
  const set = new Set();
  for (const d of dates) {
    const ymd = toDateInputValue(d);
    if (ymd) set.add(ymd);
  }
  return Array.from(set).sort();
}

/**
 * Empty `sports` on a venue means any sport is allowed.
 * @param {unknown} venue
 * @param {string} sportType
 */
export function venueSupportsSport(venue, sportType) {
  const list = venue?.sports;
  if (!Array.isArray(list) || list.length === 0) return true;
  const s = String(sportType ?? "").trim().toLowerCase();
  if (!s) return true;
  return list.some((x) => String(x).trim().toLowerCase() === s);
}

/**
 * @param {unknown} venue
 * @param {string} startYmd `YYYY-MM-DD`
 * @param {string} endYmd `YYYY-MM-DD`
 */
export function venueAllowsDateRange(venue, startYmd, endYmd) {
  const blocked = new Set(normalizeUnavailableDatesFromApi(venue?.unavailableDates));
  if (blocked.size === 0 || !startYmd || !endYmd) return true;
  const cur = new Date(`${startYmd}T12:00:00`);
  const end = new Date(`${endYmd}T12:00:00`);
  if (Number.isNaN(cur.getTime()) || Number.isNaN(end.getTime())) return true;
  for (; cur.getTime() <= end.getTime(); cur.setDate(cur.getDate() + 1)) {
    const ymd = toDateInputValue(cur);
    if (ymd && blocked.has(ymd)) return false;
  }
  return true;
}

/**
 * @param {unknown} venue
 * @param {string} ymd `YYYY-MM-DD`
 */
export function venueAllowsSingleDate(venue, ymd) {
  return venueAllowsDateRange(venue, ymd, ymd);
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

/**
 * Events at this venue that are still active on the calendar (not completed/cancelled) and end on or after today.
 * @param {unknown[]} events From GET /events (populated venue ok).
 * @param {string | undefined} venueId
 */
/**
 * Whether another upcoming/ongoing event already reserves this venue on overlapping calendar days.
 * @param {unknown[]} events
 * @param {{ venueId: string; startYmd: string; endYmd: string; excludeEventId?: string }} args
 */
export function venueHasOverlappingEventBooking(events, { venueId, startYmd, endYmd, excludeEventId }) {
  if (!Array.isArray(events) || !venueId || !startYmd || !endYmd) return false;
  const vid = String(venueId);
  const parseDay = (ymd) => {
    const d = new Date(`${ymd}T12:00:00`);
    if (Number.isNaN(d.getTime())) return null;
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };
  const newStart = parseDay(startYmd);
  const newEnd = parseDay(endYmd);
  if (newStart == null || newEnd == null) return false;

  for (const e of events) {
    if (excludeEventId && String(e?._id) === String(excludeEventId)) continue;
    const st = e?.status;
    if (st !== "upcoming" && st !== "ongoing") continue;
    if (refToId(e?.venue) !== vid) continue;
    const a = toDateInputValue(e?.startDate);
    const b = toDateInputValue(e?.endDate);
    if (!a || !b) continue;
    const es = parseDay(a);
    const en = parseDay(b);
    if (es == null || en == null) continue;
    if (newStart <= en && es <= newEnd) return true;
  }
  return false;
}

export function getUpcomingEventsAtVenue(events, venueId) {
  if (!Array.isArray(events) || venueId == null || venueId === "") return [];
  const id = String(venueId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return events
    .filter((e) => {
      const vid = refToId(e?.venue);
      if (vid !== id) return false;
      const st = e?.status;
      if (st === "cancelled" || st === "completed") return false;
      const end = new Date(e?.endDate);
      if (Number.isNaN(end.getTime())) return false;
      end.setHours(0, 0, 0, 0);
      return end >= today;
    })
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
}
