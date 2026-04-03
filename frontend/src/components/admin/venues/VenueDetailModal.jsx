import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../ui/Button";
import { getEventStatusLabel } from "../../../constants/eventStatus";
import { toDateInputValue } from "../../../utils/eventFormUtils";
import {
  formatVenueDateDisplay,
  getUpcomingEventsAtVenue,
  normalizeUnavailableDatesFromApi,
} from "../../../utils/venueUtils";
import { VenueStatusBadge } from "./VenueStatusBadge";

function eventDateRangeLabel(ev) {
  const a = toDateInputValue(ev?.startDate);
  const b = toDateInputValue(ev?.endDate);
  if (!a || !b) return "—";
  if (a === b) return formatVenueDateDisplay(`${a}T12:00:00`);
  return `${formatVenueDateDisplay(`${a}T12:00:00`)} → ${formatVenueDateDisplay(`${b}T12:00:00`)}`;
}

/**
 * @param {{
 *   venue: unknown;
 *   events: unknown[];
 *   onClose: () => void;
 * }} props
 */
export function VenueDetailModal({ venue, events, onClose }) {
  useEffect(() => {
    if (!venue) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [venue, onClose]);

  const blockedYmd = useMemo(
    () => normalizeUnavailableDatesFromApi(venue?.unavailableDates),
    [venue]
  );

  const upcomingAtVenue = useMemo(
    () => getUpcomingEventsAtVenue(events, venue?._id),
    [events, venue]
  );

  if (!venue) return null;

  const name = venue.venueName ?? "Venue";
  const location = venue.location ?? "—";
  const cap = venue.capacity != null ? Number(venue.capacity) : null;
  const sports = Array.isArray(venue.sports) ? venue.sports.filter(Boolean) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-gray-900/40"
        aria-label="Close venue details"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="venue-detail-modal-title"
        className="relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id="venue-detail-modal-title" className="text-xl font-black tracking-tight text-gray-900">
              {name}
            </h2>
            <p className="mt-1 text-sm text-gray-600">{location}</p>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            aria-label="Close"
            onClick={onClose}
          >
            <span aria-hidden className="text-xl leading-none">
              ×
            </span>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500">Details</h3>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-gray-500">Capacity</dt>
                <dd className="mt-0.5 font-semibold text-gray-900">
                  {cap != null && !Number.isNaN(cap) ? `${cap.toLocaleString()} people` : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Booking status</dt>
                <dd className="mt-0.5">
                  <VenueStatusBadge status={venue.status} />
                </dd>
              </div>
            </dl>
          </section>

          <section className="mt-8">
            <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500">Sports</h3>
            {sports.length === 0 ? (
              <p className="mt-2 text-sm text-gray-600">No sports recorded for this venue yet.</p>
            ) : (
              <ul className="mt-3 flex flex-wrap gap-2">
                {sports.map((s) => (
                  <li
                    key={s}
                    className="rounded-full border border-blue-100 bg-blue-50/90 px-3 py-1 text-xs font-semibold text-blue-900"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-8">
            <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500">Scheduling</h3>
            <p className="mt-2 text-sm text-gray-600">
              Every calendar day is available except admin-blocked days (below) and days already held by another
              upcoming or ongoing event. Two events cannot use the same venue on overlapping dates until one is
              completed or cancelled.
            </p>
            {blockedYmd.length === 0 ? (
              <p className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm font-medium text-emerald-900">
                No blocked dates — all days are available.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-gray-100 rounded-xl border border-gray-100">
                {blockedYmd.map((ymd) => (
                  <li key={ymd} className="px-4 py-2.5 text-sm font-medium text-gray-900">
                    {formatVenueDateDisplay(`${ymd}T12:00:00`)}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-8">
            <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500">
              Booked by events (upcoming &amp; ongoing)
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Each row is a date range this venue is reserved for. New events cannot overlap these ranges while the
              event stays upcoming or ongoing (and end on or after today).
            </p>
            {upcomingAtVenue.length === 0 ? (
              <p className="mt-3 text-sm text-gray-600">None scheduled.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {upcomingAtVenue.map((ev) => (
                  <li
                    key={ev._id}
                    className="rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3 text-sm shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="font-bold text-gray-900">{ev.title ?? "Untitled event"}</p>
                      <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-gray-600 ring-1 ring-gray-200">
                        {getEventStatusLabel(ev.status)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-blue-800">{ev.sportType ?? "—"}</p>
                    <p className="mt-1 text-xs text-gray-600">{eventDateRangeLabel(ev)}</p>
                    <Link
                      to={`/admin/events/${ev._id}/edit`}
                      className="mt-2 inline-block text-xs font-semibold text-blue-600 hover:underline"
                      onClick={onClose}
                    >
                      Edit event
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-gray-100 px-5 py-4 sm:px-6">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button type="button" variant="primary" size="sm" to={`/admin/venues/${venue._id}/edit`} onClick={onClose}>
            Edit venue
          </Button>
        </div>
      </div>
    </div>
  );
}
