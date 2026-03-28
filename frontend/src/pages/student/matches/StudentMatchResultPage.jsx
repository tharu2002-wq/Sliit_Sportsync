import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getResultByMatchId } from "../../../api/results";
import { DashboardPageHeader } from "../../../components/student-dashboard/DashboardPageHeader";
import { LoadingState } from "../../../components/ui/LoadingSpinner";
import { Button } from "../../../components/ui/Button";
import { RelatedEventPanel } from "../../../components/matches/RelatedEventPanel";
import { getApiErrorMessage } from "../../../utils/apiError";
import { formatMatchDay, formatMatchTimeRange } from "../../../utils/matchUtils";

export default function StudentMatchResultPage() {
  const { matchId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!matchId) return;
    let cancelled = false;
    (async () => {
      setError("");
      setLoading(true);
      try {
        const data = await getResultByMatchId(matchId);
        if (!cancelled) setResult(data);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, "Could not load the result."));
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
        <DashboardPageHeader title="Match result" description="Loading…" />
        <LoadingState label="Loading result…" minHeight={false} className="mt-4" />
      </>
    );
  }

  if (error || !result) {
    return (
      <>
        <DashboardPageHeader title="Match result" description="Result not available." />
        <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="status">
          {error || "No result has been recorded for this match yet."}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button type="button" variant="outline" size="sm" to={`/student/matches/${matchId}`}>
            Match details
          </Button>
          <Button type="button" variant="outline" size="sm" to="/student/matches">
            All matches
          </Button>
        </div>
      </>
    );
  }

  const m = result.match;
  const teamAName = m?.teamA?.teamName ?? "Team A";
  const teamBName = m?.teamB?.teamName ?? "Team B";
  const winnerName = result.winner?.teamName;
  const eventTitle = m?.event?.title ?? "Match";

  return (
    <>
      <div className="mb-6">
        <Button type="button" variant="outline" size="sm" to="/student/matches" className="mb-4">
          ← Back to matches
        </Button>
        <DashboardPageHeader title="Match result" description={eventTitle} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm ring-1 ring-gray-100">
        <div className="border-b border-gray-100 bg-gradient-to-br from-blue-50/80 to-white px-6 py-8">
          <p className="text-center text-sm font-bold uppercase tracking-wide text-blue-700">
            {m?.event?.sportType ?? ""}
          </p>
          <p className="mt-2 text-center text-xl font-black leading-snug text-gray-900 sm:text-2xl">
            {teamAName}{" "}
            <span className="text-blue-700">{result.scoreA}</span>
            <span className="mx-2 font-bold text-gray-400">–</span>
            <span className="text-blue-700">{result.scoreB}</span> {teamBName}
          </p>
          {winnerName ? (
            <p className="mt-4 text-center text-sm font-semibold text-emerald-700">
              Winner: <span className="font-black">{winnerName}</span>
            </p>
          ) : (
            <p className="mt-4 text-center text-sm font-medium text-gray-500">Draw or winner not set</p>
          )}
        </div>

        <div className="p-6">
          {m?.event ? (
            <RelatedEventPanel
              event={m.event}
              showTitle
              showSportInPanel={false}
              className="mb-6"
            />
          ) : null}
          {m ? (
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Played</dt>
                <dd className="font-semibold text-gray-900">{formatMatchDay(m.date)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Time</dt>
                <dd className="font-semibold text-gray-900">
                  {formatMatchTimeRange(m.startTime, m.endTime)}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Venue</dt>
                <dd className="font-semibold text-gray-900">
                  {m.venue?.venueName ?? "—"}
                  {m.venue?.location ? (
                    <span className="mt-0.5 block text-sm font-normal text-gray-600">{m.venue.location}</span>
                  ) : null}
                </dd>
              </div>
            </dl>
          ) : null}

          {result.notes?.trim() ? (
            <div className="mt-6 border-t border-gray-100 pt-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Result notes</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{result.notes.trim()}</p>
            </div>
          ) : null}

          <p className="mt-6 text-xs text-gray-400">
            <Link to={`/student/matches/${matchId}`} className="font-semibold text-blue-600 hover:text-blue-700">
              Open match details
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
