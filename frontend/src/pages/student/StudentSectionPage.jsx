import { Navigate, useParams } from "react-router-dom";
import { STUDENT_NAV_ITEMS } from "../../constants/studentDashboardNav";
import { DashboardPageHeader } from "../../components/student-dashboard/DashboardPageHeader";
import { DashboardPlaceholder } from "../../components/student-dashboard/DashboardPlaceholder";
import StudentProfilePage from "./profile/StudentProfilePage";

const ALLOWED = new Set(STUDENT_NAV_ITEMS.map((i) => i.segment));

/** Short descriptions per area (UI only until API exists). */
const SECTION_BLURB = {
  events: "Browse and register for campus sports events.",
  matches: "View fixtures, scores, and schedules for matches you follow.",
  teams: "Explore teams and rosters across SLIIT sports.",
  players: "Discover player profiles and athletic activity.",
  venues: "Explore sports and event spaces across the SLIIT campus.",
  leaderboard: "Rankings and standings across events and disciplines.",
};

export default function StudentSectionPage() {
  const { section } = useParams();

  if (!section || !ALLOWED.has(section)) {
    return <Navigate to="/student/events" replace />;
  }

  if (section === "profile") {
    return <StudentProfilePage />;
  }

  if (section === "leaderboard") {
    return (
      <>
        <DashboardPageHeader
          title="Leaderboard"
          description={SECTION_BLURB.leaderboard}
        />
        <div
          className="mt-6 rounded-2xl border border-dashed border-amber-200 bg-amber-50/90 px-6 py-12 text-center shadow-sm"
          role="status"
        >
          <p className="text-lg font-black tracking-tight text-amber-900">Coming soon</p>
          <p className="mt-2 text-sm text-amber-800/95">
            The leaderboard is under development. Check back later for rankings and standings.
          </p>
        </div>
      </>
    );
  }

  const item = STUDENT_NAV_ITEMS.find((i) => i.segment === section);
  const title = item?.label ?? "Dashboard";
  const description = SECTION_BLURB[section] ?? "";

  return (
    <>
      <DashboardPageHeader title={title} description={description} />
      <DashboardPlaceholder title={title} />
    </>
  );
}
