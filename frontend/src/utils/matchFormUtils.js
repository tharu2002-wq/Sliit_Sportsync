import { refToId, toDateInputValue } from "./eventFormUtils";

export { toDateInputValue };

/**
 * Teams that can play in a match for this event: event-assigned teams if any, otherwise all teams.
 * @param {object | null} selectedEvent
 * @param {object[]} allTeams
 */
export function getTeamsForEvent(selectedEvent, allTeams) {
  if (!selectedEvent || !Array.isArray(allTeams)) return [];
  const assigned = selectedEvent.teams;
  if (!assigned || assigned.length === 0) return allTeams;
  const allowedIds = new Set(assigned.map((t) => refToId(t)));
  return allTeams.filter((team) => allowedIds.has(String(team._id)));
}

/** @param {string} startTime "HH:mm"
 * @param {string} endTime "HH:mm"
 */
export function isEndTimeAfterStart(startTime, endTime) {
  if (!startTime || !endTime) return false;
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return false;
  return eh * 60 + em > sh * 60 + sm;
}

/**
 * @param {object} event with startDate, endDate
 * @param {string} dateStr YYYY-MM-DD
 */
export function isDateWithinEventRange(event, dateStr) {
  if (!event || !dateStr) return false;
  const min = toDateInputValue(event.startDate);
  const max = toDateInputValue(event.endDate);
  return dateStr >= min && dateStr <= max;
}
