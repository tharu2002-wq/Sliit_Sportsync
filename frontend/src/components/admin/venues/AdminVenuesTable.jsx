import { Link } from "react-router-dom";
import { formatVenueDateDisplay, normalizeUnavailableDatesFromApi } from "../../../utils/venueUtils";
import { VenueStatusBadge } from "./VenueStatusBadge";

function blockedDatesSummary(venue) {
  const dates = normalizeUnavailableDatesFromApi(venue.unavailableDates);
  if (dates.length === 0) return "None";
  if (dates.length <= 2) {
    return dates.map((ymd) => formatVenueDateDisplay(`${ymd}T12:00:00`)).join(", ");
  }
  return `${dates.length} blocked`;
}

function sportsSummary(venue) {
  const list = Array.isArray(venue.sports) ? venue.sports.filter(Boolean) : [];
  if (list.length === 0) return "Any sport";
  if (list.length <= 2) return list.join(", ");
  return `${list.length} sports`;
}

export function AdminVenuesTable({ venues, onDeleteClick, onVenueClick }) {
  if (venues.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-12 text-center text-sm text-gray-500">
        No venues match your filters. Create a venue or adjust search.
      </p>
    );
  }

  return (
    <>
      <ul className="space-y-3 lg:hidden">
        {venues.map((v) => (
          <li key={v._id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            {typeof onVenueClick === "function" ? (
              <button
                type="button"
                className="text-left font-bold text-gray-900 hover:text-blue-700 hover:underline"
                onClick={() => onVenueClick(v)}
              >
                {v.venueName}
              </button>
            ) : (
              <p className="font-bold text-gray-900">{v.venueName}</p>
            )}
            <p className="mt-1 text-xs text-gray-600">{v.location}</p>
            <p className="mt-2 text-xs text-gray-600">
              Capacity: {v.capacity != null ? Number(v.capacity).toLocaleString() : "—"}
            </p>
            <div className="mt-2">
              <VenueStatusBadge status={v.status} />
            </div>
            <p className="mt-2 text-xs text-gray-500">Blocked dates: {blockedDatesSummary(v)}</p>
            <p className="mt-1 text-xs text-gray-500">Sports: {sportsSummary(v)}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                to={`/admin/venues/${v._id}/edit`}
                className="inline-flex rounded-lg border border-blue-600 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50"
              >
                Edit
              </Link>
              <Link
                to={`/admin/venues/${v._id}/edit#venue-availability`}
                className="inline-flex rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Availability
              </Link>
              {typeof onDeleteClick === "function" ? (
                <button
                  type="button"
                  className="inline-flex rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                  onClick={() => onDeleteClick(v)}
                >
                  Delete
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm lg:block">
        <table className="w-full min-w-[960px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80">
              <th className="px-4 py-3 font-bold text-gray-700">Venue</th>
              <th className="px-4 py-3 font-bold text-gray-700">Location</th>
              <th className="px-4 py-3 font-bold text-gray-700">Capacity</th>
              <th className="px-4 py-3 font-bold text-gray-700">Status</th>
              <th className="px-4 py-3 font-bold text-gray-700">Blocked dates</th>
              <th className="px-4 py-3 font-bold text-gray-700">Sports</th>
              <th className="px-4 py-3 font-bold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {venues.map((v) => (
              <tr key={v._id} className="border-b border-gray-50 last:border-0">
                <td className="px-4 py-3 font-semibold text-gray-900">
                  {typeof onVenueClick === "function" ? (
                    <button
                      type="button"
                      className="text-left font-semibold text-blue-700 hover:underline"
                      onClick={() => onVenueClick(v)}
                    >
                      {v.venueName}
                    </button>
                  ) : (
                    v.venueName
                  )}
                </td>
                <td className="max-w-[14rem] px-4 py-3 text-gray-600">{v.location}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                  {v.capacity != null ? Number(v.capacity).toLocaleString() : "—"}
                </td>
                <td className="px-4 py-3">
                  <VenueStatusBadge status={v.status} />
                </td>
                <td className="max-w-[12rem] truncate px-4 py-3 text-gray-600" title={blockedDatesSummary(v)}>
                  {blockedDatesSummary(v)}
                </td>
                <td className="max-w-[12rem] truncate px-4 py-3 text-gray-600" title={sportsSummary(v)}>
                  {sportsSummary(v)}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/admin/venues/${v._id}/edit`}
                      className="rounded-lg border border-blue-600 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                    >
                      Edit
                    </Link>
                    <Link
                      to={`/admin/venues/${v._id}/edit#venue-availability`}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Availability
                    </Link>
                    {typeof onDeleteClick === "function" ? (
                      <button
                        type="button"
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                        onClick={() => onDeleteClick(v)}
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
