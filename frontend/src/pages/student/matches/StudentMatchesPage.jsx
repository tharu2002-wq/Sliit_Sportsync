import { useEffect, useMemo, useState } from "react";
import matchPlaceholder from "../../../assets/event.jpg";
import { getMatches } from "../../../api/matches";
import { MatchCard } from "../../../components/matches/MatchCard";
import { DashboardPageHeader } from "../../../components/student-dashboard/DashboardPageHeader";
import { LoadingState } from "../../../components/ui/LoadingSpinner";
import { SearchBar } from "../../../components/ui/SearchBar";
import { SelectFilter } from "../../../components/ui/SelectFilter";
import { getApiErrorMessage } from "../../../utils/apiError";
import {
  collectMatchSportTypes,
  filterMatches,
  isPastMatch,
} from "../../../utils/matchUtils";

function sortUpcoming(a, b) {
  const da = new Date(a.date);
  const db = new Date(b.date);
  if (da.getTime() !== db.getTime()) return da - db;
  return String(a.startTime).localeCompare(String(b.startTime));
}

function sortPast(a, b) {
  const da = new Date(a.date);
  const db = new Date(b.date);
  if (db.getTime() !== da.getTime()) return db - da;
  return String(b.startTime).localeCompare(String(a.startTime));
}

function MatchSection({ id, title, matches, emptyHint, imageSrc, actionLabel, buildActionTo }) {
  return (
    <section className="mt-10 first:mt-0" aria-labelledby={id}>
      <h2 id={id} className="text-lg font-black tracking-tight text-gray-900">
        {title}
      </h2>
      {matches.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-8 text-center text-sm text-gray-500">
          {emptyHint}
        </p>
      ) : (
        <ul className="mt-4 grid list-none gap-4 p-0 sm:grid-cols-2 xl:grid-cols-3">
          {matches.map((match) => (
            <li key={String(match._id)}>
              <MatchCard
                match={match}
                imageSrc={imageSrc}
                actionLabel={actionLabel}
                actionTo={buildActionTo(String(match._id))}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function StudentMatchesPage() {
  const [rawMatches, setRawMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sportType, setSportType] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError("");
      try {
        const data = await getMatches();
        if (!cancelled) setRawMatches(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, "Could not load matches."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const sportOptions = useMemo(() => collectMatchSportTypes(rawMatches), [rawMatches]);

  const filtered = useMemo(
    () => filterMatches(rawMatches, { searchQuery, sportType }),
    [rawMatches, searchQuery, sportType]
  );

  const { upcoming, past } = useMemo(() => {
    const u = filtered.filter((m) => !isPastMatch(m)).sort(sortUpcoming);
    const p = filtered.filter((m) => isPastMatch(m)).sort(sortPast);
    return { upcoming: u, past: p };
  }, [filtered]);

  return (
    <>
      <DashboardPageHeader
        title="Matches"
        description="Fixtures and results across SLIIT sports. Upcoming matches show full details; completed matches link to results."
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-6">
        <SearchBar
          id="student-matches-search"
          className="flex-1"
          label="Search matches"
          placeholder="Search by event, team, or venue…"
          value={searchQuery}
          onChange={setSearchQuery}
        />
        <SelectFilter
          id="student-matches-sport-filter"
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
        <LoadingState label="Loading matches…" className="mt-8" />
      ) : (
        <>
          <MatchSection
            id="student-matches-upcoming-heading"
            title="Upcoming matches"
            matches={upcoming}
            emptyHint={
              searchQuery.trim() || sportType
                ? "No upcoming matches match your search or filter."
                : "No upcoming matches scheduled."
            }
            imageSrc={matchPlaceholder}
            actionLabel="View match details"
            buildActionTo={(id) => `/student/matches/${id}`}
          />
          <MatchSection
            id="student-matches-past-heading"
            title="Past matches"
            matches={past}
            emptyHint={
              searchQuery.trim() || sportType
                ? "No past matches match your search or filter."
                : "No past matches to show yet."
            }
            imageSrc={matchPlaceholder}
            actionLabel="Match result"
            buildActionTo={(id) => `/student/matches/${id}/result`}
          />
        </>
      )}
    </>
  );
}
