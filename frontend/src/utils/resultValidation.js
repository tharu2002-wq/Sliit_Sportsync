/**
 * @param {string} raw
 * @param {string} label e.g. "Score (Team A)"
 * @returns {string | null}
 */
export function getScoreFieldError(raw, label) {
  const s = String(raw ?? "").trim();
  if (s === "") return `${label} is required`;
  const n = Number(s);
  if (!Number.isInteger(n) || Number.isNaN(n)) return `${label} must be a whole number`;
  if (n < 0) return `${label} cannot be negative`;
  if (n > 9999) return `${label} is too large`;
  return null;
}

/**
 * @param {string} raw
 * @returns {string | null}
 */
export function getResultNotesError(raw) {
  const s = String(raw ?? "");
  if (s.length > 2000) return "Notes must be at most 2000 characters";
  return null;
}

const MAX_PLAYER_NOTE = 500;

/**
 * @param {string} raw
 * @returns {string | null}
 */
export function getPlayerNoteError(raw) {
  const s = String(raw ?? "");
  if (s.length > MAX_PLAYER_NOTE) return `Per-player notes must be at most ${MAX_PLAYER_NOTE} characters`;
  return null;
}
