/**
 * @typedef {{
 *   teamId: string;
 *   teamName: string;
 *   played: number;
 *   wins: number;
 *   draws: number;
 *   losses: number;
 *   goalsFor: number;
 *   goalsAgainst: number;
 *   goalDifference: number;
 *   points: number;
 * }} LeaderboardRow
 */

function formatDiff(d) {
  if (d > 0) return `+${d}`;
  return String(d);
}

/**
 * Shared standings UI for admin reports and student leaderboard (`variant` controls copy and chrome only).
 *
 * @param {{ variant: "admin" | "student"; rows: LeaderboardRow[]; eventTitle?: string; sportType?: string }} props
 */
export function StandingsTable({ variant, rows, eventTitle, sportType }) {
  const isStudent = variant === "student";

  if (!rows.length) {
    if (isStudent) {
      return (
        <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-10 text-center text-sm text-gray-500">
          {eventTitle
            ? `No recorded results for “${eventTitle}” yet. Check back after matches are played and results are posted.`
            : "No standings to show yet. Pick an event above."}
        </p>
      );
    }
    return (
      <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-12 text-center text-sm text-gray-500">
        {eventTitle
          ? `No recorded results for “${eventTitle}” yet. Enter results in result management to populate the table.`
          : "No standings to show. Select an event or record match results first."}
      </p>
    );
  }

  if (!isStudent) {
    return (
      <>
        <ul className="space-y-3 lg:hidden">
          {rows.map((row, i) => (
            <li
              key={row.teamId}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm ring-1 ring-gray-100"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-gray-400">#{i + 1}</span>
                  <p className="mt-0.5 font-bold text-gray-900">{row.teamName}</p>
                </div>
                <span className="rounded-lg bg-blue-600 px-2.5 py-1 text-sm font-black text-white">{row.points} pts</span>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                  <dt className="font-semibold text-gray-500">Played</dt>
                  <dd>{row.played}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-500">W-D-L</dt>
                  <dd>
                    {row.wins}-{row.draws}-{row.losses}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-500">For</dt>
                  <dd>{row.goalsFor}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-500">Against</dt>
                  <dd>{row.goalsAgainst}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="font-semibold text-gray-500">Diff</dt>
                  <dd>{formatDiff(row.goalDifference)}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>

        <div className="hidden overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm ring-1 ring-gray-100 lg:block">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="px-3 py-3 pl-4 font-bold text-gray-700">#</th>
                <th className="px-3 py-3 font-bold text-gray-700">Team</th>
                <th className="px-3 py-3 text-center font-bold text-gray-700">P</th>
                <th className="px-3 py-3 text-center font-bold text-gray-700">W</th>
                <th className="px-3 py-3 text-center font-bold text-gray-700">D</th>
                <th className="px-3 py-3 text-center font-bold text-gray-700">L</th>
                <th className="px-3 py-3 text-center font-bold text-gray-700" title="Total score for this team">
                  For
                </th>
                <th className="px-3 py-3 text-center font-bold text-gray-700" title="Total score conceded">
                  Against
                </th>
                <th className="px-3 py-3 text-center font-bold text-gray-700" title="For minus against">
                  Diff
                </th>
                <th className="px-3 py-3 pr-4 text-center font-black text-gray-900">Pts</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.teamId} className="border-b border-gray-50 last:border-0">
                  <td className="px-3 py-3 pl-4 font-semibold text-gray-500">{i + 1}</td>
                  <td className="px-3 py-3 font-semibold text-gray-900">{row.teamName}</td>
                  <td className="px-3 py-3 text-center text-gray-700">{row.played}</td>
                  <td className="px-3 py-3 text-center text-gray-700">{row.wins}</td>
                  <td className="px-3 py-3 text-center text-gray-700">{row.draws}</td>
                  <td className="px-3 py-3 text-center text-gray-700">{row.losses}</td>
                  <td className="px-3 py-3 text-center text-gray-700">{row.goalsFor}</td>
                  <td className="px-3 py-3 text-center text-gray-700">{row.goalsAgainst}</td>
                  <td className="px-3 py-3 text-center text-gray-700">{formatDiff(row.goalDifference)}</td>
                  <td className="px-3 py-3 pr-4 text-center text-base font-black text-blue-700">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm ring-1 ring-gray-100">
      <div className="border-b border-gray-100 bg-gradient-to-br from-blue-50/80 to-white px-4 py-6 sm:px-6">
        {sportType ? (
          <p className="text-center text-xs font-bold uppercase tracking-wide text-blue-700">{sportType}</p>
        ) : null}
        <p className="mt-1 text-center text-lg font-black text-gray-900 sm:text-xl">
          {eventTitle ? <>{eventTitle}</> : "Standings"}
        </p>
        <p className="mt-2 text-center text-xs text-gray-500">
          3 pts win · 1 pt draw · ordered by points, then score difference (for minus against)
        </p>
      </div>

      <div className="p-4 sm:p-6">
        <ul className="space-y-3 lg:hidden">
          {rows.map((row, i) => (
            <li
              key={row.teamId}
              className="rounded-xl border border-gray-100 bg-gray-50/40 p-4 ring-1 ring-gray-100/80"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-blue-600">#{i + 1}</span>
                  <p className="mt-0.5 font-bold text-gray-900">{row.teamName}</p>
                </div>
                <span className="shrink-0 rounded-lg bg-blue-600 px-2.5 py-1 text-sm font-black text-white shadow-sm shadow-blue-200">
                  {row.points} pts
                </span>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-gray-100 pt-3 text-xs text-gray-600">
                <div>
                  <dt className="font-semibold text-gray-500">Played</dt>
                  <dd className="font-medium text-gray-800">{row.played}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-500">W-D-L</dt>
                  <dd className="font-medium text-gray-800">
                    {row.wins}-{row.draws}-{row.losses}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-500">For</dt>
                  <dd className="font-medium text-gray-800">{row.goalsFor}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-500">Against</dt>
                  <dd className="font-medium text-gray-800">{row.goalsAgainst}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="font-semibold text-gray-500">Diff</dt>
                  <dd className="font-medium text-gray-800">{formatDiff(row.goalDifference)}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="px-3 py-3 pl-2 font-bold text-gray-700">#</th>
                <th className="px-3 py-3 font-bold text-gray-700">Team</th>
                <th className="px-3 py-3 text-center font-bold text-gray-700">P</th>
                <th className="px-3 py-3 text-center font-bold text-gray-700">W</th>
                <th className="px-3 py-3 text-center font-bold text-gray-700">D</th>
                <th className="px-3 py-3 text-center font-bold text-gray-700">L</th>
                <th className="px-3 py-3 text-center font-bold text-gray-700" title="Total score for this team">
                  For
                </th>
                <th className="px-3 py-3 text-center font-bold text-gray-700" title="Total score conceded">
                  Against
                </th>
                <th className="px-3 py-3 text-center font-bold text-gray-700" title="For minus against">
                  Diff
                </th>
                <th className="px-3 py-3 pr-2 text-center font-black text-blue-700">Pts</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.teamId} className="border-b border-gray-50 last:border-0">
                  <td className="px-3 py-3 pl-2 font-semibold text-blue-600">{i + 1}</td>
                  <td className="px-3 py-3 font-semibold text-gray-900">{row.teamName}</td>
                  <td className="px-3 py-3 text-center text-gray-700">{row.played}</td>
                  <td className="px-3 py-3 text-center text-gray-700">{row.wins}</td>
                  <td className="px-3 py-3 text-center text-gray-700">{row.draws}</td>
                  <td className="px-3 py-3 text-center text-gray-700">{row.losses}</td>
                  <td className="px-3 py-3 text-center text-gray-700">{row.goalsFor}</td>
                  <td className="px-3 py-3 text-center text-gray-700">{row.goalsAgainst}</td>
                  <td className="px-3 py-3 text-center text-gray-700">{formatDiff(row.goalDifference)}</td>
                  <td className="px-3 py-3 pr-2 text-center text-base font-black text-blue-700">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
