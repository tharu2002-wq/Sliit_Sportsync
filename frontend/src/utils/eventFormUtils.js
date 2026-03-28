/**
 * Value for `<input type="date">` (local calendar YYYY-MM-DD).
 * Uses local date parts — not `toISOString()` — so single-day events keep the same min/max
 * and do not shift a day in non-UTC timezones.
 * Plain `YYYY-MM-DD` strings are returned as-is.
 *
 * @param {string | Date | undefined | null} iso
 */
export function toDateInputValue(iso) {
  if (iso == null || iso === "") return "";
  const s = String(iso).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return s;
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** @param {unknown} ref */
export function refToId(ref) {
  if (ref == null) return "";
  if (typeof ref === "string") return ref;
  if (typeof ref === "object" && ref !== null && "_id" in ref) {
    return String(/** @type {{ _id: string }} */ (ref)._id);
  }
  return String(ref);
}

/** @param {unknown[]} refs */
export function refsToIds(refs) {
  if (!Array.isArray(refs)) return [];
  return refs.map((r) => refToId(r)).filter(Boolean);
}
