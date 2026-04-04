import { Link } from "react-router-dom";
import { formatMatchDay, getMatchSportTypeLabel } from "../../../utils/matchUtils";
import { formatResultWinnerLabel } from "../../../utils/resultDisplayUtils";

export function AdminResultsTable({ results, onDeleteClick }) {
  if (results.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-12 text-center text-sm text-gray-500">
        No results match your search. Record a result from pending matches above or adjust search.
      </p>
    );
  }

  return (
    <>
      <ul className="space-y-3 lg:hidden">
        {results.map((r) => {
          const m = r.match;
          const teamA = m?.teamA?.teamName ?? "A";
          const teamB = m?.teamB?.teamName ?? "B";
          const sport = m ? getMatchSportTypeLabel(m) : "";
          return (
            <li key={r._id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              {sport ? (
                <p className="text-xs font-bold uppercase tracking-wide text-blue-700">{sport}</p>
              ) : null}
              <p className={`text-xs text-gray-500 ${sport ? "mt-1" : ""}`}>{m?.event?.title ?? "Match"}</p>
              <p className="mt-1 font-bold text-gray-900">
                {teamA} {r.scoreA} – {r.scoreB} {teamB}
              </p>
              <p className="mt-2 text-sm text-emerald-800">
                Winner: <span className="font-bold">{formatResultWinnerLabel(r)}</span>
              </p>
              <p className="mt-1 text-xs text-gray-500">{formatMatchDay(m?.date)}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  to={`/admin/results/${r._id}/edit`}
                  className="inline-flex rounded-lg border border-blue-600 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  className="inline-flex rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                  onClick={() => onDeleteClick(r)}
                >
                  Delete
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="hidden overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm lg:block">
        <table className="w-full min-w-[1040px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80">
              <th className="px-4 py-3 font-bold text-gray-700">Sport</th>
              <th className="px-4 py-3 font-bold text-gray-700">Event</th>
              <th className="px-4 py-3 font-bold text-gray-700">Match</th>
              <th className="px-4 py-3 font-bold text-gray-700">Date</th>
              <th className="px-4 py-3 font-bold text-gray-700">Score</th>
              <th className="px-4 py-3 font-bold text-gray-700">Winner</th>
              <th className="px-4 py-3 font-bold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => {
              const m = r.match;
              const teamA = m?.teamA?.teamName ?? "A";
              const teamB = m?.teamB?.teamName ?? "B";
              const sport = m ? getMatchSportTypeLabel(m) : "";
              return (
                <tr key={r._id} className="border-b border-gray-50 last:border-0">
                  <td className="max-w-[8rem] truncate px-4 py-3 text-xs font-bold uppercase tracking-wide text-blue-700">
                    {sport || "—"}
                  </td>
                  <td className="max-w-[10rem] truncate px-4 py-3 font-medium text-gray-900">
                    {m?.event?.title ?? "—"}
                  </td>
                  <td className="max-w-[14rem] px-4 py-3 text-gray-700">
                    {teamA} <span className="text-gray-400">vs</span> {teamB}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">{formatMatchDay(m?.date)}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-semibold text-gray-900">
                    {r.scoreA} – {r.scoreB}
                  </td>
                  <td className="max-w-[10rem] truncate px-4 py-3 font-medium text-emerald-800">
                    {formatResultWinnerLabel(r)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={`/admin/results/${r._id}/edit`}
                        className="rounded-lg border border-blue-600 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                        onClick={() => onDeleteClick(r)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
