import { cn } from "../../utils/cn";

const SIZE_CLASSES = {
  sm: "h-4 w-4 border-2",
  md: "h-9 w-9 border-2",
  lg: "h-12 w-12 border-[3px]",
};

const TONE_CLASSES = {
  /** Default: blue ring on light backgrounds. */
  primary: "border-blue-600 border-t-transparent",
  /** White ring for primary (filled blue) buttons. */
  onPrimary: "border-white border-t-transparent",
};

/**
 * Reusable CSS spinner. Use inline in buttons with `size="sm"` and `tone="onPrimary"` on filled buttons,
 * or with {@link LoadingState} for page-level fetches.
 */
export function LoadingSpinner({ size = "md", tone = "primary", className }) {
  return (
    <span
      className={cn(
        "inline-block shrink-0 animate-spin rounded-full",
        TONE_CLASSES[tone] ?? TONE_CLASSES.primary,
        SIZE_CLASSES[size] ?? SIZE_CLASSES.md,
        className
      )}
      role="presentation"
      aria-hidden
    />
  );
}

/**
 * Centered spinner + label for dashboard lists, detail pages, and async sections.
 */
export function LoadingState({
  label = "Loading…",
  size = "md",
  className,
  /** Extra vertical space for empty main areas (e.g. list pages). */
  minHeight = true,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        minHeight && "min-h-[min(45vh,16rem)]",
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      <LoadingSpinner size={size} />
      <p className="text-sm font-medium text-gray-500">{label}</p>
    </div>
  );
}
