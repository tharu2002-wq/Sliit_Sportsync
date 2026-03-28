import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";

/**
 * Public UI button for marketing / app chrome.
 *
 * - `to`: if set, renders React Router `<Link>` instead of `<button>`
 * - `variant`, `size`, `fullWidth`, `className`, plus native button/link props
 */
const BASE =
  "inline-flex items-center justify-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:pointer-events-none disabled:opacity-50";

const VARIANTS = {
  primary: "bg-blue-600 font-semibold text-white shadow-md shadow-blue-200 hover:bg-blue-700 rounded-xl",
  outline: "rounded-xl border-2 border-blue-600 font-semibold text-blue-600 hover:bg-blue-50",
  heroSolid:
    "group rounded-2xl bg-white font-black text-blue-700 shadow-2xl shadow-black/30 transition-all hover:scale-105 hover:bg-blue-50",
  heroGhost:
    "group rounded-2xl border-2 border-white/40 font-bold text-white backdrop-blur-sm transition-all hover:bg-white/10",
  featureInverse: "rounded-xl bg-white font-black text-blue-700 hover:bg-blue-50",
  ctaSolid:
    "group rounded-2xl bg-white font-black text-blue-700 shadow-2xl shadow-black/30 transition-all hover:scale-105 hover:bg-blue-50",
  ctaGhost:
    "group rounded-2xl border-2 border-white/40 font-bold text-white backdrop-blur-sm transition-all hover:bg-white/10",
  navLink:
    "group relative rounded-none font-semibold text-gray-600 transition-colors hover:text-blue-600",
  navText: "w-full justify-start rounded-lg text-left font-semibold text-gray-700 hover:bg-gray-50",
  iconGhost: "flex-col rounded-lg hover:bg-blue-50 md:hidden",
};

const SIZES = {
  sm: "gap-2 px-4 py-2 text-sm",
  md: "gap-2 px-8 py-4 text-sm",
  lg: "gap-3 px-10 py-4 text-base",
  feature: "mt-4 w-full gap-0 py-3 text-sm",
  nav: "gap-0 px-0 py-0 text-sm",
  navMobile: "w-full gap-0 px-0 py-2 text-sm",
  icon: "gap-0 p-2",
};

const UNDERLINE = (
  <span className="absolute -bottom-1 left-0 h-0.5 w-0 rounded bg-blue-500 transition-all duration-300 group-hover:w-full" />
);

export function Button({
  variant = "primary",
  size = "sm",
  fullWidth = false,
  className,
  children,
  type = "button",
  to,
  ...props
}) {
  const v = VARIANTS[variant] ?? VARIANTS.primary;
  const s = SIZES[size] ?? SIZES.sm;

  const classes = cn(
    BASE,
    v,
    s,
    fullWidth && variant !== "navText" && variant !== "navLink" && "w-full",
    className
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
        {variant === "navLink" ? UNDERLINE : null}
      </Link>
    );
  }

  if (variant === "navLink") {
    return (
      <button type={type} className={classes} {...props}>
        {children}
        {UNDERLINE}
      </button>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
