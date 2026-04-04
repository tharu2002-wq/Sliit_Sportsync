import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getResultByMatchId } from "../../../api/results";
import { DashboardPageHeader } from "../../../components/student-dashboard/DashboardPageHeader";
import { LoadingState } from "../../../components/ui/LoadingSpinner";
import { Button } from "../../../components/ui/Button";
import { RelatedEventPanel } from "../../../components/matches/RelatedEventPanel";
import { getApiErrorMessage } from "../../../utils/apiError";
import { formatMatchDay, formatMatchTimeRange } from "../../../utils/matchUtils";
import { collectTeamRoster, playerNotesArrayToMap } from "../../../utils/resultRosterUtils";

/**
 * @param {Record<string, unknown> | null | undefined} team
 * @returns {string | null}
 */
function captainIdFromTeam(team) {
  if (!team?.captain) return null;
  const c = team.captain;
  if (typeof c === "object" && c !== null && "_id" in c) return String(c._id);
  return String(c);
}

/**
 * @param {{
 *   teamName: string;
 *   team: Record<string, unknown> | null | undefined;
 *   notesByPlayerId: Record<string, string>;
 * }} props
 */
function TeamPlayersBlock({ teamName, team, notesByPlayerId }) {
  const roster = collectTeamRoster(team);
  const captainId = captainIdFromTeam(team);

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
      <h3 className="text-sm font-black uppercase tracking-wide text-gray-800">{teamName}</h3>
      {roster.length === 0 ? (
        <p className="mt-2 text-sm text-gray-500">No players listed for this squad.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {roster.map((p) => {
            const note = String(notesByPlayerId[p._id] ?? "").trim();
            const isCaptain = captainId === p._id;
            return (
              <li key={p._id} className="border-b border-gray-100/80 pb-3 last:border-0 last:pb-0">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="font-semibold text-gray-900">{p.fullName}</span>
                  {p.studentId ? <span className="text-xs text-gray-500">({p.studentId})</span> : null}
                  {isCaptain ? (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-800">
                      Captain
                    </span>
                  ) : null}
                </div>
                {note ? (
                  <p className="mt-1.5 whitespace-pre-wrap text-sm text-gray-600">{note}</p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

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
  const notesByPlayerId = playerNotesArrayToMap(result.playerNotes);
  const teamARoster = m ? collectTeamRoster(m.teamA) : [];
  const teamBRoster = m ? collectTeamRoster(m.teamB) : [];
  const rosterIdSet = new Set([...teamARoster, ...teamBRoster].map((p) => p._id));
  const orphanPlayerNotes = Array.isArray(result.playerNotes)
    ? result.playerNotes.filter((row) => {
        const noteText = String(row?.note ?? "").trim();
        if (!noteText) return false;
        const pid =
          row.player && typeof row.player === "object" && row.player !== null && "_id" in row.player
            ? String(row.player._id)
            : row.player != null
              ? String(row.player)
              : "";
        return pid && !rosterIdSet.has(pid);
      })
    : [];
  const hasRosterOrNotes =
    Boolean(m) && (teamARoster.length > 0 || teamBRoster.length > 0 || orphanPlayerNotes.length > 0);

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

          {hasRosterOrNotes ? (
            <div className="mt-6 border-t border-gray-100 pt-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Teams and players</h2>
              <p className="mt-1 text-sm text-gray-600">
                Squad lists for each side. Notes from match officials appear under a player when provided.
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <TeamPlayersBlock teamName={teamAName} team={m?.teamA} notesByPlayerId={notesByPlayerId} />
                <TeamPlayersBlock teamName={teamBName} team={m?.teamB} notesByPlayerId={notesByPlayerId} />
              </div>
              {orphanPlayerNotes.length > 0 ? (
                <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50/50 p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-amber-900">Other player notes</h3>
                  <ul className="mt-2 space-y-2 text-sm text-gray-700">
                    {orphanPlayerNotes.map((row) => {
                      const noteText = String(row?.note ?? "").trim();
                      const name =
                        row.player && typeof row.player === "object" && row.player.fullName
                          ? row.player.fullName
                          : "Player";
                      const sid =
                        row.player && typeof row.player === "object" && row.player.studentId
                          ? row.player.studentId
                          : null;
                      const key = String(row.player?._id ?? row.player ?? noteText);
                      return (
                        <li key={key}>
                          <span className="font-semibold text-gray-900">{name}</span>
                          {sid ? <span className="ml-1 text-gray-500">({sid})</span> : null}
                          <p className="mt-0.5 whitespace-pre-wrap text-gray-600">{noteText}</p>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}
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
