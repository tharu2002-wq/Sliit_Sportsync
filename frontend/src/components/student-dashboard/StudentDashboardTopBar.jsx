import { getNavLabelFromPath } from "../../constants/studentDashboardNav";
import { MobileDashboardTopBar } from "../dashboard/MobileDashboardTopBar";
import { StudentDashboardBrand } from "./StudentDashboardBrand";

export function StudentDashboardTopBar(props) {
  return (
    <MobileDashboardTopBar
      {...props}
      getLabelFromPath={getNavLabelFromPath}
      brand={StudentDashboardBrand}
    />
  );
}
