/**
 * True when the trimmed value is non-empty and every character is a digit (e.g. "123", "0042").
 */
export function isDigitsOnlyText(value) {
  const t = String(value ?? "").trim();
  if (!t) return false;
  return /^\d+$/.test(t);
}

/** Today's date as `YYYY-MM-DD` in the local calendar (for `<input type="date">` comparison). */
export function getTodayDateInputValue() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * @param {string} value
 * @param {"Title" | "Sport type"} fieldLabel
 * @returns {string | null} Error message or null if valid.
 */
export function getTitleOrSportTypeError(value, fieldLabel) {
  const t = String(value ?? "").trim();
  if (!t) return `${fieldLabel} is required`;
  if (isDigitsOnlyText(t)) return `${fieldLabel} cannot be numbers only`;
  return null;
}
