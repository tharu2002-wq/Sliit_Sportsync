import { Link } from "react-router-dom";
import { Button } from "../../ui/Button";

function captainLabel(c) {
  if (!c) return "—";
  if (typeof c === "object" && c !== null && "fullName" in c) return c.fullName;
  return "—";
}

export function AdminTeamsTable({ teams }) {
  if (teams.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-12 text-center text-sm text-gray-500">
        No teams match your filters. Create a team or adjust search.
      </p>
    );
  }

  return (
    <>
      <ul className="space-y-3 lg:hidden">
        {teams.map((t) => (
          <li key={t._id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-bold text-gray-900">{t.teamName}</p>
                <p className="mt-0.5 text-xs text-gray-500">{t.sportType}</p>
              </div>
              <span
                className={
                  t.isActive === false
                    ? "rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600"
                    : "rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800"
                }
              >
                {t.isActive === false ? "Inactive" : "Active"}
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-600">
              Captain: {captainLabel(t.captain)} · Members: {Array.isArray(t.members) ? t.members.length : 0}
            </p>
            <div className="mt-4">
              <Button to={`/admin/teams/${t._id}`} variant="outline" size="sm">
                Manage
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm lg:block">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80">
              <th className="px-4 py-3 font-bold text-gray-700">Team</th>
              <th className="px-4 py-3 font-bold text-gray-700">Sport</th>
              <th className="px-4 py-3 font-bold text-gray-700">Captain</th>
              <th className="px-4 py-3 font-bold text-gray-700">Members</th>
              <th className="px-4 py-3 font-bold text-gray-700">Status</th>
              <th className="px-4 py-3 font-bold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((t) => (
              <tr key={t._id} className="border-b border-gray-50 last:border-0">
                <td className="px-4 py-3 font-semibold text-gray-900">{t.teamName}</td>
                <td className="px-4 py-3 text-gray-600">{t.sportType}</td>
                <td className="max-w-[10rem] truncate px-4 py-3 text-gray-600">{captainLabel(t.captain)}</td>
                <td className="px-4 py-3 text-gray-600">{Array.isArray(t.members) ? t.members.length : 0}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      t.isActive === false
                        ? "rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600"
                        : "rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800"
                    }
                  >
                    {t.isActive === false ? "Inactive" : "Active"}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <Link
                    to={`/admin/teams/${t._id}`}
                    className="rounded-lg border border-blue-600 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                  >
                    Manage
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
