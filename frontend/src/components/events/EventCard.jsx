import { Button } from "../ui/Button";
import { cn } from "../../utils/cn";
import { getEventCardImageForSport } from "../../utils/eventCardImages";
import { formatEventDateRange } from "../../utils/eventUtils";

const STATUS_STYLES = {
  upcoming: "bg-blue-50 text-blue-800 ring-blue-100",
  ongoing: "bg-emerald-50 text-emerald-800 ring-emerald-100",
  completed: "bg-gray-100 text-gray-700 ring-gray-200",
  cancelled: "bg-red-50 text-red-700 ring-red-100",
};

function HappeningNowSign() {
  return (
    <div className="event-happening-now max-w-[min(100%,14rem)] shrink-0" role="status" aria-label="This event is happening now">
      <span className="event-happening-now-dot" aria-hidden />
      <span className="event-happening-now-text whitespace-nowrap">Happening now</span>
    </div>
  );
}

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

function countdownHighlightClass(days) {
  if (days === 0) {
    return "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/30 ring-2 ring-rose-400/60";
  }
  if (days <= 3) {
    return "bg-gradient-to-r from-amber-400 to-orange-400 text-amber-950 shadow-md shadow-amber-400/35 ring-2 ring-amber-300/80";
  }
  return "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-sky-300/70";
}

function CountdownLine({ days }) {
  if (days === null || days === undefined || Number.isNaN(days) || days < 0) return null;
  let text;
  if (days === 0) {
    text = "Starts today";
  } else if (days === 1) {
    text = "Starts in 1 day";
  } else {
    text = `Starts in ${days} days`;
  }
  return (
    <p
      className={cn(
        "mb-2 inline-flex w-fit max-w-full rounded-xl px-3 py-1.5 text-sm font-black tabular-nums tracking-tight",
        countdownHighlightClass(days)
      )}
      aria-live="polite"
    >
      {text}
    </p>
  );
}

/**
 * Event summary card with image, meta, and link to detail route.
 *
 * @param {{ imageSrc?: string, ongoingLive?: boolean, countdownDays?: number | null }} props
 */
export function EventCard({ event, imageSrc, detailTo, className, ongoingLive = false, countdownDays = null }) {
  const coverSrc = imageSrc ?? getEventCardImageForSport(event.sportType);
  const venueName = event.venue?.venueName ?? event.venue?.location ?? "Venue TBA";
  const rawDesc = event.description?.trim() ?? "";
  const summary =
    rawDesc.length > 140 ? `${rawDesc.slice(0, 140)}…` : rawDesc || "No description yet.";
  const showCountdown = countdownDays !== null && countdownDays !== undefined;

  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm ring-1 ring-gray-100 transition-shadow hover:shadow-md",
        ongoingLive && "event-card-ongoing-live border-emerald-400/80 ring-2 ring-emerald-400/40",
        className
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
        <img
          src={coverSrc}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <StatusBadge status={event.status} />
          {ongoingLive ? <HappeningNowSign /> : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-lg font-black leading-tight tracking-tight text-gray-900">{event.title}</h3>
        </div>
        <p className="mb-1 text-xs font-bold uppercase tracking-wide text-blue-700">{event.sportType}</p>
        {showCountdown ? <CountdownLine days={countdownDays} /> : null}
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
