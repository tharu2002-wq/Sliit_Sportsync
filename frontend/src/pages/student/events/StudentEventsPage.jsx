import { useEffect, useMemo, useState } from "react";
import eventPlaceholder from "../../../assets/event.jpg";
import { getEvents } from "../../../api/events";
import { EventCard } from "../../../components/events/EventCard";
import { DashboardPageHeader } from "../../../components/student-dashboard/DashboardPageHeader";
import { LoadingState } from "../../../components/ui/LoadingSpinner";
import { SearchBar } from "../../../components/ui/SearchBar";
import { SelectFilter } from "../../../components/ui/SelectFilter";
import { getApiErrorMessage } from "../../../utils/apiError";
import { collectSportTypes, filterEvents, isPastEvent } from "../../../utils/eventUtils";

function sortUpcoming(a, b) {
  return new Date(a.startDate) - new Date(b.startDate);
}

function sortPast(a, b) {
  return new Date(b.endDate) - new Date(a.endDate);
}

function EventSection({ id, title, events, emptyHint, imageSrc }) {
  return (
    <section className="mt-10 first:mt-0" aria-labelledby={id}>
      <h2 id={id} className="text-lg font-black tracking-tight text-gray-900">
        {title}
      </h2>
      {events.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-8 text-center text-sm text-gray-500">
          {emptyHint}
        </p>
      ) : (
        <ul className="mt-4 grid list-none gap-4 p-0 sm:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <li key={event._id}>
              <EventCard
                event={event}
                imageSrc={imageSrc}
                detailTo={`/student/events/${event._id}`}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function StudentEventsPage() {
  const [rawEvents, setRawEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sportType, setSportType] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError("");
      try {
        const data = await getEvents();
        if (!cancelled) setRawEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, "Could not load events."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const sportOptions = useMemo(() => collectSportTypes(rawEvents), [rawEvents]);

  const filtered = useMemo(
    () => filterEvents(rawEvents, { searchQuery, sportType }),
    [rawEvents, searchQuery, sportType]
  );

  const { upcoming, past } = useMemo(() => {
    const u = filtered.filter((e) => !isPastEvent(e)).sort(sortUpcoming);
    const p = filtered.filter((e) => isPastEvent(e)).sort(sortPast);
    return { upcoming: u, past: p };
  }, [filtered]);

  return (
    <>
      <DashboardPageHeader
        title="Events"
        description="Browse and register for campus sports events. Upcoming events are listed first; past events are kept for reference."
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-6">
        <SearchBar
          id="student-events-search"
          className="flex-1"
          label="Search events"
          placeholder="Search by event title…"
          value={searchQuery}
          onChange={setSearchQuery}
        />
        <SelectFilter
          id="student-events-sport-filter"
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
        <LoadingState label="Loading events…" className="mt-8" />
      ) : (
        <>
          <EventSection
            id="student-events-upcoming-heading"
            title="Upcoming events"
            events={upcoming}
            emptyHint={
              searchQuery.trim() || sportType
                ? "No upcoming events match your search or filter."
                : "No upcoming events right now. Check back later."
            }
            imageSrc={eventPlaceholder}
          />
          <EventSection
            id="student-events-past-heading"
            title="Past events"
            events={past}
            emptyHint={
              searchQuery.trim() || sportType
                ? "No past events match your search or filter."
                : "No past events to show yet."
            }
            imageSrc={eventPlaceholder}
          />
        </>
      )}
    </>
  );
}
