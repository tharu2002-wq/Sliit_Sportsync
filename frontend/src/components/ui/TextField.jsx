import { cn } from "../../utils/cn";

export function TextField({
  id,
  name,
  label,
  type = "text",
  defaultValue,
  value,
  onChange,
  error,
  autoComplete,
  required,
  className,
  inputClassName,
  /** Smaller labels, inputs, and errors (e.g. auth forms). */
  compact = false,
  placeholder,
  minLength,
  maxLength,
  min,
  max,
}) {
  const isControlled = value !== undefined;

  return (
    <div className={cn("w-full", className)}>
      {label ? (
        <label
          htmlFor={id}
          className={cn(
            "block font-semibold text-gray-700",
            compact ? "mb-1 text-xs" : "mb-1.5 text-sm"
          )}
        >
          {label}
          {required ? <span className="text-red-500"> *</span> : null}
        </label>
      ) : null}
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        {...(isControlled ? { value, onChange } : { defaultValue, onChange })}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        min={min}
        max={max}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          "w-full border text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
          compact
            ? "rounded-lg px-3 py-2 text-sm"
            : "rounded-xl px-4 py-3",
          error ? "border-red-400" : "border-gray-200",
          inputClassName
        )}
      />
      {error ? (
        <p
          id={`${id}-error`}
          className={cn("text-red-600", compact ? "mt-1 text-xs" : "mt-1.5 text-sm")}
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
