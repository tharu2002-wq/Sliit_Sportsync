import { TextAreaField } from "../../ui/TextAreaField";
import { TextField } from "../../ui/TextField";
import { ResultWinnerPreview } from "./ResultWinnerPreview";

/**
 * @param {{
 *   teamAName: string;
 *   teamBName: string;
 *   scoreA: string;
 *   scoreB: string;
 *   notes: string;
 *   onScoreAChange: (v: string) => void;
 *   onScoreBChange: (v: string) => void;
 *   onNotesChange: (v: string) => void;
 *   errors?: { scoreA?: string; scoreB?: string; notes?: string };
 *   showWinnerPreview?: boolean;
 * }} props
 */
export function ResultScoreFields({
  teamAName,
  teamBName,
  scoreA,
  scoreB,
  notes,
  onScoreAChange,
  onScoreBChange,
  onNotesChange,
  errors = {},
  showWinnerPreview = true,
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="result-score-a"
          name="scoreA"
          label={`Score — ${teamAName}`}
          type="number"
          min={0}
          value={scoreA}
          onChange={(e) => onScoreAChange(e.target.value)}
          error={errors.scoreA}
          required
        />
        <TextField
          id="result-score-b"
          name="scoreB"
          label={`Score — ${teamBName}`}
          type="number"
          min={0}
          value={scoreB}
          onChange={(e) => onScoreBChange(e.target.value)}
          error={errors.scoreB}
          required
        />
      </div>

      {showWinnerPreview ? (
        <ResultWinnerPreview
          scoreAStr={scoreA}
          scoreBStr={scoreB}
          teamAName={teamAName}
          teamBName={teamBName}
        />
      ) : null}

      <TextAreaField
        id="result-notes"
        name="notes"
        label="Notes (optional)"
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        error={errors.notes}
        rows={3}
        placeholder="Optional match notes…"
      />
    </div>
  );
}
