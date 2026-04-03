import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getEventById } from "../../../api/events";
import { DashboardPageHeader } from "../../../components/student-dashboard/DashboardPageHeader";
import { LoadingState } from "../../../components/ui/LoadingSpinner";
import { Button } from "../../../components/ui/Button";
import { getApiErrorMessage } from "../../../utils/apiError";
import { getEventCardImageForSport } from "../../../utils/eventCardImages";
import { formatEventDateRange, formatEventDateTime } from "../../../utils/eventUtils";
import { cn } from "../../../utils/cn";

const STATUS_STYLES = {
  upcoming: "bg-blue-50 text-blue-800 ring-blue-100",
  ongoing: "bg-emerald-50 text-emerald-800 ring-emerald-100",
  completed: "bg-gray-100 text-gray-700 ring-gray-200",
  cancelled: "bg-red-50 text-red-700 ring-red-100",
};

export default function StudentEventDetailPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!eventId) return;
    let cancelled = false;
    (async () => {
      setError("");
      setLoading(true);
      try {
        const data = await getEventById(eventId);
        if (!cancelled) setEvent(data);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, "Could not load this event."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  if (loading) {
    return (
      <>
        <DashboardPageHeader title="Event" description="Loading…" />
        <LoadingState label="Loading event…" minHeight={false} className="mt-4" />
      </>
    );
  }

  if (error || !event) {
    return (
      <>
        <DashboardPageHeader title="Event" description="We couldn’t open this event." />
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error || "Event not found."}
        </div>
        <Button type="button" variant="outline" className="mt-6" to="/student/events">
          Back to events
        </Button>
      </>
    );
  }

  const status = event.status ?? "upcoming";
  const venueName = event.venue?.venueName ?? "—";
  const venueLoc = event.venue?.location ?? "";
  const heroImageSrc = getEventCardImageForSport(event.sportType);

  return (
    <>
      <div className="mb-6">
        <Button type="button" variant="outline" size="sm" to="/student/events" className="mb-4">
          ← Back to events
        </Button>
        <DashboardPageHeader title={event.title} description={formatEventDateRange(event.startDate, event.endDate)} />
        <p className="mt-2">
          <Link
            to={`/student/leaderboard?eventId=${eventId}`}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            View leaderboard for this event
          </Link>
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm ring-1 ring-gray-100">
        <div className="aspect-[21/9] w-full overflow-hidden bg-gray-100 sm:aspect-[24/9]">
          <img
            src={heroImageSrc}
            alt=""
            className="h-full w-full object-cover"
            decoding="async"
          />
        </div>
        <div className="p-6">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ring-1",
                STATUS_STYLES[status] ?? STATUS_STYLES.upcoming
              )}
            >
              {String(status).charAt(0).toUpperCase() + String(status).slice(1)}
            </span>
            <span className="text-sm font-bold text-blue-700">{event.sportType}</span>
          </div>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Starts</dt>
              <dd className="font-semibold text-gray-900">{formatEventDateTime(event.startDate)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Ends</dt>
              <dd className="font-semibold text-gray-900">{formatEventDateTime(event.endDate)}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Venue</dt>
              <dd className="font-semibold text-gray-900">
                {venueName}
                {venueLoc ? (
                  <span className="mt-0.5 block text-sm font-normal text-gray-600">{venueLoc}</span>
                ) : null}
              </dd>
            </div>
          </dl>
          <div className="mt-6 border-t border-gray-100 pt-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">About</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
              {event.description?.trim() || "No description provided for this event."}
            </p>
          </div>
          <p className="mt-6 text-xs text-gray-400">
            Registration and team features will connect here in a future update.{" "}
            <Link to="/student/events" className="font-semibold text-blue-600 hover:text-blue-700">
              Return to list
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
