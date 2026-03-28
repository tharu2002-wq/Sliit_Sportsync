/** Matches backend `Player.gender` enum */
export const PLAYER_GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export function getGenderLabel(value) {
  const row = PLAYER_GENDER_OPTIONS.find((o) => o.value === value);
  return row?.label ?? value ?? "—";
}
