/** Matches backend `Event.status` enum */
export const EVENT_STATUS_VALUES = ["upcoming", "ongoing", "completed", "cancelled"];

export const EVENT_STATUS_OPTIONS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function getEventStatusLabel(value) {
  const row = EVENT_STATUS_OPTIONS.find((o) => o.value === value);
  return row?.label ?? value ?? "—";
}
