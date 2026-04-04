import { Link } from "react-router-dom";
import { Button } from "../../ui/Button";
import { MatchStatusBadge } from "./MatchStatusBadge";

function refLabel(ref, nameKey = "teamName") {
  if (!ref) return "—";
  if (typeof ref === "object" && ref !== null && nameKey in ref) {
    return ref[nameKey];
  }
  return "—";
}

function eventTitle(ev) {
  if (!ev) return "—";
  if (typeof ev === "object" && ev !== null && "title" in ev) return ev.title;
  return "—";
}

function venueLabel(venue) {
  if (!venue) return "—";
  if (typeof venue === "object" && venue !== null && "venueName" in venue) {
    return venue.venueName;
  }
  return "—";
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function AdminMatchesTable({ matches, onCancelClick, onDeleteClick }) {
  if (matches.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-12 text-center text-sm text-gray-500">
        No matches match your filters. Create a match or adjust search.
      </p>
    );
  }

  return (
    <>
      <ul className="space-y-3 lg:hidden">
        {matches.map((m) => (
          <li key={m._id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 font-bold text-gray-900">{eventTitle(m.event)}</p>
              <MatchStatusBadge status={m.status} />
            </div>
            <p className="mt-2 text-sm text-gray-800">
              {refLabel(m.teamA)} <span className="text-gray-400">vs</span> {refLabel(m.teamB)}
            </p>
            <p className="mt-1 text-xs text-gray-600">
              {formatDate(m.date)} · {m.startTime}–{m.endTime}
            </p>
            <p className="mt-1 text-xs text-gray-600">{venueLabel(m.venue)}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button to={`/admin/matches/${m._id}/edit`} variant="outline" size="sm">
                Edit
              </Button>
              {m.status !== "cancelled" ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="!border-red-200 !text-red-600 hover:!bg-red-50"
                  onClick={() => onCancelClick(m)}
                >
                  Cancel
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="!border-2 !border-slate-800 !bg-slate-800 !text-white hover:!bg-slate-900 hover:!border-slate-900"
                  onClick={() => onDeleteClick(m)}
                >
                  Delete
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm lg:block">
        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80">
              <th className="px-4 py-3 font-bold text-gray-700">Event</th>
              <th className="px-4 py-3 font-bold text-gray-700">Teams</th>
              <th className="px-4 py-3 font-bold text-gray-700">Date</th>
              <th className="px-4 py-3 font-bold text-gray-700">Time</th>
              <th className="px-4 py-3 font-bold text-gray-700">Venue</th>
              <th className="px-4 py-3 font-bold text-gray-700">Round</th>
              <th className="px-4 py-3 font-bold text-gray-700">Status</th>
              <th className="px-4 py-3 font-bold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((m) => (
              <tr key={m._id} className="border-b border-gray-50 last:border-0">
                <td className="max-w-[10rem] truncate px-4 py-3 font-semibold text-gray-900">{eventTitle(m.event)}</td>
                <td className="px-4 py-3 text-gray-700">
                  {refLabel(m.teamA)} <span className="text-gray-400">vs</span> {refLabel(m.teamB)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600">{formatDate(m.date)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                  {m.startTime} – {m.endTime}
                </td>
                <td className="max-w-[8rem] truncate px-4 py-3 text-gray-600">{venueLabel(m.venue)}</td>
                <td className="px-4 py-3 text-gray-600">{m.round ?? "—"}</td>
                <td className="px-4 py-3">
                  <MatchStatusBadge status={m.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/admin/matches/${m._id}/edit`}
                      className="rounded-lg border border-blue-600 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                    >
                      Edit
                    </Link>
                    {m.status !== "cancelled" ? (
                      <button
                        type="button"
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                        onClick={() => onCancelClick(m)}
                      >
                        Cancel
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="rounded-lg border-2 border-slate-800 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-900 hover:border-slate-900"
                        onClick={() => onDeleteClick(m)}
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
