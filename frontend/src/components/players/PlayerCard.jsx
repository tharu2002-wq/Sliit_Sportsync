import { Button } from "../ui/Button";
import { cn } from "../../utils/cn";
import { formatPlayerTeamsLine } from "../../utils/playerDisplayUtils";
import { formatGender } from "../../utils/playerUtils";

/**
 * Player summary card with image, meta, and link to detail route.
 *
 * @param {{ compact?: boolean }} [props] — `compact` uses a denser layout (e.g. profile participation).
 */
export function PlayerCard({ player, imageSrc, detailTo, className, compact = false }) {
  const sports = Array.isArray(player.sportTypes) ? player.sportTypes.filter(Boolean) : [];
  const sportsPreview = sports.slice(0, 2);
  const more = sports.length > 2 ? ` +${sports.length - 2}` : "";
  const teamsFormatted = formatPlayerTeamsLine(player);
  const teamLine = teamsFormatted !== "—" ? teamsFormatted : "No team assigned yet";

  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm ring-1 ring-gray-100 transition-shadow hover:shadow-md",
        compact && "rounded-xl",
        className
      )}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden bg-gray-100",
          compact ? "aspect-[16/6] max-h-[88px]" : "aspect-[16/10]"
        )}
      >
        <img
          src={imageSrc}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div className={cn("absolute", compact ? "left-2 top-2" : "left-3 top-3")}>
          <span
            className={cn(
              "inline-flex rounded-full bg-white/95 font-bold uppercase tracking-wide text-blue-800 ring-1 ring-blue-100 shadow-sm",
              compact ? "px-2 py-px text-[10px]" : "px-2.5 py-0.5 text-xs"
            )}
          >
            {formatGender(player.gender)}
          </span>
        </div>
      </div>

      <div className={cn("flex flex-1 flex-col", compact ? "gap-0.5 p-3" : "p-4")}>
        <h3
          className={cn(
            "font-black leading-tight tracking-tight text-gray-900",
            compact ? "text-sm" : "text-lg"
          )}
        >
          {player.fullName}
        </h3>
        <p className={cn("text-gray-600", compact ? "text-xs" : "mt-1 text-sm")}>{player.department}</p>
        <p className={cn("text-gray-500", compact ? "mt-1 text-[11px]" : "mt-2 text-xs")}>
          <span className="font-semibold text-gray-600">ID:</span> {player.studentId}
        </p>
        <p className={cn("text-gray-700", compact ? "text-xs leading-snug" : "mt-1 text-sm")}>
          <span className="font-semibold text-gray-500">Team:</span>{" "}
          <span className={compact ? "line-clamp-1" : ""}>{teamLine}</span>
        </p>
        {sportsPreview.length > 0 ? (
          <p
            className={cn(
              "font-semibold uppercase tracking-wide text-blue-700",
              compact ? "mt-1 text-[10px] leading-tight" : "mt-2 text-xs"
            )}
          >
            {sportsPreview.join(" · ")}
            {more}
          </p>
        ) : (
          <p className={cn("text-gray-400", compact ? "mt-1 text-[10px]" : "mt-2 text-xs")}>Sports not set</p>
        )}
        <p
          className={cn(
            "line-clamp-1 text-gray-500",
            compact ? "mt-1 text-[11px]" : "mt-3 line-clamp-2 flex-1 text-sm"
          )}
        >
          {player.email ? `${player.email}` : "—"}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          fullWidth
          to={detailTo}
          className={cn("mt-auto", compact && "mt-2 py-1.5 text-xs")}
        >
          View details
        </Button>
      </div>
    </article>
  );
}
