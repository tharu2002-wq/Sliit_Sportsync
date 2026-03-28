import { cn } from "../../utils/cn";

/**
 * @param {string | { value: string; label: string }} raw
 */
function normalizeOption(raw) {
  if (typeof raw === "string") {
    return { value: raw, label: raw };
  }
  return { value: String(raw.value), label: raw.label ?? String(raw.value) };
}

/**
 * Generic dropdown filter for any section (sport, status, category, etc.).
 *
 * `options` can be `{ value, label }[]` or `string[]`. Optionally prepend an
 * `all` row with `showAllOption` + `allLabel` / `allValue`.
 */
export function SelectFilter({
  id = "select-filter",
  options = [],
  value,
  onChange,
  label,
  ariaLabel,
  className,
  selectClassName,
  showAllOption = false,
  allValue = "",
  allLabel = "All",
  /** Visually hide the label. */
  labelSrOnly = false,
}) {
  const rows = options.map(normalizeOption);
  const selectAria = ariaLabel ?? label ?? "Filter";

  return (
    <div className={cn("w-full min-w-[12rem]", className)}>
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
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label ? undefined : selectAria}
        className={cn(
          "w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-3 pr-10 text-sm font-medium text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
          selectClassName
        )}
      >
        {showAllOption ? (
          <option value={allValue}>
            {allLabel}
          </option>
        ) : null}
        {rows.map((opt, i) => (
          <option key={`${opt.value}-${i}`} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
