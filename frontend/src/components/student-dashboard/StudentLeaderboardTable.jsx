import { StandingsTable } from "../leaderboard/StandingsTable";

/** Student dashboard standings — same API as before, implemented via shared {@link StandingsTable}. */
export function StudentLeaderboardTable(props) {
  return <StandingsTable variant="student" {...props} />;
}
