import { formatMatchDay, formatMatchTimeRange, getMatchSportTypeLabel } from "../../../utils/matchUtils";

/**
 * Read-only match context (event, teams, schedule).
 * @param {{ match: Record<string, unknown> | null | undefined }} props
 */
export function MatchResultSummary({ match }) {
  if (!match) {
    return <p className="text-sm text-gray-500">Match details unavailable.</p>;
  }

  const teamA = match.teamA?.teamName ?? "Team A";
  const teamB = match.teamB?.teamName ?? "Team B";
  const eventTitle = match.event?.title ?? "Event";
  const venue = match.venue?.venueName;
  const sportType = getMatchSportTypeLabel(match);

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 sm:p-5">
      {sportType ? (
        <p className="text-xs font-bold uppercase tracking-wide text-blue-700">{sportType}</p>
      ) : null}
      <p className={`text-xs font-bold uppercase tracking-wide text-gray-500 ${sportType ? "mt-1.5" : ""}`}>
        {eventTitle}
      </p>
      <p className="mt-2 text-lg font-black text-gray-900">
        {teamA} <span className="font-bold text-gray-400">vs</span> {teamB}
      </p>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
        <span>{formatMatchDay(match.date)}</span>
        <span>{formatMatchTimeRange(match.startTime, match.endTime)}</span>
        {match.round ? <span className="font-medium">{match.round}</span> : null}
        {venue ? <span>{venue}</span> : null}
      </div>
    </div>
  );
}
