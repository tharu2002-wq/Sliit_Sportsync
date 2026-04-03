/** Convert stored skill tags to a single textarea value (comma / newline separated). */
export function skillsArrayToText(skills) {
  if (!Array.isArray(skills) || skills.length === 0) return "";
  return skills.join(", ");
}

/** Parse textarea into trimmed skill strings for the API. */
export function skillsTextToList(text) {
  return String(text ?? "")
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}
