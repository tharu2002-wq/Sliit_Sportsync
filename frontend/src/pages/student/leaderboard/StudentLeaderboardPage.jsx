import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getEvents } from "../../../api/events";
import { getLeaderboardTable } from "../../../api/results";
import { DashboardPageHeader } from "../../../components/student-dashboard/DashboardPageHeader";
import { StudentLeaderboardTable } from "../../../components/student-dashboard/StudentLeaderboardTable";
import { LoadingState } from "../../../components/ui/LoadingSpinner";
import { SelectFilter } from "../../../components/ui/SelectFilter";
import { getApiErrorMessage } from "../../../utils/apiError";

export default function StudentLeaderboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedEventId = searchParams.get("eventId") ?? "";

  const setSelectedEventId = (id) => {
    if (id) {
      setSearchParams({ eventId: id }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState("");

  const [rows, setRows] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableError, setTableError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setEventsError("");
      setEventsLoading(true);
      try {
        const data = await getEvents();
        if (!cancelled) setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setEventsError(getApiErrorMessage(err, "Could not load events."));
      } finally {
        if (!cancelled) setEventsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const eventOptions = useMemo(() => {
    return [...events]
      .sort((a, b) =>
        String(a.title ?? "").localeCompare(String(b.title ?? ""), undefined, { sensitivity: "base" })
      )
      .map((ev) => ({
        value: String(ev._id),
        label: `${ev.title ?? "Event"}${ev.sportType ? ` — ${ev.sportType}` : ""}`,
      }));
  }, [events]);

  const loadTable = useCallback(async (eventId) => {
    if (!eventId) {
      setRows([]);
      setTableError("");
      return;
    }
    setTableLoading(true);
    setTableError("");
    try {
      const data = await getLeaderboardTable(eventId);
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setRows([]);
      setTableError(getApiErrorMessage(err, "Could not load leaderboard."));
    } finally {
      setTableLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTable(selectedEventId);
  }, [selectedEventId, loadTable]);

  const selectedEvent = useMemo(
    () => events.find((e) => String(e._id) === String(selectedEventId)),
    [events, selectedEventId]
  );

  return (
    <>
      <DashboardPageHeader
        title="Leaderboard"
        description="See how teams rank in each event based on completed match results. Choose an event to view points, wins, and score difference (for vs against)."
      />

      {eventsError ? (
        <div
          className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {eventsError}
        </div>
      ) : null}

      <div className="mt-6 max-w-xl">
        {eventsLoading ? (
          <LoadingState label="Loading events…" minHeight={false} />
        ) : (
          <SelectFilter
            id="student-leaderboard-event"
            label="Event"
            className="w-full"
            options={eventOptions}
            value={selectedEventId}
            onChange={setSelectedEventId}
            showAllOption
            allLabel="Select an event…"
          />
        )}
      </div>

      {!eventsLoading && events.length === 0 && !eventsError ? (
        <p className="mt-6 rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-8 text-center text-sm text-gray-500">
          No events are available yet.
        </p>
      ) : null}

      {selectedEventId ? (
        <section className="mt-8">
          {tableError ? (
            <div
              className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800"
              role="alert"
            >
              {tableError}
            </div>
          ) : null}

          {tableLoading ? (
            <LoadingState label="Loading standings…" className="mt-2" />
          ) : (
            <StudentLeaderboardTable
              rows={rows}
              eventTitle={selectedEvent?.title}
              sportType={selectedEvent?.sportType}
            />
          )}
        </section>
      ) : !eventsLoading && events.length > 0 ? (
        <p className="mt-8 text-sm text-gray-500">Select an event to load standings.</p>
      ) : null}
    </>
  );
}
