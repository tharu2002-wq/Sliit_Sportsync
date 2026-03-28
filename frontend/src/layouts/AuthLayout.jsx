import { Link } from "react-router-dom";
import sliitBg from "../assets/sliitbg.jpg";
import { cn } from "../utils/cn";

export function AuthLayout({ title, subtitle, children, compact = false }) {
  return (
    <div className="relative min-h-svh font-sans text-gray-900">
      {/* Full-viewport background: fixed image + overlays — no repeat, stays fixed while content scrolls */}
      <div
        className="fixed inset-0 z-0 bg-fixed bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${sliitBg})` }}
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 z-0 bg-gradient-to-br from-blue-950/92 via-blue-900/78 to-blue-800/72"
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 z-0 bg-gradient-to-l from-blue-950/55 via-transparent to-transparent"
        aria-hidden="true"
      />
      <svg
        className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-[0.06]"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern id="auth-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#auth-grid)" />
      </svg>

      <header className="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-lg">
              <span className="text-sm font-black text-white">S</span>
            </div>
            <div>
              <span className="text-lg font-black leading-none tracking-tight text-white">SLIIT</span>
              <p className="text-[10px] font-medium uppercase tracking-widest text-blue-200/80">SportSync</p>
            </div>
          </Link>
          <Link
            to="/"
            className="text-sm font-semibold text-blue-100 transition-colors hover:text-white"
          >
            ← Back to home
          </Link>
        </div>
      </header>

      <main
        className={cn(
          "relative z-10 mx-auto max-w-lg px-6",
          compact ? "py-8 md:py-10" : "py-12 md:py-16"
        )}
      >
        <div
          className={cn(
            "rounded-2xl border border-white/20 bg-white/95 shadow-2xl shadow-black/30 backdrop-blur-sm",
            compact ? "p-5 md:p-6" : "rounded-3xl p-8 md:p-10"
          )}
        >
          <h1
            className={cn(
              "font-black text-gray-900",
              compact ? "text-xl md:text-2xl" : "text-2xl md:text-3xl"
            )}
          >
            {title}
          </h1>
          {subtitle ? (
            <p className={cn("text-gray-600", compact ? "mt-1 text-xs leading-snug" : "mt-2")}>
              {subtitle}
            </p>
          ) : null}
          <div className={compact ? "mt-5" : "mt-8"}>{children}</div>
        </div>
      </main>
    </div>
  );
}
