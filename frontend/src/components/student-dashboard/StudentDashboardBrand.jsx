import { Link } from "react-router-dom";

export function StudentDashboardBrand({ onNavigate }) {
  return (
    <Link
      to="/student/events"
      onClick={onNavigate}
      className="flex items-center gap-3 rounded-xl p-1 transition-opacity hover:opacity-90"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-200">
        <span className="text-sm font-black text-white">S</span>
      </div>
      <div className="min-w-0 text-left">
        <p className="truncate text-base font-black leading-tight text-blue-700">SLIIT SportSync</p>
        <p className="truncate text-[10px] font-medium uppercase tracking-widest text-gray-500">Student</p>
      </div>
    </Link>
  );
}
