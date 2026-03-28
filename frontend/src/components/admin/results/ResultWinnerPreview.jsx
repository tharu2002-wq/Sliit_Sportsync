import { previewWinnerTeamName } from "../../../utils/resultDisplayUtils";

/**
 * Read-only hint: how the backend will set winner from scores.
 */
export function ResultWinnerPreview({ scoreAStr, scoreBStr, teamAName, teamBName }) {
  const sa = Number(scoreAStr);
  const sb = Number(scoreBStr);
  const winner = previewWinnerTeamName(sa, sb, teamAName, teamBName);

  let text = "Enter both scores to see the winner.";
  if (!Number.isNaN(sa) && !Number.isNaN(sb)) {
    if (winner) {
      text = `Winner will be recorded as: ${winner}`;
    } else {
      text = "Scores are level — result will be recorded as a draw (no single winner).";
    }
  }

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/80 px-4 py-3 text-sm text-blue-900">
      <span className="font-semibold">Auto-calculated: </span>
      {text}
    </div>
  );
}
