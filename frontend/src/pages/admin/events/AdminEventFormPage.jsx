import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createEvent, getEventById, updateEvent } from "../../../api/events";
import { getTeams } from "../../../api/teams";
import { getVenues } from "../../../api/venues";
import { TeamPicker } from "../../../components/admin/events/TeamPicker";
import { Button } from "../../../components/ui/Button";
import { LoadingState } from "../../../components/ui/LoadingSpinner";
import { SelectField } from "../../../components/ui/SelectField";
import { TextAreaField } from "../../../components/ui/TextAreaField";
import { TextField } from "../../../components/ui/TextField";
import { EVENT_STATUS_OPTIONS } from "../../../constants/eventStatus";
import { getApiErrorMessage } from "../../../utils/apiError";
import { refToId, refsToIds, toDateInputValue } from "../../../utils/eventFormUtils";
import { getTitleOrSportTypeError, getTodayDateInputValue } from "../../../utils/eventValidation";

const emptyForm = {
  title: "",
  sportType: "",
  startDate: "",
  endDate: "",
  venueId: "",
  teamIds: [],
  status: "upcoming",
  description: "",
};

export default function AdminEventFormPage() {
  const { eventId } = useParams();
  const isEdit = Boolean(eventId);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [teams, setTeams] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [loadingEvent, setLoadingEvent] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError("");
      setLoadingMeta(true);
      try {
        const [t, v] = await Promise.all([getTeams(), getVenues()]);
        if (!cancelled) {
          setTeams(Array.isArray(t) ? t : []);
          setVenues(Array.isArray(v) ? v : []);
        }
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, "Could not load teams or venues."));
      } finally {
        if (!cancelled) setLoadingMeta(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isEdit || !eventId) {
      setLoadingEvent(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingEvent(true);
      setError("");
      try {
        const ev = await getEventById(eventId);
        if (cancelled) return;
        setForm({
          title: ev.title ?? "",
          sportType: ev.sportType ?? "",
          startDate: toDateInputValue(ev.startDate),
          endDate: toDateInputValue(ev.endDate),
          venueId: refToId(ev.venue),
          teamIds: refsToIds(ev.teams),
          status: ev.status ?? "upcoming",
          description: ev.description ?? "",
        });
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, "Could not load event."));
      } finally {
        if (!cancelled) setLoadingEvent(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isEdit, eventId]);

  const venueOptions = useMemo(() => {
    if (!venues.length) return [];
    if (!isEdit || !form.venueId) {
      return venues.filter((v) => v.status === "available");
    }
    return venues.filter((v) => v.status === "available" || String(v._id) === String(form.venueId));
  }, [venues, isEdit, form.venueId]);

  const update = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const validate = () => {
    const next = {};

    const titleErr = getTitleOrSportTypeError(form.title, "Title");
    if (titleErr) next.title = titleErr;

    const sportErr = getTitleOrSportTypeError(form.sportType, "Sport type");
    if (sportErr) next.sportType = sportErr;

    if (!form.startDate) next.startDate = "Start date is required";
    if (!form.endDate) next.endDate = "End date is required";
    if (!form.venueId) next.venueId = "Venue is required";

    if (form.startDate && form.endDate && form.startDate > form.endDate) {
      next.endDate = "End date must be on or after start date";
    } else if (!isEdit) {
      const today = getTodayDateInputValue();
      if (form.startDate && form.startDate < today) {
        next.startDate = "Start date cannot be in the past";
      }
      if (form.endDate && form.endDate < today) {
        next.endDate = "End date cannot be in the past";
      }
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setError("");
    const payload = {
      title: form.title.trim(),
      sportType: form.sportType.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      venue: form.venueId,
      teams: form.teamIds,
      description: form.description.trim(),
      status: form.status,
    };
    try {
      if (isEdit && eventId) {
        await updateEvent(eventId, payload);
      } else {
        await createEvent(payload);
      }
      navigate("/admin/events", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not save event."));
    } finally {
      setSaving(false);
    }
  };

  if (loadingMeta || loadingEvent) {
    return <LoadingState label={loadingEvent ? "Loading event…" : "Loading form…"} />;
  }

  return (
    <div>
      <div className="border-b border-gray-100 pb-6">
        <Link to="/admin/events" className="text-sm font-semibold text-blue-600 hover:underline">
          ← Back to events
        </Link>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-gray-900 md:text-3xl">
          {isEdit ? "Edit event" : "Create event"}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-600">
          Choose a venue and teams that already exist in the system. Dates are stored as calendar days (same as the API).
        </p>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-8 max-w-3xl space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="event-title"
            name="title"
            label="Title"
            value={form.title}
            onChange={(e) => update({ title: e.target.value })}
            error={fieldErrors.title}
            required
          />
          <TextField
            id="event-sport"
            name="sportType"
            label="Sport type"
            value={form.sportType}
            onChange={(e) => update({ sportType: e.target.value })}
            error={fieldErrors.sportType}
            required
            placeholder="e.g. Cricket, Football"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="event-start"
            name="startDate"
            label="Start date"
            type="date"
            value={form.startDate}
            onChange={(e) => update({ startDate: e.target.value })}
            error={fieldErrors.startDate}
            required
          />
          <TextField
            id="event-end"
            name="endDate"
            label="End date"
            type="date"
            value={form.endDate}
            onChange={(e) => update({ endDate: e.target.value })}
            error={fieldErrors.endDate}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            id="event-venue"
            name="venue"
            label="Venue"
            value={form.venueId}
            onChange={(e) => update({ venueId: e.target.value })}
            error={fieldErrors.venueId}
            required
          >
            <option value="">Select a venue…</option>
            {venueOptions.map((v) => (
              <option key={v._id} value={v._id}>
                {v.venueName}
                {v.status !== "available" ? " (unavailable)" : ""} — {v.location}
              </option>
            ))}
          </SelectField>

          <SelectField
            id="event-status"
            name="status"
            label="Status"
            value={form.status}
            onChange={(e) => update({ status: e.target.value })}
          >
            {EVENT_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </SelectField>
        </div>

        <div>
          <p className="mb-1.5 text-sm font-semibold text-gray-700">Assign teams</p>
          <p className="mb-2 text-xs text-gray-500">
            Only teams you have already created are listed. Optionally matches the sport type field above.
          </p>
          <TeamPicker
            teams={teams}
            selectedIds={form.teamIds}
            onChange={(ids) => update({ teamIds: ids })}
            disabled={saving}
            sportTypeHint={form.sportType.trim() || undefined}
          />
        </div>

        <TextAreaField
          id="event-description"
          name="description"
          label="Description"
          value={form.description}
          onChange={(e) => update({ description: e.target.value })}
          rows={4}
          placeholder="Optional details for participants and staff."
        />

        <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-6">
          <Button type="submit" variant="primary" size="sm" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create event"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={saving}
            onClick={() => navigate("/admin/events")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
