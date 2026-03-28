import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getMatches } from "../../../api/matches";
import { deleteResult, getResults } from "../../../api/results";
import { AdminPendingMatchesTable } from "../../../components/admin/results/AdminPendingMatchesTable";
import { AdminResultsTable } from "../../../components/admin/results/AdminResultsTable";
import { ConfirmDialog } from "../../../components/admin/events/ConfirmDialog";
import { Button } from "../../../components/ui/Button";
import { LoadingState } from "../../../components/ui/LoadingSpinner";
import { SearchBar } from "../../../components/ui/SearchBar";
import { getApiErrorMessage } from "../../../utils/apiError";
import { filterResults, matchesAwaitingResult } from "../../../utils/resultDisplayUtils";

export default function AdminResultsListPage() {
  const [results, setResults] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const [r, m] = await Promise.all([getResults(), getMatches()]);
      setResults(Array.isArray(r) ? r : []);
      setMatches(Array.isArray(m) ? m : []);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not load results or matches."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const pendingMatches = useMemo(() => {
    const pending = matchesAwaitingResult(matches, results);
    return [...pending].sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return da - db;
    });
  }, [matches, results]);

  const filteredResults = useMemo(() => filterResults(results, searchQuery), [results, searchQuery]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget?._id) return;
    setDeleteLoading(true);
    try {
      await deleteResult(deleteTarget._id);
      setDeleteTarget(null);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not delete result."));
    } finally {
      setDeleteLoading(false);
    }
  };

  const deleteMessage = deleteTarget
    ? `Remove the recorded score (${deleteTarget.scoreA} – ${deleteTarget.scoreB}) for “${
        deleteTarget.match?.teamA?.teamName ?? "Team A"
      } vs ${deleteTarget.match?.teamB?.teamName ?? "Team B"}”? The match status may return to scheduled if it was completed only because of this result.`
    : "";

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-gray-100 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 md:text-3xl">Result management</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-600">
            View recorded scores, enter results for matches without one, and edit or remove entries. The server sets
            the winner automatically from scores (draw when tied).
          </p>
        </div>
        <Button to="/admin/results/new" variant="primary" size="sm" className="shrink-0">
          Record result
        </Button>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <section className="mt-8">
        <h2 className="text-lg font-black tracking-tight text-gray-900">Matches awaiting a result</h2>
        <p className="mt-1 text-sm text-gray-600">
          Non-cancelled matches that do not have a score yet. Recording a result marks the match completed.
        </p>
        <div className="mt-4">
          {loading ? (
            <LoadingState label="Loading…" />
          ) : (
            <AdminPendingMatchesTable matches={pendingMatches} />
          )}
        </div>
      </section>

      <section className="mt-12">
        <div className="flex flex-col gap-4 border-b border-gray-100 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-lg font-black tracking-tight text-gray-900">Recorded results</h2>
          <div className="min-w-0 sm:max-w-md sm:flex-1">
            <SearchBar
              id="admin-results-search"
              label="Search"
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by event, teams, venue, or score…"
            />
          </div>
        </div>
        <div className="mt-6">
          {loading ? (
            <LoadingState label="Loading results…" />
          ) : results.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-12 text-center text-sm text-gray-500">
              No results recorded yet. Use{" "}
              <Link to="/admin/results/new" className="font-semibold text-blue-600 hover:underline">
                Record result
              </Link>{" "}
              or pending matches above.
            </p>
          ) : (
            <AdminResultsTable results={filteredResults} onDeleteClick={setDeleteTarget} />
          )}
        </div>
      </section>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this result?"
        message={deleteMessage}
        confirmLabel="Delete result"
        cancelLabel="Cancel"
        danger
        loading={deleteLoading}
        onCancel={() => !deleteLoading && setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
