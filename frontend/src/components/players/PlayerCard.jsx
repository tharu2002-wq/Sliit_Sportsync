import { Button } from "../ui/Button";
import { cn } from "../../utils/cn";
import { formatPlayerTeamsLine } from "../../utils/playerDisplayUtils";
import { formatGender } from "../../utils/playerUtils";

/**
 * Player summary card with image, meta, and link to detail route.
 */
export function PlayerCard({ player, imageSrc, detailTo, className }) {
  const sports = Array.isArray(player.sportTypes) ? player.sportTypes.filter(Boolean) : [];
  const sportsPreview = sports.slice(0, 2);
  const more = sports.length > 2 ? ` +${sports.length - 2}` : "";
  const teamsFormatted = formatPlayerTeamsLine(player);
  const teamLine = teamsFormatted !== "—" ? teamsFormatted : "No team assigned yet";

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
          <span className="inline-flex rounded-full bg-white/95 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-blue-800 ring-1 ring-blue-100 shadow-sm">
            {formatGender(player.gender)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-black leading-tight tracking-tight text-gray-900">{player.fullName}</h3>
        <p className="mt-1 text-sm text-gray-600">{player.department}</p>
        <p className="mt-2 text-xs text-gray-500">
          <span className="font-semibold text-gray-600">ID:</span> {player.studentId}
        </p>
        <p className="mt-1 text-sm text-gray-700">
          <span className="font-semibold text-gray-500">Team:</span> {teamLine}
        </p>
        {sportsPreview.length > 0 ? (
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
            {sportsPreview.join(" · ")}
            {more}
          </p>
        ) : (
          <p className="mt-2 text-xs text-gray-400">Sports not set</p>
        )}
        <p className="mt-3 line-clamp-2 flex-1 text-sm text-gray-500">
          {player.email ? `${player.email}` : "—"}
        </p>
        <Button type="button" variant="outline" size="sm" fullWidth to={detailTo} className="mt-auto">
          View details
        </Button>
      </div>
    </article>
  );
}
