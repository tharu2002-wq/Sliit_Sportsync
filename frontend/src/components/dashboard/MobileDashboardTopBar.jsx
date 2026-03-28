/**
 * Mobile-only header: brand link, current section title, menu toggle.
 *
 * @param {{
 *   pathname: string;
 *   menuOpen: boolean;
 *   onMenuToggle: () => void;
 *   getLabelFromPath: (pathname: string) => string;
 *   brand: import("react").ComponentType<{ onNavigate?: () => void }>;
 * }} props
 */
export function MobileDashboardTopBar({ pathname, menuOpen, onMenuToggle, getLabelFromPath, brand: Brand }) {
  const title = getLabelFromPath(pathname);

  return (
    <header className="flex items-center justify-between gap-4 border-b border-gray-100 bg-white px-4 py-3 lg:hidden">
      <Brand onNavigate={() => menuOpen && onMenuToggle()} />
      <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
        <p className="truncate text-sm font-bold text-gray-900">{title}</p>
        <button
          type="button"
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-gray-700 hover:bg-gray-50"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          <div className="flex w-5 flex-col gap-1">
            <span className="h-0.5 w-full bg-current" />
            <span className="h-0.5 w-full bg-current" />
            <span className="h-0.5 w-full bg-current" />
          </div>
        </button>
      </div>
    </header>
  );
}
