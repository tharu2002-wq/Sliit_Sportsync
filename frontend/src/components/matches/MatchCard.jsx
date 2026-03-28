import { Button } from "../ui/Button";
import { RelatedEventPanel } from "./RelatedEventPanel";
import { cn } from "../../utils/cn";
import { formatMatchDay, formatMatchTimeRange } from "../../utils/matchUtils";

const MATCH_STATUS_STYLES = {
  scheduled: "bg-blue-50 text-blue-800 ring-blue-100",
  completed: "bg-gray-100 text-gray-700 ring-gray-200",
  cancelled: "bg-red-50 text-red-700 ring-red-100",
};

function MatchStatusBadge({ status }) {
  const s = status ?? "scheduled";
  const label = s.charAt(0).toUpperCase() + s.slice(1);
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ring-1",
        MATCH_STATUS_STYLES[s] ?? MATCH_STATUS_STYLES.scheduled
      )}
    >
      {label}
    </span>
  );
}

/**
 * Match summary card: image, teams, schedule, venue, primary action (details or result).
 */
export function MatchCard({ match, imageSrc, actionLabel, actionTo, className }) {
  const eventTitle = match.event?.title ?? "Event";
  const sport = match.event?.sportType ?? match.teamA?.sportType ?? "—";
  const teamA = match.teamA?.teamName ?? "Team A";
  const teamB = match.teamB?.teamName ?? "Team B";
  const venueName = match.venue?.venueName ?? match.venue?.location ?? "Venue TBA";
  const notes = match.notes?.trim();

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
          <MatchStatusBadge status={match.status} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="mb-1 text-xs font-bold uppercase tracking-wide text-blue-700">{sport}</p>
        <h3 className="text-base font-black leading-tight tracking-tight text-gray-900">{eventTitle}</h3>
        {match.event ? <RelatedEventPanel event={match.event} compact className="mt-3" /> : null}
        <p className="mt-3 text-lg font-black text-gray-900">
          <span className="text-blue-700">{teamA}</span>
          <span className="mx-1.5 font-bold text-gray-400">vs</span>
          <span className="text-blue-700">{teamB}</span>
        </p>
        <p className="mt-2 text-sm text-gray-600">{formatMatchDay(match.date)}</p>
        <p className="text-sm text-gray-500">{formatMatchTimeRange(match.startTime, match.endTime)}</p>
        {match.round ? (
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-gray-400">{match.round}</p>
        ) : null}
        {notes ? (
          <p className="mt-2 line-clamp-2 flex-1 text-xs text-gray-500">
            <span className="font-semibold text-gray-600">Match note:</span> {notes}
          </p>
        ) : (
          <div className="flex-1" />
        )}
        <p className="mb-4 mt-2 text-xs text-gray-400">
          <span className="font-semibold text-gray-500">Venue:</span> {venueName}
        </p>
        <Button type="button" variant="outline" size="sm" fullWidth to={actionTo} className="mt-auto">
          {actionLabel}
        </Button>
      </div>
    </article>
  );
}
