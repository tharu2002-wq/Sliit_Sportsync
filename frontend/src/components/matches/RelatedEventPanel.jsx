import { Link } from "react-router-dom";
import { formatEventDateRange } from "../../utils/eventUtils";
import { cn } from "../../utils/cn";

const EVENT_STATUS_STYLES = {
  upcoming: "bg-blue-50 text-blue-800 ring-blue-100",
  ongoing: "bg-emerald-50 text-emerald-800 ring-emerald-100",
  completed: "bg-gray-100 text-gray-700 ring-gray-200",
  cancelled: "bg-red-50 text-red-700 ring-red-100",
};

function EventStatusBadge({ status }) {
  const s = status ?? "upcoming";
  const label = s.charAt(0).toUpperCase() + s.slice(1);
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1",
        EVENT_STATUS_STYLES[s] ?? EVENT_STATUS_STYLES.upcoming
      )}
    >
      {label}
    </span>
  );
}

/**
 * Shows populated parent event fields (period, status, description) and link to student event page.
 */
export function RelatedEventPanel({
  event,
  /** Shorter copy and line-clamped description (cards). */
  compact = false,
  /** Show event title inside the panel (detail / result pages). */
  showTitle = false,
  /** When `showTitle` is true, hide sport line (e.g. if sport is already shown above). */
  showSportInPanel = true,
  className,
}) {
  if (!event?.title) return null;

  const id = event._id != null ? String(event._id) : null;
  const desc = event.description?.trim() ?? "";
  const range =
    event.startDate && event.endDate
      ? formatEventDateRange(event.startDate, event.endDate)
      : "—";

  return (
    <div
      className={cn(
        "rounded-xl border border-blue-100 bg-blue-50/60 p-4",
        compact && "p-3",
        className
      )}
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-blue-800/90">Related event</p>
      {showTitle ? (
        <h3 className={cn("mt-1 font-black tracking-tight text-gray-900", compact ? "text-base" : "text-lg")}>
          {event.title}
        </h3>
      ) : null}
      {showTitle && showSportInPanel && event.sportType ? (
        <p className="mt-0.5 text-xs font-bold uppercase tracking-wide text-blue-700">{event.sportType}</p>
      ) : null}

      <div className={cn("mt-2 flex flex-wrap items-center gap-2", showTitle && "mt-3")}>
        <span className="text-xs text-gray-600">
          <span className="font-semibold text-gray-500">Event runs:</span> {range}
        </span>
        {event.status ? <EventStatusBadge status={event.status} /> : null}
      </div>

      {desc ? (
        <p
          className={cn(
            "mt-2 text-sm leading-relaxed text-gray-700",
            compact && "line-clamp-2"
          )}
        >
          {desc}
        </p>
      ) : (
        !compact ? (
          <p className="mt-2 text-sm text-gray-500">No event description.</p>
        ) : null
      )}

      {id ? (
        <p className="mt-3">
          <Link
            to={`/student/events/${id}`}
            className="text-sm font-semibold text-blue-600 underline-offset-2 hover:text-blue-700 hover:underline"
          >
            View full event
          </Link>
        </p>
      ) : null}
    </div>
  );
}
