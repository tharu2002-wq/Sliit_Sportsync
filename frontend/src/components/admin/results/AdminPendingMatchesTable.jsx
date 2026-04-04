import { Link } from "react-router-dom";
import { formatMatchDay, formatMatchTimeRange, getMatchSportTypeLabel } from "../../../utils/matchUtils";

export function AdminPendingMatchesTable({ matches }) {
  if (!matches.length) {
    return (
      <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-8 text-center text-sm text-gray-500">
        Every non-cancelled match has a recorded result, or there are no matches yet.
      </p>
    );
  }

  return (
    <>
      <ul className="space-y-3 lg:hidden">
        {matches.map((m) => {
          const sport = getMatchSportTypeLabel(m);
          return (
          <li key={m._id} className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4 shadow-sm">
            <p className="text-xs font-semibold text-amber-900">Awaiting result</p>
            {sport ? (
              <p className="mt-1 text-xs font-bold uppercase tracking-wide text-blue-700">{sport}</p>
            ) : null}
            <p className="mt-1 font-bold text-gray-900">{m.event?.title ?? "Match"}</p>
            <p className="mt-1 text-sm text-gray-800">
              {m.teamA?.teamName} vs {m.teamB?.teamName}
            </p>
            <p className="mt-1 text-xs text-gray-600">
              {formatMatchDay(m.date)} · {formatMatchTimeRange(m.startTime, m.endTime)}
            </p>
            <div className="mt-3">
              <Link
                to={`/admin/results/new?matchId=${m._id}`}
                className="inline-flex rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                Enter result
              </Link>
            </div>
          </li>
          );
        })}
      </ul>

      <div className="hidden overflow-x-auto rounded-2xl border border-amber-100 bg-amber-50/30 shadow-sm lg:block">
        <table className="w-full min-w-[800px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-amber-100/80 bg-amber-50/80">
              <th className="px-4 py-3 font-bold text-gray-700">Sport</th>
              <th className="px-4 py-3 font-bold text-gray-700">Event</th>
              <th className="px-4 py-3 font-bold text-gray-700">Match</th>
              <th className="px-4 py-3 font-bold text-gray-700">When</th>
              <th className="px-4 py-3 font-bold text-gray-700">Status</th>
              <th className="px-4 py-3 font-bold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((m) => (
              <tr key={m._id} className="border-b border-amber-50/80 bg-white/60 last:border-0">
                <td className="max-w-[8rem] truncate px-4 py-3 text-xs font-bold uppercase tracking-wide text-blue-700">
                  {getMatchSportTypeLabel(m) || "—"}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{m.event?.title ?? "—"}</td>
                <td className="px-4 py-3 text-gray-700">
                  {m.teamA?.teamName} <span className="text-gray-400">vs</span> {m.teamB?.teamName}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                  {formatMatchDay(m.date)}
                  <span className="mx-1 text-gray-300">·</span>
                  {formatMatchTimeRange(m.startTime, m.endTime)}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900">
                    No result
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    to={`/admin/results/new?matchId=${m._id}`}
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Enter result
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
