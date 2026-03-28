const ALLOWED_STATUS = new Set(["available", "unavailable"]);

/**
 * @returns {string | null}
 */
export function getVenueNameError(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return "Venue name is required";
  if (s.length < 2) return "Venue name must be at least 2 characters";
  if (s.length > 120) return "Venue name must be at most 120 characters";
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
