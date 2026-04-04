import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { deletePlayer, getPlayers } from "../../../api/players";
import { AdminPlayersTable } from "../../../components/admin/players/AdminPlayersTable";
import { Button } from "../../../components/ui/Button";
import { SearchBar } from "../../../components/ui/SearchBar";
import { LoadingState } from "../../../components/ui/LoadingSpinner";
import { getApiErrorMessage } from "../../../utils/apiError";

function normalize(s) {
  return String(s ?? "").toLowerCase().trim();
}

export default function AdminPlayersListPage() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removeError, setRemoveError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const data = await getPlayers();
      setPlayers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not load players."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = normalize(searchQuery);
    if (!q) return players;
    return players.filter((p) => {
      const teamNames = Array.isArray(p.teams)
        ? p.teams.map((t) => (typeof t === "object" && t?.teamName ? t.teamName : "")).join(" ")
        : "";
      const legacyTeam =
        typeof p.team === "object" && p.team?.teamName ? p.team.teamName : "";
      const sports = Array.isArray(p.sportTypes) ? p.sportTypes.join(" ") : "";
      const blob = [p.fullName, p.studentId, p.email, p.department, teamNames, legacyTeam, sports]
        .map(normalize)
        .join(" ");
      return blob.includes(q);
    });
  }, [players, searchQuery]);

  const handleRemovePlayer = async (id, fullName) => {
    const ok = window.confirm(
      `Remove player "${fullName}"? They will be removed from team rosters and event participant lists. This cannot be undone.`
    );
    if (!ok) return;

    setRemoveError("");
    setDeletingId(id);
    try {
      await deletePlayer(id);
      setPlayers((prev) => prev.filter((p) => String(p._id) !== id));
    } catch (err) {
      setRemoveError(getApiErrorMessage(err, "Could not remove player."));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-gray-100 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 md:text-3xl">Player management</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-600">
            View all registered players, add new profiles, and update their information.
          </p>
        </div>
        <Button to="/admin/players/new" variant="primary" size="sm" className="shrink-0">
          Create player
        </Button>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {removeError ? (
        <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {removeError}
        </p>
      ) : null}

      <div className="mt-6">
        <SearchBar
          id="admin-players-search"
          label="Search"
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, ID, email, faculty, team, or sports…"
        />
      </div>

      <div className="mt-6">
        {loading ? (
          <LoadingState label="Loading players…" />
        ) : players.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-12 text-center text-sm text-gray-500">
            No players yet.{" "}
            <Link to="/admin/players/new" className="font-semibold text-blue-600 hover:underline">
              Create a player
            </Link>
            .
          </p>
        ) : filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-12 text-center text-sm text-gray-500">
            No players match the current search.
          </p>
        ) : (
          <AdminPlayersTable
            players={filtered}
            deletingId={deletingId}
            onDeletePlayer={handleRemovePlayer}
          />
        )}
      </div>
    </div>
  );
}
