import { cn } from "../../utils/cn";

/**
 * Generic controlled search field for any list or section.
 * Pass `label` and/or `ariaLabel` so the field is announced correctly (use `ariaLabel` when `label` is omitted).
 */
export function SearchBar({
  id = "search-bar",
  label,
  ariaLabel,
  value,
  onChange,
  placeholder = "Search…",
  name,
  className,
  inputClassName,
  /** Visually hide the label but keep it for accessibility. */
  labelSrOnly = false,
}) {
  const inputAria = ariaLabel ?? label ?? "Search";
  return (
    <div className={cn("w-full", className)}>
      {label ? (
        <label
          htmlFor={id}
          className={cn(
            "mb-1.5 block text-sm font-semibold text-gray-700",
            labelSrOnly && "sr-only"
          )}
        >
          {label}
        </label>
      ) : null}
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </span>
        <input
          id={id}
          name={name}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          aria-label={label ? undefined : inputAria}
          className={cn(
            "w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
            inputClassName
          )}
        />
      </div>
    </div>
  );
}
