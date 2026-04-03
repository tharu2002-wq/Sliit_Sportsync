import { useState } from "react";
import { Button } from "../../ui/Button";
import { SelectField } from "../../ui/SelectField";
import { TextField } from "../../ui/TextField";
import { VENUE_STATUS_OPTIONS } from "../../../constants/venueStatus";
import { formatVenueDateDisplay } from "../../../utils/venueUtils";

/**
 * Status + list of calendar dates (YYYY-MM-DD) the venue is **not** available.
 *
 * @param {{
 *   status: string;
 *   onStatusChange: (v: string) => void;
 *   unavailableDateStrings: string[];
 *   onUnavailableDatesChange: (next: string[]) => void;
 *   statusError?: string;
 *   sectionId?: string;
 * }} props
 */
export function VenueAvailabilitySection({
  status,
  onStatusChange,
  unavailableDateStrings,
  onUnavailableDatesChange,
  statusError,
  sectionId = "venue-availability",
}) {
  const [draftDate, setDraftDate] = useState("");
  const [addHint, setAddHint] = useState("");

  const addDate = () => {
    const d = draftDate.trim();
    if (!d) {
      setAddHint("Pick a date first.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) {
      setAddHint("Invalid date.");
      return;
    }
    if (unavailableDateStrings.includes(d)) {
      setAddHint("That date is already listed.");
      return;
    }
    setAddHint("");
    onUnavailableDatesChange([...unavailableDateStrings, d].sort());
    setDraftDate("");
  };

  const removeDate = (ymd) => {
    onUnavailableDatesChange(unavailableDateStrings.filter((x) => x !== ymd));
  };

  return (
    <section
      id={sectionId}
      className="scroll-mt-24 rounded-2xl border border-gray-100 bg-gray-50/50 p-5 shadow-sm ring-1 ring-gray-100 sm:p-6"
    >
      <h2 className="text-lg font-black tracking-tight text-gray-900">Availability</h2>
      <p className="mt-1 text-sm text-gray-600">
        By default every calendar day is available. Add dates below only when the venue must be blocked for scheduling.
      </p>

      <div className="mt-6 space-y-6">
        <SelectField
          id="venue-status"
          name="status"
          label="Booking status"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          error={statusError}
          required
        >
          {VENUE_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </SelectField>

        <div>
          <p className="mb-1.5 text-sm font-semibold text-gray-700">Unavailable dates</p>
          <p className="mb-3 text-xs text-gray-500">
            Optional. Events and matches cannot be placed on these days at this venue.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <TextField
              id="venue-add-date"
              name="draftDate"
              label="Add blocked date"
              type="date"
              value={draftDate}
              onChange={(e) => {
                setDraftDate(e.target.value);
                setAddHint("");
              }}
              className="min-w-0 flex-1"
            />
            <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={addDate}>
              Add to list
            </Button>
          </div>
          {addHint ? (
            <p className="mt-2 text-sm text-amber-700" role="status">
              {addHint}
            </p>
          ) : null}

          {unavailableDateStrings.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">No blocked dates — all days are available.</p>
          ) : (
            <ul className="mt-4 flex flex-wrap gap-2">
              {unavailableDateStrings.map((ymd) => (
                <li
                  key={ymd}
                  className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-800 shadow-sm"
                >
                  <span title={ymd}>{formatVenueDateDisplay(`${ymd}T12:00:00`)}</span>
                  <button
                    type="button"
                    className="ml-1 rounded-md px-1.5 text-gray-500 hover:bg-red-50 hover:text-red-700"
                    aria-label={`Remove ${ymd}`}
                    onClick={() => removeDate(ymd)}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
