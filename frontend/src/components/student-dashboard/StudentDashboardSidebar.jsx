import { useNavigate } from "react-router-dom";
import userAvatar from "../../assets/user.png";
import { useAuth } from "../../contexts/AuthContext";
import { STUDENT_NAV_ITEMS } from "../../constants/studentDashboardNav";
import { cn } from "../../utils/cn";
import { DashboardNavLink } from "../ui/DashboardNavLink";
import { StudentDashboardBrand } from "./StudentDashboardBrand";

export function StudentDashboardSidebar({ className, onNavigate }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onNavigate?.();
    navigate("/", { replace: true });
  };

  return (
    <div className={cn("flex h-full min-h-0 flex-col overflow-hidden border-r border-gray-100 bg-white", className)}>
      <div className="border-b border-gray-100 p-4">
        <StudentDashboardBrand onNavigate={onNavigate} />
        <div className="mt-4 flex flex-col items-center">
          <div className="rounded-full bg-blue-50 p-1 ring-2 ring-blue-100 shadow-sm">
            <img
              src={userAvatar}
              alt={user?.name ? `${user.name}'s profile photo` : "Student profile photo"}
              width={80}
              height={80}
              className="h-20 w-20 rounded-full object-cover"
              decoding="async"
            />
          </div>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-widest text-blue-700">Student</p>
          {user?.name ? (
            <p className="mt-1 max-w-full truncate text-center text-xs text-gray-500">
              Signed in as <span className="font-semibold text-gray-700">{user.name}</span>
            </p>
          ) : null}
        </div>
      </div>

      <nav
        className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3 lg:overflow-hidden"
        aria-label="Student dashboard"
      >
        {STUDENT_NAV_ITEMS.map(({ segment, label }) => (
          <DashboardNavLink key={segment} to={`/student/${segment}`} onClick={onNavigate}>
            {label}
          </DashboardNavLink>
        ))}
      </nav>

      <footer className="border-t border-gray-100 px-3 py-3 text-center">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">SLIIT SportSync</p>
        <p className="mt-1 text-[10px] leading-snug text-gray-400">Student sports portal</p>
      </footer>

      <div className="border-t border-gray-100 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center rounded-xl border-2 border-red-100 bg-white px-3 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
