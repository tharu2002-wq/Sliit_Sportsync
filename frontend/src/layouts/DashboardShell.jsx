import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

/**
 * Shared responsive dashboard chrome: fixed sidebar, mobile drawer, top bar, main outlet.
 *
 * @param {{ sidebar: import("react").ComponentType<{ className?: string; onNavigate?: () => void }>; topBar: import("react").ComponentType<{ pathname: string; menuOpen: boolean; onMenuToggle: () => void }>; mainClassName: string }} props
 */
export function DashboardShell({ sidebar: Sidebar, topBar: TopBar, mainClassName }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-svh bg-white font-sans text-gray-900">
      <aside className="fixed left-0 top-0 z-30 hidden h-svh w-64 bg-white lg:block">
        <Sidebar className="h-full" />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            type="button"
            className="absolute inset-0 bg-gray-900/40"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu overlay"
          />
          <div className="absolute left-0 top-0 flex h-full w-[min(18rem,88vw)] flex-col bg-white shadow-xl">
            <Sidebar className="h-full border-r-0" onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex min-h-svh min-w-0 flex-1 flex-col lg:ml-64">
        <TopBar
          pathname={location.pathname}
          menuOpen={mobileOpen}
          onMenuToggle={() => setMobileOpen((o) => !o)}
        />
        <main className={`flex-1 ${mainClassName}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
