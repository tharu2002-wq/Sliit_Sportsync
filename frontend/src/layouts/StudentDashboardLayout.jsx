import { StudentDashboardSidebar } from "../components/student-dashboard/StudentDashboardSidebar";
import { StudentDashboardTopBar } from "../components/student-dashboard/StudentDashboardTopBar";
import { DashboardShell } from "./DashboardShell";

export function StudentDashboardLayout() {
  return (
    <DashboardShell
      sidebar={StudentDashboardSidebar}
      topBar={StudentDashboardTopBar}
      mainClassName="bg-white px-4 py-6 md:px-8 md:py-8"
    />
  );
}
