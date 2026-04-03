/**
 * Dropdown options for student profile (edit form). Values are stored as-is on the user record.
 * If a saved value is not listed here, the edit form still shows it as an extra option.
 */

export const ACADEMIC_YEAR_OPTIONS = [
  { value: "Year 1", label: "Year 1" },
  { value: "Year 2", label: "Year 2" },
  { value: "Year 3", label: "Year 3" },
  { value: "Year 4", label: "Year 4" },
  { value: "Foundation", label: "Foundation" },
  { value: "Postgraduate", label: "Postgraduate" },
];

/** SLIIT faculties commonly used in campus systems (adjust as needed). */
/** Ages 17–60 for profile dropdown (optional field). */
export const PROFILE_AGE_OPTIONS = Array.from({ length: 44 }, (_, i) => {
  const n = 17 + i;
  const s = String(n);
  return { value: s, label: s };
});

export const FACULTY_OPTIONS = [
  { value: "Faculty of Computing", label: "Faculty of Computing" },
  { value: "Faculty of Business", label: "Faculty of Business" },
  { value: "Faculty of Humanities and Sciences", label: "Faculty of Humanities and Sciences" },
  { value: "Faculty of Engineering", label: "Faculty of Engineering" },
  { value: "Faculty of Architecture", label: "Faculty of Architecture" },
  { value: "Faculty of Graduate Studies and Research", label: "Faculty of Graduate Studies and Research" },
];

/**
 * Ensures the current saved value appears in the dropdown if it was entered before these lists existed.
 */
export function optionsWithLegacyIfNeeded(options, currentValue) {
  const v = (currentValue ?? "").trim();
  if (!v) return options;
  if (options.some((o) => o.value === v)) return options;
  return [...options, { value: v, label: v }];
}
