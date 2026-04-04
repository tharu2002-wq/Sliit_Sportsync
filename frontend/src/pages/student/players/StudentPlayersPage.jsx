import { useEffect, useMemo, useState } from "react";
import playerPlaceholder from "../../../assets/player.jpg";
import { getPlayers } from "../../../api/players";
import { PlayerCard } from "../../../components/players/PlayerCard";
import { DashboardPageHeader } from "../../../components/student-dashboard/DashboardPageHeader";
import { LoadingState } from "../../../components/ui/LoadingSpinner";
import { SearchBar } from "../../../components/ui/SearchBar";
import { SelectFilter } from "../../../components/ui/SelectFilter";
import { getApiErrorMessage } from "../../../utils/apiError";
import { collectPlayerSportTypes, filterPlayers } from "../../../utils/playerUtils";

function sortByName(a, b) {
  return String(a.fullName).localeCompare(String(b.fullName));
}

export default function StudentPlayersPage() {
  const [rawPlayers, setRawPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sportType, setSportType] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError("");
      try {
        const data = await getPlayers();
        if (!cancelled) setRawPlayers(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, "Could not load players."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const sportOptions = useMemo(() => collectPlayerSportTypes(rawPlayers), [rawPlayers]);

  const players = useMemo(() => {
    const list = filterPlayers(rawPlayers, { searchQuery, sportType });
    return [...list].sort(sortByName);
  }, [rawPlayers, searchQuery, sportType]);

  return (
    <>
      <DashboardPageHeader
        title="Players"
        description="Browse SLIIT sports athletes—search by name or filter by sport."
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-6">
        <SearchBar
          id="student-players-search"
          className="flex-1"
          label="Search players"
          placeholder="Search by name, student ID, email, or faculty…"
          value={searchQuery}
          onChange={setSearchQuery}
        />
        <SelectFilter
          id="student-players-sport-filter"
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
        <LoadingState label="Loading players…" className="mt-8" />
      ) : players.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-8 text-center text-sm text-gray-500">
          {searchQuery.trim() || sportType
            ? "No players match your search or filter."
            : "No players yet."}
        </p>
      ) : (
        <ul className="mt-8 grid list-none gap-4 p-0 sm:grid-cols-2 xl:grid-cols-3">
          {players.map((player) => (
            <li key={String(player._id)}>
              <PlayerCard
                player={player}
                imageSrc={playerPlaceholder}
                detailTo={`/student/players/${player._id}`}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
