import { cn } from "../../utils/cn";

export function SelectField({
  id,
  name,
  label,
  value,
  onChange,
  error,
  required,
  className,
  selectClassName,
  disabled,
  children,
}) {
  return (
    <div className={cn("w-full", className)}>
      {label ? (
        <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-gray-700">
          {label}
          {required ? <span className="text-red-500"> *</span> : null}
        </label>
      ) : null}
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          "w-full rounded-xl border border-gray-200 bg-white py-3 pl-3 pr-10 text-sm font-medium text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-50",
          error && "border-red-400",
          selectClassName
        )}
      >
        {children}
      </select>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
