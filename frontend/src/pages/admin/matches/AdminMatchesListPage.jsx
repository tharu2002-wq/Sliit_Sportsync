import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { cancelMatch, deleteCancelledMatch, getMatches } from "../../../api/matches";
import { AdminMatchesTable } from "../../../components/admin/matches/AdminMatchesTable";
import { ConfirmDialog } from "../../../components/admin/events/ConfirmDialog";
import { Button } from "../../../components/ui/Button";
import { SearchBar } from "../../../components/ui/SearchBar";
import { SelectFilter } from "../../../components/ui/SelectFilter";
import { LoadingState } from "../../../components/ui/LoadingSpinner";
import { MATCH_STATUS_OPTIONS } from "../../../constants/matchStatus";
import { getApiErrorMessage } from "../../../utils/apiError";

function normalize(s) {
  return String(s ?? "").toLowerCase().trim();
}

function searchBlob(m) {
  const eventTitle = typeof m.event === "object" && m.event?.title ? m.event.title : "";
  const a = typeof m.teamA === "object" && m.teamA?.teamName ? m.teamA.teamName : "";
  const b = typeof m.teamB === "object" && m.teamB?.teamName ? m.teamB.teamName : "";
  const v = typeof m.venue === "object" && m.venue?.venueName ? m.venue.venueName : "";
  const r = m.round ?? "";
  return [eventTitle, a, b, v, r].map(normalize).join(" ");
}

function matchSummaryLabel(m) {
  const ev = typeof m.event === "object" && m.event?.title ? m.event.title : "This match";
  const a = typeof m.teamA === "object" && m.teamA?.teamName ? m.teamA.teamName : "Team A";
  const b = typeof m.teamB === "object" && m.teamB?.teamName ? m.teamB.teamName : "Team B";
  return `${ev} (${a} vs ${b})`;
}

export default function AdminMatchesListPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const data = await getMatches();
      setMatches(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not load matches."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = normalize(searchQuery);
    return matches.filter((m) => {
      if (statusFilter && m.status !== statusFilter) return false;
      if (!q) return true;
      return searchBlob(m).includes(q);
    });
  }, [matches, searchQuery, statusFilter]);

  const handleCancelConfirm = async () => {
    if (!cancelTarget?._id) return;
    setCancelLoading(true);
    try {
      await cancelMatch(cancelTarget._id);
      setCancelTarget(null);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not cancel match."));
    } finally {
      setCancelLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget?._id) return;
    setDeleteLoading(true);
    try {
      await deleteCancelledMatch(deleteTarget._id);
      setDeleteTarget(null);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not delete match."));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-gray-100 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 md:text-3xl">Match management</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-600">
            Schedule matches under events, assign two teams and a venue, and set date and time. Teams must belong to the
            event when the event has assigned teams.
          </p>
        </div>
        <Button to="/admin/matches/new" variant="primary" size="sm" className="shrink-0">
          Create match
        </Button>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <SearchBar
            id="admin-matches-search"
            label="Search"
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by event, team, venue, round…"
          />
        </div>
        <SelectFilter
          id="admin-matches-status"
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          showAllOption
          allLabel="All statuses"
          options={MATCH_STATUS_OPTIONS}
          className="sm:w-48"
        />
      </div>

      <div className="mt-6">
        {loading ? (
          <LoadingState label="Loading matches…" />
        ) : matches.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-12 text-center text-sm text-gray-500">
            No matches yet.{" "}
            <Link to="/admin/matches/new" className="font-semibold text-blue-600 hover:underline">
              Create a match
            </Link>{" "}
            under an event.
          </p>
        ) : filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-12 text-center text-sm text-gray-500">
            No matches match the current filters. Try clearing search or status.
          </p>
        ) : (
          <AdminMatchesTable
            matches={filtered}
            onCancelClick={setCancelTarget}
            onDeleteClick={setDeleteTarget}
          />
        )}
      </div>

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        title="Cancel this match?"
        message={
          cancelTarget
            ? `This match will be marked cancelled. You can still view and edit it later if needed.`
            : ""
        }
        confirmLabel="Cancel match"
        cancelLabel="Keep"
        danger
        loading={cancelLoading}
        onCancel={() => !cancelLoading && setCancelTarget(null)}
        onConfirm={handleCancelConfirm}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this match?"
        message={
          deleteTarget
            ? `“${matchSummaryLabel(deleteTarget)}” will be permanently removed, including any result. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Keep"
        danger
        loading={deleteLoading}
        onCancel={() => !deleteLoading && setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
