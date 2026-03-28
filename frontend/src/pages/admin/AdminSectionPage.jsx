import { useLocation } from "react-router-dom";
import { getAdminNavLabelFromPath } from "../../constants/adminDashboardNav";

/**
 * Placeholder for each admin section — replace with real UIs later.
 */
export default function AdminSectionPage() {
  const { pathname } = useLocation();
  const title = getAdminNavLabelFromPath(pathname);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
      <h1 className="text-xl font-black tracking-tight text-gray-900 md:text-2xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm text-gray-600">
        This area will hold tools and data for this section. Layout and features can be added in a follow-up pass.
      </p>
    </div>
  );
}
