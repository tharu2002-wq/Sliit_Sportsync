import { Button } from "../ui/Button";
import { cn } from "../../utils/cn";
import { formatEventDateRange } from "../../utils/eventUtils";

const STATUS_STYLES = {
  upcoming: "bg-blue-50 text-blue-800 ring-blue-100",
  ongoing: "bg-emerald-50 text-emerald-800 ring-emerald-100",
  completed: "bg-gray-100 text-gray-700 ring-gray-200",
  cancelled: "bg-red-50 text-red-700 ring-red-100",
};

function StatusBadge({ status }) {
  const s = status ?? "upcoming";
  const label = s.charAt(0).toUpperCase() + s.slice(1);
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ring-1",
        STATUS_STYLES[s] ?? STATUS_STYLES.upcoming
      )}
    >
      {label}
    </span>
  );
}

/**
 * Event summary card with image, meta, and link to detail route.
 */
export function EventCard({ event, imageSrc, detailTo, className }) {
  const venueName = event.venue?.venueName ?? event.venue?.location ?? "Venue TBA";
  const rawDesc = event.description?.trim() ?? "";
  const summary =
    rawDesc.length > 140 ? `${rawDesc.slice(0, 140)}…` : rawDesc || "No description yet.";

  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm ring-1 ring-gray-100 transition-shadow hover:shadow-md",
        className
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
        <img
          src={imageSrc}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute left-3 top-3">
          <StatusBadge status={event.status} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-lg font-black leading-tight tracking-tight text-gray-900">{event.title}</h3>
        </div>
        <p className="mb-1 text-xs font-bold uppercase tracking-wide text-blue-700">{event.sportType}</p>
        <p className="mb-2 text-sm text-gray-600">{formatEventDateRange(event.startDate, event.endDate)}</p>
        <p className="mb-1 line-clamp-2 flex-1 text-sm text-gray-500">{summary}</p>
        <p className="mb-4 text-xs text-gray-400">
          <span className="font-semibold text-gray-500">Venue:</span> {venueName}
        </p>
        <Button type="button" variant="outline" size="sm" fullWidth to={detailTo} className="mt-auto">
          View event details
        </Button>
      </div>
    </article>
  );
}
