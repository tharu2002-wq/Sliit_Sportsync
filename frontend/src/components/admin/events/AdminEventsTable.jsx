import { Link } from "react-router-dom";
import { Button } from "../../ui/Button";
import { EventStatusBadge } from "./EventStatusBadge";

function formatRange(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return "—";
  const opts = { year: "numeric", month: "short", day: "numeric" };
  return `${s.toLocaleDateString(undefined, opts)} → ${e.toLocaleDateString(undefined, opts)}`;
}

function venueLabel(venue) {
  if (!venue) return "—";
  if (typeof venue === "object" && venue !== null && "venueName" in venue) {
    return venue.venueName;
  }
  return "—";
}

function teamsCount(teams) {
  if (!Array.isArray(teams)) return 0;
  return teams.length;
}

export function AdminEventsTable({ events, onCancelClick, onDeleteClick }) {
  if (events.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-12 text-center text-sm text-gray-500">
        No events match your filters. Create an event or adjust search.
      </p>
    );
  }

  return (
    <>
      {/* Mobile cards */}
      <ul className="space-y-3 lg:hidden">
        {events.map((ev) => (
          <li key={ev._id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-bold text-gray-900">{ev.title}</p>
                <p className="mt-0.5 text-xs text-gray-500">{ev.sportType}</p>
              </div>
              <EventStatusBadge status={ev.status} />
            </div>
            <p className="mt-2 text-xs text-gray-600">{formatRange(ev.startDate, ev.endDate)}</p>
            <p className="mt-1 text-xs text-gray-600">
              <span className="font-medium text-gray-700">Venue:</span> {venueLabel(ev.venue)}
            </p>
            <p className="mt-1 text-xs text-gray-600">
              <span className="font-medium text-gray-700">Teams:</span> {teamsCount(ev.teams)}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button to={`/admin/events/${ev._id}/edit`} variant="outline" size="sm">
                Edit
              </Button>
              {ev.status !== "cancelled" ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="!border-red-200 !text-red-600 hover:!bg-red-50"
                  onClick={() => onCancelClick(ev)}
                >
                  Cancel
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="!border-2 !border-slate-800 !bg-slate-800 !text-white hover:!bg-slate-900 hover:!border-slate-900"
                  onClick={() => onDeleteClick(ev)}
                >
                  Delete
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm lg:block">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80">
              <th className="px-4 py-3 font-bold text-gray-700">Event</th>
              <th className="px-4 py-3 font-bold text-gray-700">Sport</th>
              <th className="px-4 py-3 font-bold text-gray-700">Schedule</th>
              <th className="px-4 py-3 font-bold text-gray-700">Venue</th>
              <th className="px-4 py-3 font-bold text-gray-700">Teams</th>
              <th className="px-4 py-3 font-bold text-gray-700">Status</th>
              <th className="px-4 py-3 font-bold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev) => (
              <tr key={ev._id} className="border-b border-gray-50 last:border-0">
                <td className="px-4 py-3 font-semibold text-gray-900">{ev.title}</td>
                <td className="px-4 py-3 text-gray-600">{ev.sportType}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600">{formatRange(ev.startDate, ev.endDate)}</td>
                <td className="max-w-[10rem] truncate px-4 py-3 text-gray-600">{venueLabel(ev.venue)}</td>
                <td className="px-4 py-3 text-gray-600">{teamsCount(ev.teams)}</td>
                <td className="px-4 py-3">
                  <EventStatusBadge status={ev.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/admin/events/${ev._id}/edit`}
                      className="rounded-lg border border-blue-600 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                    >
                      Edit
                    </Link>
                    {ev.status !== "cancelled" ? (
                      <button
                        type="button"
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                        onClick={() => onCancelClick(ev)}
                      >
                        Cancel
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="rounded-lg border-2 border-slate-800 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-900 hover:border-slate-900"
                        onClick={() => onDeleteClick(ev)}
                      >
                        Delete
                      </button>
                    )}
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
