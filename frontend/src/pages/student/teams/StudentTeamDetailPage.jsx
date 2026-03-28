import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import teamPlaceholder from "../../../assets/team.jpg";
import { getMatches } from "../../../api/matches";
import { getTeamById } from "../../../api/teams";
import { DashboardPageHeader } from "../../../components/student-dashboard/DashboardPageHeader";
import { LoadingState } from "../../../components/ui/LoadingSpinner";
import { Button } from "../../../components/ui/Button";
import { getApiErrorMessage } from "../../../utils/apiError";
import { cn } from "../../../utils/cn";
import { formatMatchDay, formatMatchTimeRange, isPastMatch } from "../../../utils/matchUtils";
import { getOpponentName, matchInvolvesTeam } from "../../../utils/teamUtils";

function MatchRows({ matches, teamId, emptyHint }) {
  if (matches.length === 0) {
    return <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-6 text-sm text-gray-500">{emptyHint}</p>;
  }
  return (
    <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white">
      {matches.map((m) => (
        <li key={String(m._id)} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="font-black text-gray-900">
              vs <span className="text-blue-700">{getOpponentName(m, teamId)}</span>
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
          <Button type="button" variant="outline" size="sm" to={`/student/matches/${m._id}`} className="shrink-0 self-start sm:self-center">
            View match
          </Button>
        </li>
      ))}
    </ul>
  );
}

export default function StudentTeamDetailPage() {
  const { teamId } = useParams();
  const [team, setTeam] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!teamId) return;
    let cancelled = false;
    (async () => {
      setError("");
      setLoading(true);
      try {
        const [teamData, matchData] = await Promise.all([getTeamById(teamId), getMatches()]);
        if (!cancelled) {
          setTeam(teamData);
          setMatches(Array.isArray(matchData) ? matchData : []);
        }
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, "Could not load this team."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [teamId]);

  const teamMatches = useMemo(() => {
    if (!teamId) return [];
    return matches.filter((m) => matchInvolvesTeam(m, teamId));
  }, [matches, teamId]);

  const { upcoming, past } = useMemo(() => {
    const u = teamMatches.filter((m) => !isPastMatch(m)).sort((a, b) => {
      const da = new Date(a.date) - new Date(b.date);
      return da !== 0 ? da : String(a.startTime).localeCompare(String(b.startTime));
    });
    const p = teamMatches.filter((m) => isPastMatch(m)).sort((a, b) => {
      const db = new Date(b.date) - new Date(a.date);
      return db !== 0 ? db : String(b.startTime).localeCompare(String(a.startTime));
    });
    return { upcoming: u, past: p };
  }, [teamMatches]);

  if (loading) {
    return (
      <>
        <DashboardPageHeader title="Team" description="Loading…" />
        <LoadingState label="Loading team…" minHeight={false} className="mt-4" />
      </>
    );
  }

  if (error || !team) {
    return (
      <>
        <DashboardPageHeader title="Team" description="We couldn’t open this team." />
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error || "Team not found."}
        </div>
        <Button type="button" variant="outline" className="mt-6" to="/student/teams">
          Back to teams
        </Button>
      </>
    );
  }

  const active = team.isActive !== false;
  const members = Array.isArray(team.members) ? team.members : [];

  return (
    <>
      <div className="mb-6">
        <Button type="button" variant="outline" size="sm" to="/student/teams" className="mb-4">
          ← Back to teams
        </Button>
        <DashboardPageHeader title={team.teamName} description={team.sportType} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm ring-1 ring-gray-100">
        <div className="aspect-[21/9] w-full overflow-hidden bg-gray-100 sm:aspect-[24/9]">
          <img src={teamPlaceholder} alt="" className="h-full w-full object-cover" decoding="async" />
        </div>
        <div className="p-6">
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ring-1",
                active ? "bg-emerald-50 text-emerald-800 ring-emerald-100" : "bg-gray-100 text-gray-600 ring-gray-200"
              )}
            >
              {active ? "Active" : "Inactive"}
            </span>
            <span className="text-sm font-bold text-blue-700">{team.sportType}</span>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Captain</h2>
            {team.captain ? (
              <p className="mt-2 text-base font-semibold text-gray-900">{team.captain.fullName}</p>
            ) : (
              <p className="mt-2 text-sm text-gray-500">No captain assigned.</p>
            )}
            {team.captain?.studentId ? (
              <p className="text-sm text-gray-600">ID: {team.captain.studentId}</p>
            ) : null}
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">
              Team members ({members.length})
            </h2>
            {members.length === 0 ? (
              <p className="mt-3 text-sm text-gray-500">No players on this roster yet.</p>
            ) : (
              <ul className="mt-4 divide-y divide-gray-100 rounded-xl border border-gray-100">
                {members.map((p) => (
                  <li key={String(p._id)} className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-semibold text-gray-900">{p.fullName}</span>
                    <span className="text-sm text-gray-500 sm:text-right">
                      {[p.studentId && `ID: ${p.studentId}`, p.email].filter(Boolean).join(" · ") || "—"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6">
            <h2 className="text-lg font-black tracking-tight text-gray-900">Upcoming matches</h2>
            <p className="mt-1 text-sm text-gray-500">Fixtures where this team is scheduled to play.</p>
            <div className="mt-4">
              <MatchRows
                matches={upcoming}
                teamId={teamId}
                emptyHint="No upcoming matches for this team."
              />
            </div>
          </div>

          <div className="mt-10 border-t border-gray-100 pt-6">
            <h2 className="text-lg font-black tracking-tight text-gray-900">Past matches</h2>
            <p className="mt-1 text-sm text-gray-500">Completed fixtures involving this team.</p>
            <div className="mt-4">
              <MatchRows
                matches={past}
                teamId={teamId}
                emptyHint="No past matches recorded for this team."
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
