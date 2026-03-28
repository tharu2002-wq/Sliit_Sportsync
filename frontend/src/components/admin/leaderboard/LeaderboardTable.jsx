import { StandingsTable } from "../../leaderboard/StandingsTable";

/** Admin leaderboard / reports — same API as before, implemented via shared {@link StandingsTable}. */
export function LeaderboardTable(props) {
  return <StandingsTable variant="admin" {...props} />;
}
