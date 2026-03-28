import { useEffect, useMemo, useState } from "react";
import teamPlaceholder from "../../../assets/team.jpg";
import { getTeams } from "../../../api/teams";
import { TeamCard } from "../../../components/teams/TeamCard";
import { DashboardPageHeader } from "../../../components/student-dashboard/DashboardPageHeader";
import { LoadingState } from "../../../components/ui/LoadingSpinner";
import { SearchBar } from "../../../components/ui/SearchBar";
import { SelectFilter } from "../../../components/ui/SelectFilter";
import { getApiErrorMessage } from "../../../utils/apiError";
import { collectTeamSportTypes, filterTeams } from "../../../utils/teamUtils";

function sortByName(a, b) {
  return String(a.teamName).localeCompare(String(b.teamName));
}

function TeamSection({ id, title, teams, emptyHint, imageSrc }) {
  return (
    <section className="mt-10 first:mt-0" aria-labelledby={id}>
      <h2 id={id} className="text-lg font-black tracking-tight text-gray-900">
        {title}
      </h2>
      {teams.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-8 text-center text-sm text-gray-500">
          {emptyHint}
        </p>
      ) : (
        <ul className="mt-4 grid list-none gap-4 p-0 sm:grid-cols-2 xl:grid-cols-3">
          {teams.map((team) => (
            <li key={String(team._id)}>
              <TeamCard
                team={team}
                imageSrc={imageSrc}
                detailTo={`/student/teams/${team._id}`}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function StudentTeamsPage() {
  const [rawTeams, setRawTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sportType, setSportType] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError("");
      try {
        const data = await getTeams();
        if (!cancelled) setRawTeams(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, "Could not load teams."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const sportOptions = useMemo(() => collectTeamSportTypes(rawTeams), [rawTeams]);

  const filtered = useMemo(
    () => filterTeams(rawTeams, { searchQuery, sportType }),
    [rawTeams, searchQuery, sportType]
  );

  const { active, inactive } = useMemo(() => {
    const a = filtered.filter((t) => t.isActive !== false).sort(sortByName);
    const i = filtered.filter((t) => t.isActive === false).sort(sortByName);
    return { active: a, inactive: i };
  }, [filtered]);

  return (
    <>
      <DashboardPageHeader
        title="Teams"
        description="Browse SLIIT sports teams, rosters, and fixtures. Active teams are competing; inactive teams are archived."
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-6">
        <SearchBar
          id="student-teams-search"
          className="flex-1"
          label="Search teams"
          placeholder="Search by team name, captain, or player…"
          value={searchQuery}
          onChange={setSearchQuery}
        />
        <SelectFilter
          id="student-teams-sport-filter"
          className="lg:max-w-xs"
          label="Sport type"
          options={sportOptions}
          value={sportType}
          onChange={setSportType}
          showAllOption
          allLabel="All sports"
        />
      </div>

      {error ? (
        <div
          className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {loading ? (
        <LoadingState label="Loading teams…" className="mt-8" />
      ) : (
        <>
          <TeamSection
            id="student-teams-active-heading"
            title="Active teams"
            teams={active}
            emptyHint={
              searchQuery.trim() || sportType
                ? "No active teams match your search or filter."
                : "No active teams yet."
            }
            imageSrc={teamPlaceholder}
          />
          <TeamSection
            id="student-teams-inactive-heading"
            title="Inactive teams"
            teams={inactive}
            emptyHint={
              searchQuery.trim() || sportType
                ? "No inactive teams match your search or filter."
                : "No inactive teams."
            }
            imageSrc={teamPlaceholder}
          />
        </>
      )}
    </>
  );
}
