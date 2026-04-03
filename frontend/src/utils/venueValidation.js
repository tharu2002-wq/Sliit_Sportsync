const ALLOWED_STATUS = new Set(["available", "unavailable"]);

/** True when the string is non-empty and every character is an ASCII digit (0–9). */
function isDigitsOnly(s) {
  return s.length > 0 && /^[0-9]+$/.test(s);
}

/**
 * @returns {string | null}
 */
export function getVenueNameError(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return "Venue name is required";
  if (s.length < 2) return "Venue name must be at least 2 characters";
  if (s.length > 120) return "Venue name must be at most 120 characters";
  if (isDigitsOnly(s)) return "Venue name cannot be numbers only";
  return null;
}

/**
 * @returns {string | null}
 */
export function getVenueLocationError(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return "Location is required";
  if (s.length < 2) return "Location must be at least 2 characters";
  if (s.length > 200) return "Location must be at most 200 characters";
  if (isDigitsOnly(s)) return "Location cannot be numbers only";
  return null;
}

/**
 * @returns {string | null}
 */
export function getVenueCapacityError(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return "Capacity is required";
  const n = Number(s);
  if (!Number.isInteger(n) || Number.isNaN(n)) return "Enter a whole number";
  if (n < 1) return "Capacity must be at least 1";
  if (n > 1_000_000) return "Capacity is too large";
  return null;
}

/**
 * @returns {string | null}
 */
export function getVenueStatusError(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return "Status is required";
  if (!ALLOWED_STATUS.has(s)) return "Select a valid status";
  return null;
}

/**
 * @param {unknown} sports Selected sport labels from the venue form.
 * @returns {string | null}
 */
export function getVenueSportsError(sports) {
  const nonEmpty = Array.isArray(sports)
    ? sports.map((s) => String(s).trim()).filter(Boolean)
    : [];
  if (nonEmpty.length === 0) return "Select at least one sport";
  return null;
}
