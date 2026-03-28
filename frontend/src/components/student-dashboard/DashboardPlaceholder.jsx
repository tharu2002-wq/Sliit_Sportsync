/**
 * Temporary content panel until API data is wired.
 */
export function DashboardPlaceholder({ title, description = "This area will show live data once the backend is connected." }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
      <div className="flex flex-col gap-2 border-b border-gray-100 pb-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg font-black text-gray-900">{title}</h2>
        <span className="inline-flex w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
          Coming soon
        </span>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-gray-500">{description}</p>
    </div>
  );
}
