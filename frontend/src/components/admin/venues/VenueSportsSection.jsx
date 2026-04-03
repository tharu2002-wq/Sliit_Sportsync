import { VENUE_SPORT_OPTIONS } from "../../../constants/sportTypes";

/**
 * @param {{
 *   selected: string[];
 *   onChange: (next: string[]) => void;
 *   error?: string;
 *   sectionId?: string;
 * }} props
 */
export function VenueSportsSection({ selected, onChange, error, sectionId = "venue-sports" }) {
  const set = new Set(selected.map((s) => String(s).trim()).filter(Boolean));

  const toggle = (label) => {
    const t = label.trim();
    const next = new Set(set);
    if (next.has(t)) next.delete(t);
    else next.add(t);
    onChange(Array.from(next));
  };

  return (
    <section
      id={sectionId}
      className="scroll-mt-24 rounded-2xl border border-gray-100 bg-gray-50/50 p-5 shadow-sm ring-1 ring-gray-100 sm:p-6"
    >
      <h2 className="text-lg font-black tracking-tight text-gray-900">Sports at this venue</h2>
      <p className="mt-1 text-sm text-gray-600">
        Select every sport that may use this venue. At least one is required.
      </p>

      <fieldset
        className={`mt-6 rounded-xl ${error ? "ring-2 ring-red-200" : ""}`}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${sectionId}-sports-error` : undefined}
      >
        <legend className="sr-only">Sports</legend>
        <ul className="grid gap-3 sm:grid-cols-2">
          {VENUE_SPORT_OPTIONS.map((sport) => {
            const checked = set.has(sport);
            return (
              <li key={sport}>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-sm ring-1 ring-transparent hover:border-gray-300 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue-500">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={checked}
                    onChange={() => toggle(sport)}
                  />
                  {sport}
                </label>
              </li>
            );
          })}
        </ul>
        {error ? (
          <p id={`${sectionId}-sports-error`} className="mt-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
      </fieldset>
    </section>
  );
}
