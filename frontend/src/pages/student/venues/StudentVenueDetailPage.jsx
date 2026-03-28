import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import venuePlaceholder from "../../../assets/venues.jpg";
import { getVenueById } from "../../../api/venues";
import { DashboardPageHeader } from "../../../components/student-dashboard/DashboardPageHeader";
import { LoadingState } from "../../../components/ui/LoadingSpinner";
import { Button } from "../../../components/ui/Button";
import { getApiErrorMessage } from "../../../utils/apiError";
import { cn } from "../../../utils/cn";
import { formatVenueDateDisplay } from "../../../utils/venueUtils";

export default function StudentVenueDetailPage() {
  const { venueId } = useParams();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!venueId) return;
    let cancelled = false;
    (async () => {
      setError("");
      setLoading(true);
      try {
        const data = await getVenueById(venueId);
        if (!cancelled) setVenue(data);
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
  const dates = Array.isArray(venue.availableDates) ? venue.availableDates : [];
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
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Marked available dates</h2>
            <p className="mt-1 text-sm text-gray-500">
              Dates organizers have flagged for this venue (informational).
            </p>
            {dates.length === 0 ? (
              <p className="mt-3 text-sm text-gray-500">No specific dates listed.</p>
            ) : (
              <ul className="mt-4 divide-y divide-gray-100 rounded-xl border border-gray-100">
                {dates.map((d, i) => (
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
