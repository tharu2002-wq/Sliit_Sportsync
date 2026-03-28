import { NavLink } from "react-router-dom";
import { cn } from "../../utils/cn";

const base =
  "flex items-center rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500";

export function DashboardNavLink({ to, children, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          base,
          isActive
            ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100"
            : "text-gray-600 hover:bg-gray-50 hover:text-blue-700"
        )
      }
    >
      {children}
    </NavLink>
  );
}
