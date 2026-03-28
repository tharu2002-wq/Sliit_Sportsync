import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import playerPlaceholder from "../../../assets/player.jpg";
import { getMatches } from "../../../api/matches";
import { getPlayerById } from "../../../api/players";
import { getTeams } from "../../../api/teams";
import { DashboardPageHeader } from "../../../components/student-dashboard/DashboardPageHeader";
import { LoadingState } from "../../../components/ui/LoadingSpinner";
import { Button } from "../../../components/ui/Button";
import { getApiErrorMessage } from "../../../utils/apiError";
import { formatEventDateRange } from "../../../utils/eventUtils";
import { formatMatchDay, formatMatchTimeRange, isPastMatch } from "../../../utils/matchUtils";
import { formatGender, teamsForPlayer } from "../../../utils/playerUtils";
import { getOpponentNameForPlayerTeams } from "../../../utils/teamUtils";

function MatchRows({ matches, teamIds, emptyHint }) {
  if (matches.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-6 text-sm text-gray-500">
        {emptyHint}
      </p>
    );
  }
  return (
    <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white">
      {matches.map((m) => (
        <li key={String(m._id)} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="font-black text-gray-900">
              vs <span className="text-blue-700">{getOpponentNameForPlayerTeams(m, teamIds)}</span>
            </p>
            <p className="mt-1 text-sm text-gray-600">
              {formatMatchDay(m.date)} · {formatMatchTimeRange(m.startTime, m.endTime)}
            </p>
            {m.event?.title ? (
              <p className="mt-0.5 text-xs font-medium text-gray-400">{m.event.title}</p>
            ) : null}
            {m.venue?.venueName ? (
              <p className="mt-1 text-xs text-gray-500">{m.venue.venueName}</p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            to={`/student/matches/${m._id}`}
            className="shrink-0 self-start sm:self-center"
          >
            View match
          </Button>
        </li>
      ))}
    </ul>
  );
}

export default function StudentPlayerDetailPage() {
  const { playerId } = useParams();
  const [player, setPlayer] = useState(null);
  const [allTeams, setAllTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!playerId) return;
    let cancelled = false;
    (async () => {
      setError("");
      setLoading(true);
      try {
        const [playerData, teamsData, matchData] = await Promise.all([
          getPlayerById(playerId),
          getTeams(),
          getMatches(),
        ]);
        if (!cancelled) {
          setPlayer(playerData);
          setAllTeams(Array.isArray(teamsData) ? teamsData : []);
          setMatches(Array.isArray(matchData) ? matchData : []);
        }
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, "Could not load this player."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [playerId]);

  const teamsContributed = useMemo(() => {
    if (!player) return [];
    return teamsForPlayer(allTeams, player);
  }, [allTeams, player]);

  const teamIdsForMatches = useMemo(() => new Set(teamsContributed.map((t) => String(t._id))), [teamsContributed]);

  const playerMatches = useMemo(() => {
    return matches.filter((m) => {
      const a = String(m.teamA?._id ?? m.teamA ?? "");
      const b = String(m.teamB?._id ?? m.teamB ?? "");
      return teamIdsForMatches.has(a) || teamIdsForMatches.has(b);
    });
  }, [matches, teamIdsForMatches]);

  const { upcoming, past } = useMemo(() => {
    const u = playerMatches.filter((m) => !isPastMatch(m)).sort((a, b) => {
      const da = new Date(a.date) - new Date(b.date);
      return da !== 0 ? da : String(a.startTime).localeCompare(String(b.startTime));
    });
    const p = playerMatches.filter((m) => isPastMatch(m)).sort((a, b) => {
      const db = new Date(b.date) - new Date(a.date);
      return db !== 0 ? db : String(b.startTime).localeCompare(String(a.startTime));
    });
    return { upcoming: u, past: p };
  }, [playerMatches]);

  if (loading) {
    return (
      <>
        <DashboardPageHeader title="Player" description="Loading…" />
        <LoadingState label="Loading player…" minHeight={false} className="mt-4" />
      </>
    );
  }

  if (error || !player) {
    return (
      <>
        <DashboardPageHeader title="Player" description="We couldn’t open this profile." />
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error || "Player not found."}
        </div>
        <Button type="button" variant="outline" className="mt-6" to="/student/players">
          Back to players
        </Button>
      </>
    );
  }

  const sports = Array.isArray(player.sportTypes) ? player.sportTypes.filter(Boolean) : [];
  const events = Array.isArray(player.participationHistory) ? player.participationHistory : [];

  return (
    <>
      <div className="mb-6">
        <Button type="button" variant="outline" size="sm" to="/student/players" className="mb-4">
          ← Back to players
        </Button>
        <DashboardPageHeader title={player.fullName} description={player.department} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm ring-1 ring-gray-100">
        <div className="aspect-[21/9] w-full overflow-hidden bg-gray-100 sm:aspect-[24/9]">
          <img src={playerPlaceholder} alt="" className="h-full w-full object-cover" decoding="async" />
        </div>
        <div className="p-6">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Student ID</dt>
              <dd className="font-semibold text-gray-900">{player.studentId}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Email</dt>
              <dd className="break-all font-semibold text-gray-900">{player.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Age</dt>
              <dd className="font-semibold text-gray-900">{player.age ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Gender</dt>
              <dd className="font-semibold text-gray-900">{formatGender(player.gender)}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Sports</dt>
              <dd className="font-semibold text-gray-900">
                {sports.length > 0 ? sports.join(", ") : "—"}
              </dd>
            </div>
          </dl>

          <div className="mt-8 border-t border-gray-100 pt-6">
            <h2 className="text-lg font-black tracking-tight text-gray-900">Teams</h2>
            <p className="mt-1 text-sm text-gray-500">Squads this player is on (including primary assignment).</p>
            {teamsContributed.length === 0 ? (
              <p className="mt-3 text-sm text-gray-500">Not listed on any team roster yet.</p>
            ) : (
              <ul className="mt-4 divide-y divide-gray-100 rounded-xl border border-gray-100">
                {teamsContributed.map((t) => (
                  <li
                    key={String(t._id)}
                    className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-bold text-gray-900">{t.teamName}</p>
                      <p className="text-sm text-blue-700">{t.sportType}</p>
                    </div>
                    <Button type="button" variant="outline" size="sm" to={`/student/teams/${t._id}`}>
                      View team
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6">
            <h2 className="text-lg font-black tracking-tight text-gray-900">Event participation</h2>
            <p className="mt-1 text-sm text-gray-500">Events linked to this athlete profile.</p>
            {events.length === 0 ? (
              <p className="mt-3 text-sm text-gray-500">No events in participation history.</p>
            ) : (
              <ul className="mt-4 divide-y divide-gray-100 rounded-xl border border-gray-100">
                {events.map((ev) => (
                  <li key={String(ev._id)} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-bold text-gray-900">{ev.title}</p>
                      <p className="text-sm text-gray-600">
                        {ev.startDate && ev.endDate
                          ? formatEventDateRange(ev.startDate, ev.endDate)
                          : "—"}
                        {ev.sportType ? (
                          <span className="ml-2 text-xs font-semibold uppercase text-blue-700">
                            {ev.sportType}
                          </span>
                        ) : null}
                      </p>
                      {ev.status ? (
                        <p className="text-xs font-medium uppercase text-gray-400">{ev.status}</p>
                      ) : null}
                    </div>
                    <Button type="button" variant="outline" size="sm" to={`/student/events/${ev._id}`}>
                      View event
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6">
            <h2 className="text-lg font-black tracking-tight text-gray-900">Upcoming matches</h2>
            <p className="mt-1 text-sm text-gray-500">Fixtures for this player&apos;s teams.</p>
            <div className="mt-4">
              <MatchRows
                matches={upcoming}
                teamIds={teamIdsForMatches}
                emptyHint="No upcoming matches for these teams."
              />
            </div>
          </div>

          <div className="mt-10 border-t border-gray-100 pt-6">
            <h2 className="text-lg font-black tracking-tight text-gray-900">Past matches</h2>
            <p className="mt-1 text-sm text-gray-500">Completed fixtures involving those teams.</p>
            <div className="mt-4">
              <MatchRows
                matches={past}
                teamIds={teamIdsForMatches}
                emptyHint="No past matches found for these teams."
              />
            </div>
          </div>

          <p className="mt-8 text-xs text-gray-400">
            <Link to="/student/matches" className="font-semibold text-blue-600 hover:text-blue-700">
              Browse all matches
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
