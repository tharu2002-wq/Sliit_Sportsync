import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getEvents } from "../../../api/events";
import { getLeaderboardTable } from "../../../api/results";
import { LeaderboardTable } from "../../../components/admin/leaderboard/LeaderboardTable";
import { LoadingState } from "../../../components/ui/LoadingSpinner";
import { SelectField } from "../../../components/ui/SelectField";
import { getApiErrorMessage } from "../../../utils/apiError";

export default function AdminLeaderboardPage() {
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

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) =>
      String(a.title ?? "").localeCompare(String(b.title ?? ""), undefined, { sensitivity: "base" })
    );
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
    () => sortedEvents.find((e) => String(e._id) === String(selectedEventId)),
    [sortedEvents, selectedEventId]
  );

  return (
    <div>
      <div className="border-b border-gray-100 pb-6">
        <h1 className="text-2xl font-black tracking-tight text-gray-900 md:text-3xl">Leaderboard</h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-600">
          Standings are built from recorded match results for the selected event (3 points for a win, 1 for a draw,
          then score difference as a tie-breaker). Choose an event to view its table.
        </p>
      </div>

      {eventsError ? (
        <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {eventsError}
        </p>
      ) : null}

      <div className="mt-8 max-w-xl">
        {eventsLoading ? (
          <LoadingState label="Loading events…" />
        ) : (
          <SelectField
            id="leaderboard-event"
            name="eventId"
            label="Event"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            <option value="">Select an event…</option>
            {sortedEvents.map((ev) => (
              <option key={ev._id} value={ev._id}>
                {ev.title}
                {ev.sportType ? ` — ${ev.sportType}` : ""}
                {ev.status ? ` (${ev.status})` : ""}
              </option>
            ))}
          </SelectField>
        )}
      </div>

      {!eventsLoading && sortedEvents.length === 0 && !eventsError ? (
        <p className="mt-6 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
          No events yet. Create an event and record match results to see a leaderboard.
        </p>
      ) : null}

      {selectedEventId ? (
        <section className="mt-10">
          <h2 className="text-lg font-black text-gray-900">
            {selectedEvent?.title ?? "Event"} <span className="font-semibold text-gray-500">standings</span>
          </h2>
          {selectedEvent?.sportType ? (
            <p className="mt-1 text-sm text-gray-600">{selectedEvent.sportType}</p>
          ) : null}

          {tableError ? (
            <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {tableError}
            </p>
          ) : null}

          <div className="mt-6">
            {tableLoading ? (
              <LoadingState label="Loading standings…" />
            ) : (
              <LeaderboardTable rows={rows} eventTitle={selectedEvent?.title} />
            )}
          </div>
        </section>
      ) : !eventsLoading && sortedEvents.length > 0 ? (
        <p className="mt-10 text-sm text-gray-500">Select an event above to load its leaderboard.</p>
      ) : null}
    </div>
  );
}
