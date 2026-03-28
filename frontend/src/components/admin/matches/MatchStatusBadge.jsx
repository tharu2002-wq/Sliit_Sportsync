import { getMatchStatusLabel } from "../../../constants/matchStatus";
import { cn } from "../../../utils/cn";

const STYLES = {
  scheduled: "bg-sky-50 text-sky-800 ring-sky-200",
  completed: "bg-slate-100 text-slate-700 ring-slate-200",
  cancelled: "bg-red-50 text-red-700 ring-red-200",
};

export function MatchStatusBadge({ status, className }) {
  const key = status && STYLES[status] ? status : "scheduled";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        STYLES[key],
        className
      )}
    >
      {getMatchStatusLabel(status)}
    </span>
  );
}
