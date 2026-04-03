import { useEffect, useMemo, useState } from "react";
import { getEvents } from "../../../api/events";
import { EventCard } from "../../../components/events/EventCard";
import { DashboardPageHeader } from "../../../components/student-dashboard/DashboardPageHeader";
import { LoadingState } from "../../../components/ui/LoadingSpinner";
import { SearchBar } from "../../../components/ui/SearchBar";
import { SelectFilter } from "../../../components/ui/SelectFilter";
import { getApiErrorMessage } from "../../../utils/apiError";
import { collectSportTypes, daysUntilCalendarDate, filterEvents, isPastEvent } from "../../../utils/eventUtils";

function sortUpcoming(a, b) {
  return new Date(a.startDate) - new Date(b.startDate);
}

function sortPast(a, b) {
  return new Date(b.endDate) - new Date(a.endDate);
}

function EventSection({ id, title, events, emptyHint, ongoingLive = false, showCountdown = false }) {
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
                detailTo={`/student/events/${event._id}`}
                ongoingLive={ongoingLive}
                countdownDays={showCountdown ? daysUntilCalendarDate(event.startDate) : null}
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

  const { ongoing, upcoming, completed } = useMemo(() => {
    const active = filtered.filter((e) => e.status !== "cancelled");

    const completedList = active.filter((e) => isPastEvent(e) || e.status === "completed");
    const completedIds = new Set(completedList.map((e) => e._id));

    const ongoingList = active
      .filter((e) => !completedIds.has(e._id) && e.status === "ongoing")
      .sort(sortUpcoming);

    const upcomingList = active
      .filter((e) => !completedIds.has(e._id) && e.status === "upcoming")
      .sort(sortUpcoming);

    completedList.sort(sortPast);

    return { ongoing: ongoingList, upcoming: upcomingList, completed: completedList };
  }, [filtered]);

  const hasFilters = Boolean(searchQuery.trim() || sportType);

  return (
    <>
      <DashboardPageHeader
        title="Events"
        description="Browse campus sports events. Live events are highlighted; upcoming shows a day countdown. Cancelled events are hidden."
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
            id="student-events-ongoing-heading"
            title="Ongoing events"
            events={ongoing}
            ongoingLive
            emptyHint={
              hasFilters
                ? "No ongoing events match your search or filter."
                : "Nothing in progress right now. Check upcoming events below."
            }
          />
          <EventSection
            id="student-events-upcoming-heading"
            title="Upcoming events"
            events={upcoming}
            showCountdown
            emptyHint={
              hasFilters
                ? "No upcoming events match your search or filter."
                : "No upcoming events scheduled. Check back later."
            }
          />
          <EventSection
            id="student-events-completed-heading"
            title="Completed events"
            events={completed}
            emptyHint={
              hasFilters
                ? "No completed events match your search or filter."
                : "No completed events to show yet."
            }
          />
        </>
      )}
    </>
  );
}
