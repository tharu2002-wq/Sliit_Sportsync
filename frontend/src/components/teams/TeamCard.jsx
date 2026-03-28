import { Button } from "../ui/Button";
import { cn } from "../../utils/cn";

function ActiveBadge({ active }) {
  const on = active !== false;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ring-1",
        on ? "bg-emerald-50 text-emerald-800 ring-emerald-100" : "bg-gray-100 text-gray-600 ring-gray-200"
      )}
    >
      {on ? "Active" : "Inactive"}
    </span>
  );
}

/**
 * Team summary card with image, meta, and link to detail route.
 */
export function TeamCard({ team, imageSrc, detailTo, className }) {
  const captainName = team.captain?.fullName ?? "—";
  const memberCount = Array.isArray(team.members) ? team.members.length : 0;
  const summary =
    memberCount === 0
      ? "Roster will appear here once players are assigned."
      : `${memberCount} player${memberCount === 1 ? "" : "s"} on the roster.`;

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
          <ActiveBadge active={team.isActive} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="mb-1 text-xs font-bold uppercase tracking-wide text-blue-700">{team.sportType}</p>
        <h3 className="text-lg font-black leading-tight tracking-tight text-gray-900">{team.teamName}</h3>
        <p className="mt-2 text-sm text-gray-600">
          <span className="font-semibold text-gray-500">Captain:</span> {captainName}
        </p>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-gray-500">{summary}</p>
        <p className="mb-4 mt-2 text-xs text-gray-400">
          <span className="font-semibold text-gray-500">Updated:</span>{" "}
          {team.updatedAt
            ? new Date(team.updatedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "—"}
        </p>
        <Button type="button" variant="outline" size="sm" fullWidth to={detailTo} className="mt-auto">
          View details
        </Button>
      </div>
    </article>
  );
}
