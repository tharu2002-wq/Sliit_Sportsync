import { cn } from "../../../utils/cn";

/**
 * Multi-select teams for an event (existing teams only).
 */
export function TeamPicker({ teams, selectedIds, onChange, disabled, sportTypeHint }) {
  const selectedSet = new Set(selectedIds.map(String));

  const toggle = (id) => {
    const next = new Set(selectedSet);
    const sid = String(id);
    if (next.has(sid)) next.delete(sid);
    else next.add(sid);
    onChange([...next]);
  };

  const filtered = sportTypeHint
    ? teams.filter((t) => !t.sportType || t.sportType === sportTypeHint)
    : teams;

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="max-h-56 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <p className="px-2 py-3 text-sm text-gray-500">
            {teams.length === 0
              ? "No teams in the system yet. Create teams first."
              : "No teams match the selected sport type. Clear or change the sport type."}
          </p>
        ) : (
          <ul className="space-y-1">
            {filtered.map((team) => {
              const id = String(team._id);
              const checked = selectedSet.has(id);
              return (
                <li key={id}>
                  <label
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-gray-50",
                      disabled && "cursor-not-allowed opacity-60"
                    )}
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggle(id)}
                    />
                    <span className="min-w-0 flex-1 text-sm">
                      <span className="font-semibold text-gray-900">{team.teamName}</span>
                      <span className="block text-xs text-gray-500">{team.sportType}</span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
