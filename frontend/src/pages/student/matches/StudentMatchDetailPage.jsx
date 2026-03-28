import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import matchPlaceholder from "../../../assets/event.jpg";
import { getMatchById } from "../../../api/matches";
import { DashboardPageHeader } from "../../../components/student-dashboard/DashboardPageHeader";
import { LoadingState } from "../../../components/ui/LoadingSpinner";
import { Button } from "../../../components/ui/Button";
import { getApiErrorMessage } from "../../../utils/apiError";
import { cn } from "../../../utils/cn";
import { RelatedEventPanel } from "../../../components/matches/RelatedEventPanel";
import { formatMatchDay, formatMatchTimeRange, isPastMatch } from "../../../utils/matchUtils";

const MATCH_STATUS_STYLES = {
  scheduled: "bg-blue-50 text-blue-800 ring-blue-100",
  completed: "bg-gray-100 text-gray-700 ring-gray-200",
  cancelled: "bg-red-50 text-red-700 ring-red-100",
};

export default function StudentMatchDetailPage() {
  const { matchId } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!matchId) return;
    let cancelled = false;
    (async () => {
      setError("");
      setLoading(true);
      try {
        const data = await getMatchById(matchId);
        if (!cancelled) setMatch(data);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, "Could not load this match."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [matchId]);

  if (loading) {
    return (
      <>
        <DashboardPageHeader title="Match" description="Loading…" />
        <LoadingState label="Loading match…" minHeight={false} className="mt-4" />
      </>
    );
  }

  if (error || !match) {
    return (
      <>
        <DashboardPageHeader title="Match" description="We couldn’t open this fixture." />
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error || "Match not found."}
        </div>
        <Button type="button" variant="outline" className="mt-6" to="/student/matches">
          Back to matches
        </Button>
      </>
    );
  }

  const status = match.status ?? "scheduled";
  const past = isPastMatch(match);
  const eventTitle = match.event?.title ?? "Event";
  const teamA = match.teamA?.teamName ?? "Team A";
  const teamB = match.teamB?.teamName ?? "Team B";
  const venueName = match.venue?.venueName ?? "—";
  const venueLoc = match.venue?.location ?? "";

  return (
    <>
      <div className="mb-6">
        <Button type="button" variant="outline" size="sm" to="/student/matches" className="mb-4">
          ← Back to matches
        </Button>
        <DashboardPageHeader
          title={`${teamA} vs ${teamB}`}
          description={eventTitle}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm ring-1 ring-gray-100">
        <div className="aspect-[21/9] w-full overflow-hidden bg-gray-100 sm:aspect-[24/9]">
          <img
            src={matchPlaceholder}
            alt=""
            className="h-full w-full object-cover"
            decoding="async"
          />
        </div>
        <div className="p-6">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ring-1",
                MATCH_STATUS_STYLES[status] ?? MATCH_STATUS_STYLES.scheduled
              )}
            >
              {String(status).charAt(0).toUpperCase() + String(status).slice(1)}
            </span>
          </div>

          {match.event ? (
            <RelatedEventPanel event={match.event} showTitle className="mb-6" />
          ) : null}

          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Date</dt>
              <dd className="font-semibold text-gray-900">{formatMatchDay(match.date)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Time</dt>
              <dd className="font-semibold text-gray-900">
                {formatMatchTimeRange(match.startTime, match.endTime)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Round</dt>
              <dd className="font-semibold text-gray-900">{match.round ?? "—"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Venue</dt>
              <dd className="font-semibold text-gray-900">
                {venueName}
                {venueLoc ? (
                  <span className="mt-0.5 block text-sm font-normal text-gray-600">{venueLoc}</span>
                ) : null}
              </dd>
            </div>
          </dl>

          {match.notes?.trim() ? (
            <div className="mt-6 border-t border-gray-100 pt-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Notes</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                {match.notes.trim()}
              </p>
            </div>
          ) : null}

          {past ? (
            <div className="mt-6 border-t border-gray-100 pt-6">
              <Button type="button" variant="primary" size="sm" to={`/student/matches/${matchId}/result`}>
                View match result
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
