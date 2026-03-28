import { cn } from "../../utils/cn";

export function TextAreaField({
  id,
  name,
  label,
  value,
  onChange,
  defaultValue,
  error,
  required,
  rows = 4,
  placeholder,
  className,
}) {
  const isControlled = value !== undefined;

  return (
    <div className={cn("w-full", className)}>
      {label ? (
        <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-gray-700">
          {label}
          {required ? <span className="text-red-500"> *</span> : null}
        </label>
      ) : null}
      <textarea
        id={id}
        name={name}
        rows={rows}
        placeholder={placeholder}
        {...(isControlled ? { value, onChange } : { defaultValue, onChange })}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          "w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
          error ? "border-red-400" : "border-gray-200"
        )}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
