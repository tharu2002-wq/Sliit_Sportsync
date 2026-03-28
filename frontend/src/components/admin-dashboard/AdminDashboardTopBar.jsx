import { getAdminNavLabelFromPath } from "../../constants/adminDashboardNav";
import { MobileDashboardTopBar } from "../dashboard/MobileDashboardTopBar";
import { AdminDashboardBrand } from "./AdminDashboardBrand";

export function AdminDashboardTopBar(props) {
  return (
    <MobileDashboardTopBar
      {...props}
      getLabelFromPath={getAdminNavLabelFromPath}
      brand={AdminDashboardBrand}
    />
  );
}
