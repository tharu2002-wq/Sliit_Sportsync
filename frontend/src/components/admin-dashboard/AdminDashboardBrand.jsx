import { Link } from "react-router-dom";

export function AdminDashboardBrand({ onNavigate }) {
  return (
    <Link
      to="/admin/overview"
      onClick={onNavigate}
      className="flex items-center gap-3 rounded-xl p-1 transition-opacity hover:opacity-90"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 shadow-md shadow-slate-300">
        <span className="text-sm font-black text-white">S</span>
      </div>
      <div className="min-w-0 text-left">
        <p className="truncate text-base font-black leading-tight text-slate-800">SLIIT SportSync</p>
        <p className="truncate text-[10px] font-medium uppercase tracking-widest text-gray-500">Control panel</p>
      </div>
    </Link>
  );
}
