import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { cancelEvent, deleteCancelledEvent, getEvents } from "../../../api/events";
import { AdminEventsTable } from "../../../components/admin/events/AdminEventsTable";
import { ConfirmDialog } from "../../../components/admin/events/ConfirmDialog";
import { Button } from "../../../components/ui/Button";
import { SearchBar } from "../../../components/ui/SearchBar";
import { SelectFilter } from "../../../components/ui/SelectFilter";
import { LoadingState } from "../../../components/ui/LoadingSpinner";
import { EVENT_STATUS_OPTIONS } from "../../../constants/eventStatus";
import { getApiErrorMessage } from "../../../utils/apiError";

function normalize(s) {
  return String(s ?? "").toLowerCase().trim();
}

export default function AdminEventsListPage() {
  const [events, setEvents] = useState([]);
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
      const data = await getEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not load events."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = normalize(searchQuery);
    return events.filter((ev) => {
      if (statusFilter && ev.status !== statusFilter) return false;
      if (!q) return true;
      const blob = [ev.title, ev.sportType, ev.description].map(normalize).join(" ");
      return blob.includes(q);
    });
  }, [events, searchQuery, statusFilter]);

  const handleCancelConfirm = async () => {
    if (!cancelTarget?._id) return;
    setCancelLoading(true);
    try {
      await cancelEvent(cancelTarget._id);
      setCancelTarget(null);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not cancel event."));
    } finally {
      setCancelLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget?._id) return;
    setDeleteLoading(true);
    try {
      await deleteCancelledEvent(deleteTarget._id);
      setDeleteTarget(null);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not delete event."));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-gray-100 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 md:text-3xl">Event management</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-600">
            View, create, and update events. Assign venues and teams from records you have already created.
          </p>
        </div>
        <Button to="/admin/events/new" variant="primary" size="sm" className="shrink-0">
          Create event
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
            id="admin-events-search"
            label="Search"
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by title, sport, or description…"
          />
        </div>
        <SelectFilter
          id="admin-events-status"
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          showAllOption
          allLabel="All statuses"
          options={EVENT_STATUS_OPTIONS}
          className="sm:w-48"
        />
      </div>

      <div className="mt-6">
        {loading ? (
          <LoadingState label="Loading events…" />
        ) : events.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-12 text-center text-sm text-gray-500">
            No events yet.{" "}
            <Link to="/admin/events/new" className="font-semibold text-blue-600 hover:underline">
              Create your first event
            </Link>
            .
          </p>
        ) : filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-12 text-center text-sm text-gray-500">
            No events match the current filters. Try clearing search or status.
          </p>
        ) : (
          <AdminEventsTable
            events={filtered}
            onCancelClick={setCancelTarget}
            onDeleteClick={setDeleteTarget}
          />
        )}
      </div>

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        title="Cancel this event?"
        message={
          cancelTarget
            ? `“${cancelTarget.title}” will be marked as cancelled. You can still view it in the list.`
            : ""
        }
        confirmLabel="Cancel event"
        cancelLabel="Keep"
        danger
        loading={cancelLoading}
        onCancel={() => !cancelLoading && setCancelTarget(null)}
        onConfirm={handleCancelConfirm}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this event?"
        message={
          deleteTarget
            ? `“${deleteTarget.title}” will be permanently removed, including its matches and results. This cannot be undone.`
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
