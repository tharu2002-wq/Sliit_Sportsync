import { getEventStatusLabel } from "../../../constants/eventStatus";
import { cn } from "../../../utils/cn";

const STYLES = {
  upcoming: "bg-amber-50 text-amber-800 ring-amber-200",
  ongoing: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  completed: "bg-slate-100 text-slate-700 ring-slate-200",
  cancelled: "bg-red-50 text-red-700 ring-red-200",
};

export function EventStatusBadge({ status, className }) {
  const key = status && STYLES[status] ? status : "upcoming";
  const label = getEventStatusLabel(status);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset",
        STYLES[key],
        className
      )}
    >
      {label}
    </span>
  );
}
