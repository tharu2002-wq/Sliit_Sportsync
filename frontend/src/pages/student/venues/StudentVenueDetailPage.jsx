import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import venuePlaceholder from "../../../assets/venues.jpg";
import { getEvents } from "../../../api/events";
import { getVenueById } from "../../../api/venues";
import { DashboardPageHeader } from "../../../components/student-dashboard/DashboardPageHeader";
import { LoadingState } from "../../../components/ui/LoadingSpinner";
import { Button } from "../../../components/ui/Button";
import { getApiErrorMessage } from "../../../utils/apiError";
import { cn } from "../../../utils/cn";
import { formatEventDateRange } from "../../../utils/eventUtils";
import { formatVenueDateDisplay, getUpcomingEventsAtVenue } from "../../../utils/venueUtils";

const EVENT_STATUS_BADGE = {
  upcoming: "bg-blue-50 text-blue-800 ring-blue-100",
  ongoing: "bg-emerald-50 text-emerald-800 ring-emerald-100",
};

function EventRow({ ev }) {
  const range = formatEventDateRange(ev?.startDate, ev?.endDate);
  return (
    <li className="rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="font-bold text-gray-900">{ev.title ?? "Event"}</p>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wide ring-1",
            EVENT_STATUS_BADGE[ev.status] ?? "bg-gray-100 text-gray-700 ring-gray-200"
          )}
        >
          {ev.status === "upcoming" ? "Upcoming" : ev.status === "ongoing" ? "Ongoing" : ev.status ?? "—"}
        </span>
      </div>
      <p className="mt-1 text-sm font-semibold text-blue-800">{ev.sportType ?? "—"}</p>
      <p className="mt-0.5 text-sm text-gray-600">{range}</p>
      <Link
        to={`/student/events/${ev._id}`}
        className="mt-2 inline-block text-sm font-semibold text-blue-600 hover:underline"
      >
        View event
      </Link>
    </li>
  );
}

export default function StudentVenueDetailPage() {
  const { venueId } = useParams();
  const [venue, setVenue] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [eventsNotice, setEventsNotice] = useState("");

  useEffect(() => {
    if (!venueId) return;
    let cancelled = false;
    (async () => {
      setError("");
      setEventsNotice("");
      setVenue(null);
      setEvents([]);
      setLoading(true);
      try {
        const [venueResult, eventsResult] = await Promise.allSettled([
          getVenueById(venueId),
          getEvents(),
        ]);
        if (cancelled) return;

        if (venueResult.status === "rejected") {
          setError(getApiErrorMessage(venueResult.reason, "Could not load this venue."));
          return;
        }

        setVenue(venueResult.value);

        if (eventsResult.status === "fulfilled") {
          const ev = eventsResult.value;
          setEvents(Array.isArray(ev) ? ev : []);
        } else {
          setEvents([]);
          setEventsNotice(getApiErrorMessage(eventsResult.reason, "Could not load events for this venue."));
        }
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, "Could not load this venue."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [venueId]);

  const { upcomingAtVenue, ongoingAtVenue } = useMemo(() => {
    const active = getUpcomingEventsAtVenue(events, venueId);
    return {
      upcomingAtVenue: active.filter((e) => e.status === "upcoming"),
      ongoingAtVenue: active.filter((e) => e.status === "ongoing"),
    };
  }, [events, venueId]);

  if (loading) {
    return (
      <>
        <DashboardPageHeader title="Venue" description="Loading…" />
        <LoadingState label="Loading venue…" minHeight={false} className="mt-4" />
      </>
    );
  }

  if (error || !venue) {
    return (
      <>
        <DashboardPageHeader title="Venue" description="We couldn’t open this venue." />
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error || "Venue not found."}
        </div>
        <Button type="button" variant="outline" className="mt-6" to="/student/venues">
          Back to venues
        </Button>
      </>
    );
  }

  const available = venue.status === "available";
  const blockedDates = Array.isArray(venue.unavailableDates) ? venue.unavailableDates : [];
  const sports = Array.isArray(venue.sports) ? venue.sports.filter(Boolean) : [];
  const cap = venue.capacity != null ? Number(venue.capacity) : null;

  return (
    <>
      <div className="mb-6">
        <Button type="button" variant="outline" size="sm" to="/student/venues" className="mb-4">
          ← Back to venues
        </Button>
        <DashboardPageHeader title={venue.venueName} description={venue.location ?? "SLIIT campus venue"} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm ring-1 ring-gray-100">
        <div className="aspect-[21/9] w-full overflow-hidden bg-gray-100 sm:aspect-[24/9]">
          <img src={venuePlaceholder} alt="" className="h-full w-full object-cover" decoding="async" />
        </div>
        <div className="p-6">
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ring-1",
                available
                  ? "bg-emerald-50 text-emerald-800 ring-emerald-100"
                  : "bg-amber-50 text-amber-800 ring-amber-100"
              )}
            >
              {available ? "Available" : "Unavailable"}
            </span>
            <span className="text-sm font-bold text-blue-700">SLIIT campus</span>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Location</h2>
            <p className="mt-2 text-base text-gray-900">{venue.location ?? "—"}</p>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Capacity</h2>
            <p className="mt-2 text-base text-gray-900">
              {cap != null && !Number.isNaN(cap) ? `${cap.toLocaleString()} people` : "—"}
            </p>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Sports</h2>
            <p className="mt-1 text-sm text-gray-500">
              {sports.length === 0
                ? "Any sport may use this venue unless organizers say otherwise."
                : "This venue is set up for the following sports."}
            </p>
            {sports.length === 0 ? (
              <p className="mt-3 text-sm font-medium text-gray-700">All sports</p>
            ) : (
              <ul className="mt-4 flex flex-wrap gap-2">
                {sports.map((s) => (
                  <li
                    key={s}
                    className="rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1 text-sm font-semibold text-blue-900"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Events at this venue</h2>
            <p className="mt-1 text-sm text-gray-500">
              Upcoming and ongoing events that use this space (not completed or cancelled).
            </p>
            {eventsNotice ? (
              <p className="mt-3 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                {eventsNotice}
              </p>
            ) : null}

            {ongoingAtVenue.length > 0 ? (
              <div className="mt-6">
                <h3 className="text-xs font-bold uppercase tracking-wide text-emerald-800">Ongoing</h3>
                <ul className="mt-3 space-y-3">
                  {ongoingAtVenue.map((ev) => (
                    <EventRow key={ev._id} ev={ev} />
                  ))}
                </ul>
              </div>
            ) : null}

            {upcomingAtVenue.length > 0 ? (
              <div className={cn("mt-6", ongoingAtVenue.length === 0 && "mt-4")}>
                <h3 className="text-xs font-bold uppercase tracking-wide text-blue-800">Upcoming</h3>
                <ul className="mt-3 space-y-3">
                  {upcomingAtVenue.map((ev) => (
                    <EventRow key={ev._id} ev={ev} />
                  ))}
                </ul>
              </div>
            ) : null}

            {upcomingAtVenue.length === 0 && ongoingAtVenue.length === 0 && !eventsNotice ? (
              <p className="mt-4 text-sm text-gray-600">
                No upcoming or ongoing events are scheduled here right now.
              </p>
            ) : null}
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Blocked dates</h2>
            <p className="mt-1 text-sm text-gray-500">
              Calendar days when this venue is marked unavailable for scheduling.
            </p>
            {blockedDates.length === 0 ? (
              <p className="mt-3 text-sm text-gray-500">No blocked dates — organizers treat all days as available.</p>
            ) : (
              <ul className="mt-4 divide-y divide-gray-100 rounded-xl border border-gray-100">
                {blockedDates.map((d, i) => (
                  <li key={`${String(d)}-${i}`} className="px-4 py-3 text-sm font-medium text-gray-900">
                    {formatVenueDateDisplay(d)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
