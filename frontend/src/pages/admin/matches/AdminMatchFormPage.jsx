import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getEvents } from "../../../api/events";
import { createMatch, getMatchById, updateMatch } from "../../../api/matches";
import { getTeams } from "../../../api/teams";
import { getVenues } from "../../../api/venues";
import { Button } from "../../../components/ui/Button";
import { LoadingState } from "../../../components/ui/LoadingSpinner";
import { SelectField } from "../../../components/ui/SelectField";
import { TextAreaField } from "../../../components/ui/TextAreaField";
import { TextField } from "../../../components/ui/TextField";
import { MATCH_STATUS_OPTIONS } from "../../../constants/matchStatus";
import { getApiErrorMessage } from "../../../utils/apiError";
import { refToId } from "../../../utils/eventFormUtils";
import {
  getTeamsForEvent,
  isDateWithinEventRange,
  isEndTimeAfterStart,
  toDateInputValue,
} from "../../../utils/matchFormUtils";
import { getTodayDateInputValue } from "../../../utils/eventValidation";
import { venueAllowsSingleDate, venueSupportsSport } from "../../../utils/venueUtils";

const emptyForm = {
  eventId: "",
  teamA: "",
  teamB: "",
  venueId: "",
  date: "",
  startTime: "",
  endTime: "",
  round: "Group Stage",
  status: "scheduled",
  notes: "",
};

export default function AdminMatchFormPage() {
  const { matchId } = useParams();
  const isEdit = Boolean(matchId);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [events, setEvents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [loadingMatch, setLoadingMatch] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError("");
      setLoadingMeta(true);
      try {
        const [evs, tms, vns] = await Promise.all([getEvents(), getTeams(), getVenues()]);
        if (!cancelled) {
          setEvents(Array.isArray(evs) ? evs : []);
          setTeams(Array.isArray(tms) ? tms : []);
          setVenues(Array.isArray(vns) ? vns : []);
        }
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, "Could not load events, teams, or venues."));
      } finally {
        if (!cancelled) setLoadingMeta(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isEdit || !matchId) {
      setLoadingMatch(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingMatch(true);
      setError("");
      try {
        const m = await getMatchById(matchId);
        if (cancelled) return;
        setForm({
          eventId: refToId(m.event),
          teamA: refToId(m.teamA),
          teamB: refToId(m.teamB),
          venueId: refToId(m.venue),
          date: toDateInputValue(m.date),
          startTime: m.startTime ?? "",
          endTime: m.endTime ?? "",
          round: m.round ?? "Group Stage",
          status: m.status ?? "scheduled",
          notes: m.notes ?? "",
        });
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, "Could not load match."));
      } finally {
        if (!cancelled) setLoadingMatch(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isEdit, matchId]);

  const selectedEvent = useMemo(
    () => events.find((e) => String(e._id) === String(form.eventId)) ?? null,
    [events, form.eventId]
  );

  const teamOptions = useMemo(() => getTeamsForEvent(selectedEvent, teams), [selectedEvent, teams]);

  const venueOptions = useMemo(() => {
    if (!venues.length) return [];
    const sport = selectedEvent?.sportType?.trim() ?? "";
    const eligible = (v) => {
      if (v.status !== "available") return false;
      if (!venueSupportsSport(v, sport)) return false;
      if (form.date && !venueAllowsSingleDate(v, form.date)) return false;
      return true;
    };
    if (!isEdit || !form.venueId) {
      return venues.filter(eligible);
    }
    return venues.filter((v) => eligible(v) || String(v._id) === String(form.venueId));
  }, [venues, isEdit, form.venueId, selectedEvent, form.date]);

  useEffect(() => {
    if (!form.venueId || !venues.length || !form.date || !selectedEvent) return;
    const v = venues.find((x) => String(x._id) === String(form.venueId));
    if (!v) return;
    const sport = selectedEvent.sportType?.trim() ?? "";
    if (!venueSupportsSport(v, sport) || !venueAllowsSingleDate(v, form.date)) {
      setForm((prev) => ({ ...prev, venueId: "" }));
    }
  }, [venues, form.venueId, form.date, selectedEvent]);

  const dateBounds = useMemo(() => {
    if (!selectedEvent) return { min: "", max: "" };
    return {
      min: toDateInputValue(selectedEvent.startDate),
      max: toDateInputValue(selectedEvent.endDate),
    };
  }, [selectedEvent]);

  const update = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const handleEventChange = (e) => {
    const v = e.target.value;
    setForm((prev) => ({ ...prev, eventId: v, teamA: "", teamB: "", date: "", venueId: "" }));
  };

  const validate = () => {
    const next = {};
    if (!form.eventId) next.eventId = "Event is required";
    if (!form.teamA) next.teamA = "Team A is required";
    if (!form.teamB) next.teamB = "Team B is required";
    if (form.teamA && form.teamB && form.teamA === form.teamB) {
      next.teamB = "Team B must be different from Team A";
    }
    if (!form.venueId) next.venueId = "Venue is required";
    if (!form.date) next.date = "Match date is required";
    if (!form.startTime) next.startTime = "Start time is required";
    if (!form.endTime) next.endTime = "End time is required";
    if (!form.round.trim()) next.round = "Round is required";

    if (form.startTime && form.endTime && !isEndTimeAfterStart(form.startTime, form.endTime)) {
      next.endTime = "End time must be after start time";
    }

    if (selectedEvent && form.date && !isDateWithinEventRange(selectedEvent, form.date)) {
      next.date = "Date must fall within the event’s start and end dates";
    }

    if (!isEdit && form.date) {
      const today = getTodayDateInputValue();
      if (form.date < today) {
        next.date = "Match date cannot be in the past";
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
    const base = {
      event: form.eventId,
      teamA: form.teamA,
      teamB: form.teamB,
      venue: form.venueId,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      round: form.round.trim(),
      notes: form.notes.trim(),
    };
    try {
      if (isEdit && matchId) {
        await updateMatch(matchId, { ...base, status: form.status });
      } else {
        await createMatch(base);
      }
      navigate("/admin/matches", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not save match."));
    } finally {
      setSaving(false);
    }
  };

  if (loadingMeta || loadingMatch) {
    return <LoadingState label={loadingMatch ? "Loading match…" : "Loading form…"} />;
  }

  return (
    <div>
      <div className="border-b border-gray-100 pb-6">
        <Link to="/admin/matches" className="text-sm font-semibold text-blue-600 hover:underline">
          ← Back to matches
        </Link>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-gray-900 md:text-3xl">
          {isEdit ? "Edit match" : "Create match"}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-600">
          Pick an event first. If the event lists teams, only those teams can be selected; otherwise any teams are allowed
          (same as the API). Venue must be available for new matches.
        </p>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-8 max-w-3xl space-y-6">
        <SelectField
          id="match-event"
          name="event"
          label="Event"
          value={form.eventId}
          onChange={handleEventChange}
          error={fieldErrors.eventId}
          required
        >
          <option value="">Select an event…</option>
          {events.map((ev) => (
            <option key={ev._id} value={ev._id}>
              {ev.title} ({toDateInputValue(ev.startDate)} → {toDateInputValue(ev.endDate)})
            </option>
          ))}
        </SelectField>

        {events.length === 0 ? (
          <p className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            No events found. Create an event in{" "}
            <Link to="/admin/events/new" className="font-semibold underline">
              Event management
            </Link>{" "}
            before scheduling matches.
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            id="match-team-a"
            name="teamA"
            label="Team A"
            value={form.teamA}
            onChange={(e) => update({ teamA: e.target.value })}
            error={fieldErrors.teamA}
            required
            disabled={!form.eventId || teamOptions.length === 0}
          >
            <option value="">{form.eventId ? "Select team A…" : "Choose an event first"}</option>
            {teamOptions.map((t) => (
              <option key={t._id} value={t._id} disabled={String(t._id) === String(form.teamB)}>
                {t.teamName} ({t.sportType})
              </option>
            ))}
          </SelectField>

          <SelectField
            id="match-team-b"
            name="teamB"
            label="Team B"
            value={form.teamB}
            onChange={(e) => update({ teamB: e.target.value })}
            error={fieldErrors.teamB}
            required
            disabled={!form.eventId || teamOptions.length === 0}
          >
            <option value="">{form.eventId ? "Select team B…" : "Choose an event first"}</option>
            {teamOptions.map((t) => (
              <option key={t._id} value={t._id} disabled={String(t._id) === String(form.teamA)}>
                {t.teamName} ({t.sportType})
              </option>
            ))}
          </SelectField>
        </div>

        {form.eventId && teamOptions.length === 0 ? (
          <p className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            No teams are available for this selection. Create teams or assign teams to the event, then try again.
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            id="match-venue"
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
                {v.venueName} — {v.location}
                {v.status !== "available" ? " (unavailable)" : ""}
              </option>
            ))}
          </SelectField>

          <TextField
            id="match-date"
            name="date"
            label="Match date"
            type="date"
            value={form.date}
            onChange={(e) => update({ date: e.target.value })}
            error={fieldErrors.date}
            required
            disabled={!selectedEvent}
            inputClassName={!selectedEvent ? "opacity-60" : undefined}
            min={selectedEvent ? dateBounds.min : undefined}
            max={selectedEvent ? dateBounds.max : undefined}
          />
        </div>

        {selectedEvent ? (
          <p className="-mt-2 text-xs text-gray-500">
            Allowed between {dateBounds.min} and {dateBounds.max} (event window).
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="match-start"
            name="startTime"
            label="Start time"
            type="time"
            value={form.startTime}
            onChange={(e) => update({ startTime: e.target.value })}
            error={fieldErrors.startTime}
            required
          />
          <TextField
            id="match-end"
            name="endTime"
            label="End time"
            type="time"
            value={form.endTime}
            onChange={(e) => update({ endTime: e.target.value })}
            error={fieldErrors.endTime}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="match-round"
            name="round"
            label="Round"
            value={form.round}
            onChange={(e) => update({ round: e.target.value })}
            error={fieldErrors.round}
            required
            placeholder="e.g. Group Stage, Semi-final"
          />
          {isEdit ? (
            <SelectField
              id="match-status"
              name="status"
              label="Status"
              value={form.status}
              onChange={(e) => update({ status: e.target.value })}
            >
              {MATCH_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </SelectField>
          ) : (
            <div className="hidden sm:block" aria-hidden />
          )}
        </div>

        <TextAreaField
          id="match-notes"
          name="notes"
          label="Notes"
          value={form.notes}
          onChange={(e) => update({ notes: e.target.value })}
          rows={3}
          placeholder="Optional internal notes."
        />

        <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-6">
          <Button type="submit" variant="primary" size="sm" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create match"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={saving}
            onClick={() => navigate("/admin/matches")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
