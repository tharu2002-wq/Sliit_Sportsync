import { cn } from "../../../utils/cn";

export function VenueStatusBadge({ status }) {
  const available = status === "available";
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ring-1",
        available
          ? "bg-emerald-50 text-emerald-800 ring-emerald-100"
          : "bg-amber-50 text-amber-800 ring-amber-100"
      )}
    >
      {available ? "Available" : "Unavailable"}
    </span>
  );
}
