/**
 * Match populate with team rosters (captain + members as Player docs).
 * Use for result entry and match detail APIs that need player lists.
 */
const MATCH_DETAIL_POPULATE = [
  { path: "event", select: "title sportType startDate endDate status description" },
  {
    path: "teamA",
    select: "teamName sportType captain members",
    populate: [
      { path: "captain", select: "fullName studentId" },
      { path: "members", select: "fullName studentId" },
    ],
  },
  {
    path: "teamB",
    select: "teamName sportType captain members",
    populate: [
      { path: "captain", select: "fullName studentId" },
      { path: "members", select: "fullName studentId" },
    ],
  },
  { path: "venue", select: "venueName location capacity status" },
];

module.exports = { MATCH_DETAIL_POPULATE };
