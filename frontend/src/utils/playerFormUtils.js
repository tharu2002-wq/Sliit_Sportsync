/**
 * @param {string} raw Comma-separated sports from the form
 * @returns {string[]}
 */
export function parseSportTypesInput(raw) {
  return String(raw ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * @param {unknown} arr
 * @returns {string} Comma-separated for a single text field
 */
export function formatSportTypesForInput(arr) {
  if (!Array.isArray(arr)) return "";
  return arr.filter(Boolean).join(", ");
}
