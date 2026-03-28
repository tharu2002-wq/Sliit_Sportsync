/** Matches backend `Match.status` enum */
export const MATCH_STATUS_VALUES = ["scheduled", "completed", "cancelled"];

export const MATCH_STATUS_OPTIONS = [
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function getMatchStatusLabel(value) {
  const row = MATCH_STATUS_OPTIONS.find((o) => o.value === value);
  return row?.label ?? value ?? "—";
}
