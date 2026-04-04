import { useNavigate } from "react-router-dom";
import userAvatar from "../../assets/user.png";
import { ADMIN_NAV_ITEMS } from "../../constants/adminDashboardNav";
import { useAuth } from "../../contexts/AuthContext";
import { cn } from "../../utils/cn";
import { DashboardNavLink } from "../ui/DashboardNavLink";
import { AdminDashboardBrand } from "./AdminDashboardBrand";

export function AdminDashboardSidebar({ className, onNavigate }) {
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
        <AdminDashboardBrand onNavigate={onNavigate} />
        <div className="mt-4 flex flex-col items-center">
          <div className="rounded-full bg-slate-50 p-1 ring-2 ring-slate-200 shadow-sm">
            <img
              src={userAvatar}
              alt={user?.name ? `${user.name}'s profile photo` : "Admin profile photo"}
              width={80}
              height={80}
              className="h-20 w-20 rounded-full object-cover"
              decoding="async"
            />
          </div>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-widest text-slate-700">Administrator</p>
          {user?.name ? (
            <p className="mt-1 max-w-full truncate text-center text-xs text-gray-500">
              Signed in as <span className="font-semibold text-gray-700">{user.name}</span>
            </p>
          ) : null}
        </div>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3" aria-label="Admin dashboard">
        {ADMIN_NAV_ITEMS.map(({ segment, label }) => (
          <DashboardNavLink key={segment} to={`/admin/${segment}`} onClick={onNavigate}>
            {label}
          </DashboardNavLink>
        ))}
      </nav>

      <div className="shrink-0 border-t border-gray-100 p-3">
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
