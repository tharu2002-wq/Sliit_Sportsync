/**
 * @param {unknown} result API result with populated `match` or raw id
 * @returns {string}
 */
export function getResultMatchId(result) {
  const m = result?.match;
  if (!m) return "";
  if (typeof m === "object" && m !== null && "_id" in m) {
    return String(/** @type {{ _id: string }} */ (m)._id);
  }
  return String(m);
}

/**
 * Matches that can still receive a result (not cancelled, no row in results yet).
 * @param {unknown[]} matches
 * @param {unknown[]} results
 */
export function matchesAwaitingResult(matches, results) {
  if (!Array.isArray(matches)) return [];
  const withResult = new Set(
    (Array.isArray(results) ? results : []).map((r) => getResultMatchId(r)).filter(Boolean)
  );
  return matches.filter((m) => {
    if (!m || m.status === "cancelled") return false;
    return !withResult.has(String(m._id));
  });
}

/**
 * @param {unknown} result
 * @returns {string}
 */
export function formatResultWinnerLabel(result) {
  if (!result) return "—";
  if (result.winner?.teamName) return result.winner.teamName;
  const sa = Number(result.scoreA);
  const sb = Number(result.scoreB);
  if (!Number.isNaN(sa) && !Number.isNaN(sb) && sa === sb) return "Draw";
  return "—";
}

/**
 * Preview winner from scores (mirrors backend tie → no winner).
 * @param {number} scoreA
 * @param {number} scoreB
 * @param {string} teamAName
 * @param {string} teamBName
 */
export function previewWinnerTeamName(scoreA, scoreB, teamAName, teamBName) {
  if (Number.isNaN(scoreA) || Number.isNaN(scoreB)) return null;
  if (scoreA > scoreB) return teamAName;
  if (scoreB > scoreA) return teamBName;
  return null;
}

/**
 * @param {unknown[]} results
 * @param {string} searchQuery
 */
export function filterResults(results, searchQuery) {
  if (!Array.isArray(results)) return [];
  const q = searchQuery.trim().toLowerCase();
  if (!q) return results;
  return results.filter((r) => {
    const m = r?.match;
    const blob = [
      m?.event?.title,
      m?.teamA?.teamName,
      m?.teamB?.teamName,
      m?.venue?.venueName,
      String(r?.scoreA ?? ""),
      String(r?.scoreB ?? ""),
      formatResultWinnerLabel(r),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return blob.includes(q);
  });
}
