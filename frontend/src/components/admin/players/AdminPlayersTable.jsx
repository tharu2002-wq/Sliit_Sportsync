import { Link } from "react-router-dom";
import { getGenderLabel } from "../../../constants/playerGender";
import { formatPlayerTeamsLine } from "../../../utils/playerDisplayUtils";

/**
 * @param {{ players: unknown[]; deletingId?: string | null; onDeletePlayer?: (id: string, fullName: string) => void }} props
 */
export function AdminPlayersTable({ players, deletingId = null, onDeletePlayer }) {
  if (players.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-12 text-center text-sm text-gray-500">
        No players match your filters. Create a player or adjust search.
      </p>
    );
  }

  return (
    <>
      <ul className="space-y-3 lg:hidden">
        {players.map((p) => (
          <li key={p._id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="font-bold text-gray-900">{p.fullName}</p>
            <p className="mt-0.5 text-xs text-gray-500">{p.studentId}</p>
            <p className="mt-2 text-xs text-gray-600">{p.email}</p>
            <p className="mt-1 text-xs text-gray-600">
              {p.department} · Age {p.age} · {getGenderLabel(p.gender)}
            </p>
            <p className="mt-1 text-xs text-gray-600">Teams: {formatPlayerTeamsLine(p)}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                to={`/admin/players/${p._id}/edit`}
                className="inline-flex rounded-lg border border-blue-600 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50"
              >
                Edit
              </Link>
              {onDeletePlayer ? (
                <button
                  type="button"
                  onClick={() => onDeletePlayer(String(p._id), p.fullName ?? "Player")}
                  disabled={deletingId === String(p._id)}
                  className="inline-flex rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deletingId === String(p._id) ? "Removing…" : "Remove"}
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
              <th className="px-4 py-3 font-bold text-gray-700">Name</th>
              <th className="px-4 py-3 font-bold text-gray-700">Student ID</th>
              <th className="px-4 py-3 font-bold text-gray-700">Email</th>
              <th className="px-4 py-3 font-bold text-gray-700">Faculty</th>
              <th className="px-4 py-3 font-bold text-gray-700">Age</th>
              <th className="px-4 py-3 font-bold text-gray-700">Gender</th>
              <th className="px-4 py-3 font-bold text-gray-700">Teams</th>
              <th className="px-4 py-3 font-bold text-gray-700">Sports</th>
              <th className="px-4 py-3 font-bold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr key={p._id} className="border-b border-gray-50 last:border-0">
                <td className="px-4 py-3 font-semibold text-gray-900">{p.fullName}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600">{p.studentId}</td>
                <td className="max-w-[12rem] truncate px-4 py-3 text-gray-600">{p.email}</td>
                <td className="max-w-[8rem] truncate px-4 py-3 text-gray-600">{p.department}</td>
                <td className="px-4 py-3 text-gray-600">{p.age}</td>
                <td className="px-4 py-3 text-gray-600">{getGenderLabel(p.gender)}</td>
                <td className="max-w-[14rem] truncate px-4 py-3 text-gray-600">{formatPlayerTeamsLine(p)}</td>
                <td className="max-w-[10rem] truncate px-4 py-3 text-gray-600">
                  {Array.isArray(p.sportTypes) && p.sportTypes.length ? p.sportTypes.join(", ") : "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/admin/players/${p._id}/edit`}
                      className="rounded-lg border border-blue-600 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                    >
                      Edit
                    </Link>
                    {onDeletePlayer ? (
                      <button
                        type="button"
                        onClick={() => onDeletePlayer(String(p._id), p.fullName ?? "Player")}
                        disabled={deletingId === String(p._id)}
                        className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === String(p._id) ? "Removing…" : "Remove"}
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
