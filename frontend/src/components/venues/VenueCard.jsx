import { Button } from "../ui/Button";
import { cn } from "../../utils/cn";

function AvailabilityBadge({ status }) {
  const available = status !== "unavailable";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ring-1",
        available
          ? "bg-emerald-50 text-emerald-800 ring-emerald-100"
          : "bg-amber-50 text-amber-800 ring-amber-100"
      )}
    >
      {available ? "Available" : "Unavailable"}
    </span>
  );
}

/**
 * Venue summary card with image, meta, and link to detail route.
 */
export function VenueCard({ venue, imageSrc, detailTo, className }) {
  const cap = venue.capacity != null ? Number(venue.capacity) : null;
  const summary =
    cap != null && !Number.isNaN(cap)
      ? `Capacity up to ${cap.toLocaleString()} people.`
      : "Capacity details on the venue page.";

  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm ring-1 ring-gray-100 transition-shadow hover:shadow-md",
        className
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
        <img
          src={imageSrc}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute left-3 top-3">
          <AvailabilityBadge status={venue.status} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="mb-1 text-xs font-bold uppercase tracking-wide text-blue-700">SLIIT campus</p>
        <h3 className="text-lg font-black leading-tight tracking-tight text-gray-900">{venue.venueName}</h3>
        <p className="mt-2 text-sm text-gray-600">
          <span className="font-semibold text-gray-500">Location:</span> {venue.location ?? "—"}
        </p>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-gray-500">{summary}</p>
        <p className="mb-4 mt-2 text-xs text-gray-400">
          <span className="font-semibold text-gray-500">Updated:</span>{" "}
          {venue.updatedAt
            ? new Date(venue.updatedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "—"}
        </p>
        <Button type="button" variant="outline" size="sm" fullWidth to={detailTo} className="mt-auto">
          View venue details
        </Button>
      </div>
    </article>
  );
}
