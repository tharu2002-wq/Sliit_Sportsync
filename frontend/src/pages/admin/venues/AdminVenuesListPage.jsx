import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getEvents } from "../../../api/events";
import { deleteVenue, getVenues } from "../../../api/venues";
import { AdminVenuesTable } from "../../../components/admin/venues/AdminVenuesTable";
import { VenueDetailModal } from "../../../components/admin/venues/VenueDetailModal";
import { ConfirmDialog } from "../../../components/admin/events/ConfirmDialog";
import { Button } from "../../../components/ui/Button";
import { LoadingState } from "../../../components/ui/LoadingSpinner";
import { SearchBar } from "../../../components/ui/SearchBar";
import { SelectFilter } from "../../../components/ui/SelectFilter";
import { VENUE_STATUS_OPTIONS } from "../../../constants/venueStatus";
import { getApiErrorMessage } from "../../../utils/apiError";
import { filterVenues } from "../../../utils/venueUtils";

export default function AdminVenuesListPage() {
  const [venues, setVenues] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [detailVenue, setDetailVenue] = useState(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const [v, ev] = await Promise.all([getVenues(), getEvents()]);
      setVenues(Array.isArray(v) ? v : []);
      setEvents(Array.isArray(ev) ? ev : []);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not load venues or events."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(
    () => filterVenues(venues, { searchQuery, status: statusFilter }),
    [venues, searchQuery, statusFilter]
  );

  const handleDeleteConfirm = async () => {
    if (!deleteTarget?._id) return;
    setDeleteLoading(true);
    try {
      await deleteVenue(deleteTarget._id);
      setDeleteTarget(null);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not delete venue."));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-gray-100 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 md:text-3xl">Venue management</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-600">
            View campus venues, create and update details, and manage booking status and blocked dates. Click a venue
            name to open a summary with scheduling info and upcoming events.
          </p>
        </div>
        <Button to="/admin/venues/new" variant="primary" size="sm" className="shrink-0">
          Create venue
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
            id="admin-venues-search"
            label="Search"
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, location, or capacity…"
          />
        </div>
        <SelectFilter
          id="admin-venues-status"
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          showAllOption
          allLabel="All statuses"
          options={VENUE_STATUS_OPTIONS}
          className="sm:w-48"
        />
      </div>

      <div className="mt-6">
        {loading ? (
          <LoadingState label="Loading venues…" />
        ) : venues.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-12 text-center text-sm text-gray-500">
            No venues yet.{" "}
            <Link to="/admin/venues/new" className="font-semibold text-blue-600 hover:underline">
              Create your first venue
            </Link>
            .
          </p>
        ) : filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-12 text-center text-sm text-gray-500">
            No venues match the current filters. Try clearing search or status.
          </p>
        ) : (
          <AdminVenuesTable
            venues={filtered}
            onDeleteClick={setDeleteTarget}
            onVenueClick={setDetailVenue}
          />
        )}
      </div>

      <VenueDetailModal venue={detailVenue} events={events} onClose={() => setDetailVenue(null)} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this venue?"
        message={
          deleteTarget
            ? `“${deleteTarget.venueName}” will be removed permanently. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete venue"
        cancelLabel="Cancel"
        danger
        loading={deleteLoading}
        onCancel={() => !deleteLoading && setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
