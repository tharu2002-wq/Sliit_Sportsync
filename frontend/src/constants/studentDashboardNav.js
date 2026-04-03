/**
 * Student dashboard sidebar items (path segments under `/student`).
 * Logout is handled separately (not a route).
 */
export const STUDENT_NAV_ITEMS = [
  { segment: "events", label: "Events" },
  { segment: "matches", label: "Matches" },
  { segment: "teams", label: "Teams" },
  { segment: "players", label: "Players" },
  { segment: "venues", label: "Venues" },
  { segment: "leaderboard", label: "Leaderboard" },
  { segment: "profile", label: "Profile" },
];

export function getNavLabelFromPath(pathname) {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] === "student" && parts[1] === "events" && parts.length > 2) {
    return "Events";
  }
  if (parts[0] === "student" && parts[1] === "matches" && parts.length > 2) {
    return "Matches";
  }
  if (parts[0] === "student" && parts[1] === "teams" && parts.length > 2) {
    return "Teams";
  }
  if (parts[0] === "student" && parts[1] === "players" && parts.length > 2) {
    return "Players";
  }
  if (parts[0] === "student" && parts[1] === "venues" && parts.length > 2) {
    return "Venues";
  }
  if (parts[0] === "student" && parts[1] === "leaderboard") {
    return "Leaderboard";
  }
  if (parts[0] === "student" && parts[1] === "profile" && parts[2] === "edit") {
    return "Edit profile";
  }
  const segment = parts[parts.length - 1] ?? "";
  const item = STUDENT_NAV_ITEMS.find((n) => n.segment === segment);
  return item?.label ?? "Dashboard";
}
