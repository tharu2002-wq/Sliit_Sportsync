/**
 * Admin control panel sidebar (paths under `/admin`).
 */
export const ADMIN_NAV_ITEMS = [
  { segment: "overview", label: "Dashboard Overview" },
  { segment: "events", label: "Event Management" },
  { segment: "matches", label: "Match Management" },
  { segment: "teams", label: "Team Management" },
  { segment: "players", label: "Player Management" },
  { segment: "player-requests", label: "Player requests" },
  { segment: "venues", label: "Venue Management" },
  { segment: "results", label: "Result Management" },
  { segment: "leaderboard-reports", label: "Leaderboard & Reports" },
  { segment: "users", label: "User Management" },
  { segment: "settings", label: "Profile & Settings" },
];

export function getAdminNavLabelFromPath(pathname) {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "admin") return "Admin";
  const segment = parts[1] ?? "overview";
  const item = ADMIN_NAV_ITEMS.find((n) => n.segment === segment);
  return item?.label ?? "Admin";
}
