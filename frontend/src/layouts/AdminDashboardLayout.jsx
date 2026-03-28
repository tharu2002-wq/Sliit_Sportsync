import { AdminDashboardSidebar } from "../components/admin-dashboard/AdminDashboardSidebar";
import { AdminDashboardTopBar } from "../components/admin-dashboard/AdminDashboardTopBar";
import { DashboardShell } from "./DashboardShell";

export function AdminDashboardLayout() {
  return (
    <DashboardShell
      sidebar={AdminDashboardSidebar}
      topBar={AdminDashboardTopBar}
      mainClassName="bg-gray-50/50 px-4 py-6 md:px-8 md:py-8"
    />
  );
}
