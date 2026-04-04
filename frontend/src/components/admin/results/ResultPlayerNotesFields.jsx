import { TextAreaField } from "../../ui/TextAreaField";

/**
 * @param {{
 *   teamName: string;
 *   players: Array<{ _id: string; fullName: string; studentId?: string }>;
 *   notesByPlayerId: Record<string, string>;
 *   onPlayerNoteChange: (playerId: string, note: string) => void;
 *   errors?: Record<string, string>;
 * }} props
 */
export function ResultPlayerNotesFields({
  teamName,
  players,
  notesByPlayerId,
  onPlayerNoteChange,
  errors = {},
}) {
  if (players.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-3 text-sm text-gray-600">
        No players listed for <span className="font-semibold text-gray-800">{teamName}</span>. Add a captain and members
        in team management.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {players.map((p) => (
        <div key={p._id}>
          <TextAreaField
            id={`player-note-${p._id}`}
            name={`playerNote_${p._id}`}
            label={
              <span>
                <span className="font-semibold text-gray-900">{p.fullName}</span>
                {p.studentId ? (
                  <span className="ml-1.5 font-normal text-gray-500">({p.studentId})</span>
                ) : null}
              </span>
            }
            value={notesByPlayerId[p._id] ?? ""}
            onChange={(e) => onPlayerNoteChange(p._id, e.target.value)}
            error={errors[p._id]}
            rows={2}
            placeholder="Optional note for this player…"
          />
        </div>
      ))}
    </div>
  );
}
