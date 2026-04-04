import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { RequireAuth } from "./components/auth/RequireAuth";
import { RequireRole } from "./components/auth/RequireRole";
import { ADMIN_NAV_ITEMS } from "./constants/adminDashboardNav";
import { AdminDashboardLayout } from "./layouts/AdminDashboardLayout";
import { StudentDashboardLayout } from "./layouts/StudentDashboardLayout";
import AdminSectionPage from "./pages/admin/AdminSectionPage";
import AdminEventFormPage from "./pages/admin/events/AdminEventFormPage";
import AdminEventsListPage from "./pages/admin/events/AdminEventsListPage";
import AdminMatchFormPage from "./pages/admin/matches/AdminMatchFormPage";
import AdminMatchesListPage from "./pages/admin/matches/AdminMatchesListPage";
import AdminTeamCreatePage from "./pages/admin/teams/AdminTeamCreatePage";
import AdminTeamDetailPage from "./pages/admin/teams/AdminTeamDetailPage";
import AdminPlayerFormPage from "./pages/admin/players/AdminPlayerFormPage";
import AdminPlayersListPage from "./pages/admin/players/AdminPlayersListPage";
import AdminPlayerRequestsPage from "./pages/admin/player-requests/AdminPlayerRequestsPage";
import AdminTeamsListPage from "./pages/admin/teams/AdminTeamsListPage";
import AdminVenueFormPage from "./pages/admin/venues/AdminVenueFormPage";
import AdminVenuesListPage from "./pages/admin/venues/AdminVenuesListPage";
import AdminResultFormPage from "./pages/admin/results/AdminResultFormPage";
import AdminResultsListPage from "./pages/admin/results/AdminResultsListPage";
import AdminLeaderboardPage from "./pages/admin/leaderboard/AdminLeaderboardPage";
import AdminDashboardOverviewPage from "./pages/admin/AdminDashboardOverviewPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import StudentEventDetailPage from "./pages/student/events/StudentEventDetailPage";
import StudentEventsPage from "./pages/student/events/StudentEventsPage";
import StudentMatchDetailPage from "./pages/student/matches/StudentMatchDetailPage";
import StudentMatchResultPage from "./pages/student/matches/StudentMatchResultPage";
import StudentMatchesPage from "./pages/student/matches/StudentMatchesPage";
import StudentSectionPage from "./pages/student/StudentSectionPage";
import StudentPlayerDetailPage from "./pages/student/players/StudentPlayerDetailPage";
import StudentPlayersPage from "./pages/student/players/StudentPlayersPage";
import StudentTeamDetailPage from "./pages/student/teams/StudentTeamDetailPage";
import StudentTeamsPage from "./pages/student/teams/StudentTeamsPage";
import StudentVenueDetailPage from "./pages/student/venues/StudentVenueDetailPage";
import StudentVenuesPage from "./pages/student/venues/StudentVenuesPage";
import StudentLeaderboardPage from "./pages/student/leaderboard/StudentLeaderboardPage";
import StudentEditProfilePage from "./pages/student/profile/StudentEditProfilePage";

const ADMIN_PLACEHOLDER_SEGMENTS = ADMIN_NAV_ITEMS.filter(
  ({ segment }) =>
    segment !== "overview" &&
    segment !== "events" &&
    segment !== "matches" &&
    segment !== "teams" &&
    segment !== "players" &&
    segment !== "player-requests" &&
    segment !== "venues" &&
    segment !== "results" &&
    segment !== "leaderboard-reports"
);

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <RequireRole roles="admin">
              <AdminDashboardLayout />
            </RequireRole>
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<AdminDashboardOverviewPage />} />
        <Route path="events" element={<Outlet />}>
          <Route index element={<AdminEventsListPage />} />
          <Route path="new" element={<AdminEventFormPage />} />
          <Route path=":eventId/edit" element={<AdminEventFormPage />} />
        </Route>
        <Route path="matches" element={<Outlet />}>
          <Route index element={<AdminMatchesListPage />} />
          <Route path="new" element={<AdminMatchFormPage />} />
          <Route path=":matchId/edit" element={<AdminMatchFormPage />} />
        </Route>
        <Route path="teams" element={<Outlet />}>
          <Route index element={<AdminTeamsListPage />} />
          <Route path="new" element={<AdminTeamCreatePage />} />
          <Route path=":teamId" element={<AdminTeamDetailPage />} />
        </Route>
        <Route path="players" element={<Outlet />}>
          <Route index element={<AdminPlayersListPage />} />
          <Route path="new" element={<AdminPlayerFormPage />} />
          <Route path=":playerId/edit" element={<AdminPlayerFormPage />} />
        </Route>
        <Route path="player-requests" element={<AdminPlayerRequestsPage />} />
        <Route path="venues" element={<Outlet />}>
          <Route index element={<AdminVenuesListPage />} />
          <Route path="new" element={<AdminVenueFormPage />} />
          <Route path=":venueId/edit" element={<AdminVenueFormPage />} />
        </Route>
        <Route path="results" element={<Outlet />}>
          <Route index element={<AdminResultsListPage />} />
          <Route path="new" element={<AdminResultFormPage />} />
          <Route path=":resultId/edit" element={<AdminResultFormPage />} />
        </Route>
        <Route path="leaderboard-reports" element={<AdminLeaderboardPage />} />
        {ADMIN_PLACEHOLDER_SEGMENTS.map(({ segment }) => (
          <Route key={segment} path={segment} element={<AdminSectionPage />} />
        ))}
      </Route>
      <Route
        path="/student"
        element={
          <RequireAuth>
            <RequireRole roles="student">
              <StudentDashboardLayout />
            </RequireRole>
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="events" replace />} />
        <Route path="events" element={<Outlet />}>
          <Route index element={<StudentEventsPage />} />
          <Route path=":eventId" element={<StudentEventDetailPage />} />
        </Route>
        <Route path="matches" element={<Outlet />}>
          <Route index element={<StudentMatchesPage />} />
          <Route path=":matchId/result" element={<StudentMatchResultPage />} />
          <Route path=":matchId" element={<StudentMatchDetailPage />} />
        </Route>
        <Route path="teams" element={<Outlet />}>
          <Route index element={<StudentTeamsPage />} />
          <Route path=":teamId" element={<StudentTeamDetailPage />} />
        </Route>
        <Route path="players" element={<Outlet />}>
          <Route index element={<StudentPlayersPage />} />
          <Route path=":playerId" element={<StudentPlayerDetailPage />} />
        </Route>
        <Route path="venues" element={<Outlet />}>
          <Route index element={<StudentVenuesPage />} />
          <Route path=":venueId" element={<StudentVenueDetailPage />} />
        </Route>
        <Route path="leaderboard" element={<StudentLeaderboardPage />} />
        <Route path="profile/edit" element={<StudentEditProfilePage />} />
        <Route path=":section" element={<StudentSectionPage />} />
      </Route>
    </Routes>
  );
}

export default App;
