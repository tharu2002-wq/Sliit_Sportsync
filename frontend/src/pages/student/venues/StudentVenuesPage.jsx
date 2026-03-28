import { useEffect, useMemo, useState } from "react";
import venuePlaceholder from "../../../assets/venues.jpg";
import { getVenues } from "../../../api/venues";
import { VenueCard } from "../../../components/venues/VenueCard";
import { DashboardPageHeader } from "../../../components/student-dashboard/DashboardPageHeader";
import { LoadingState } from "../../../components/ui/LoadingSpinner";
import { SearchBar } from "../../../components/ui/SearchBar";
import { SelectFilter } from "../../../components/ui/SelectFilter";
import { getApiErrorMessage } from "../../../utils/apiError";
import { filterVenues, VENUE_STATUS_FILTER_OPTIONS } from "../../../utils/venueUtils";

function sortByName(a, b) {
  return String(a.venueName).localeCompare(String(b.venueName));
}

function VenueSection({ id, title, venues, emptyHint, imageSrc }) {
  return (
    <section className="mt-10 first:mt-0" aria-labelledby={id}>
      <h2 id={id} className="text-lg font-black tracking-tight text-gray-900">
        {title}
      </h2>
      {venues.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-8 text-center text-sm text-gray-500">
          {emptyHint}
        </p>
      ) : (
        <ul className="mt-4 grid list-none gap-4 p-0 sm:grid-cols-2 xl:grid-cols-3">
          {venues.map((venue) => (
            <li key={String(venue._id)}>
              <VenueCard
                venue={venue}
                imageSrc={imageSrc}
                detailTo={`/student/venues/${venue._id}`}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function StudentVenuesPage() {
  const [rawVenues, setRawVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError("");
      try {
        const data = await getVenues();
        if (!cancelled) setRawVenues(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, "Could not load venues."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () => filterVenues(rawVenues, { searchQuery, status: statusFilter || undefined }),
    [rawVenues, searchQuery, statusFilter]
  );

  const { available, unavailable } = useMemo(() => {
    const a = filtered.filter((v) => v.status !== "unavailable").sort(sortByName);
    const u = filtered.filter((v) => v.status === "unavailable").sort(sortByName);
    return { available: a, unavailable: u };
  }, [filtered]);

  return (
    <>
      <DashboardPageHeader
        title="Venues"
        description="Browse sports and event spaces across the SLIIT campus. Venues are managed by organizers; availability may change for events and maintenance."
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-6">
        <SearchBar
          id="student-venues-search"
          className="flex-1"
          label="Search venues"
          placeholder="Search by name, location, or capacity…"
          value={searchQuery}
          onChange={setSearchQuery}
        />
        <SelectFilter
          id="student-venues-status-filter"
          className="lg:max-w-xs"
          label="Availability"
          options={VENUE_STATUS_FILTER_OPTIONS}
          value={statusFilter}
          onChange={setStatusFilter}
          showAllOption
          allLabel="All venues"
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
        <LoadingState label="Loading venues…" className="mt-8" />
      ) : (
        <>
          <VenueSection
            id="student-venues-available-heading"
            title="Available venues"
            venues={available}
            emptyHint={
              searchQuery.trim() || statusFilter
                ? "No available venues match your search or filter."
                : "No available venues listed yet."
            }
            imageSrc={venuePlaceholder}
          />
          <VenueSection
            id="student-venues-unavailable-heading"
            title="Unavailable venues"
            venues={unavailable}
            emptyHint={
              searchQuery.trim() || statusFilter
                ? "No unavailable venues match your search or filter."
                : "No venues are marked unavailable."
            }
            imageSrc={venuePlaceholder}
          />
        </>
      )}
    </>
  );
}
