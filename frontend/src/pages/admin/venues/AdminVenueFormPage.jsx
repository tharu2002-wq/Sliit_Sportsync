import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { createVenue, getVenueById, updateVenue } from "../../../api/venues";
import { VenueAvailabilitySection } from "../../../components/admin/venues/VenueAvailabilitySection";
import { VenueSportsSection } from "../../../components/admin/venues/VenueSportsSection";
import { Button } from "../../../components/ui/Button";
import { LoadingState } from "../../../components/ui/LoadingSpinner";
import { TextField } from "../../../components/ui/TextField";
import { getApiErrorMessage } from "../../../utils/apiError";
import { normalizeUnavailableDatesFromApi } from "../../../utils/venueUtils";
import {
  getVenueCapacityError,
  getVenueLocationError,
  getVenueNameError,
  getVenueSportsError,
  getVenueStatusError,
} from "../../../utils/venueValidation";

const emptyForm = {
  venueName: "",
  location: "",
  capacity: "",
  status: "available",
  unavailableDates: [],
  sports: [],
};

export default function AdminVenueFormPage() {
  const { venueId } = useParams();
  const isEdit = Boolean(venueId);
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState(emptyForm);
  const [loadingVenue, setLoadingVenue] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const update = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const clearFieldError = (key) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  useEffect(() => {
    if (!isEdit || !venueId) {
      setLoadingVenue(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingVenue(true);
      setLoadError("");
      try {
        const v = await getVenueById(venueId);
        if (cancelled) return;
        setForm({
          venueName: v.venueName ?? "",
          location: v.location ?? "",
          capacity: v.capacity != null ? String(v.capacity) : "",
          status: v.status === "unavailable" ? "unavailable" : "available",
          unavailableDates: normalizeUnavailableDatesFromApi(v.unavailableDates),
          sports: Array.isArray(v.sports) ? v.sports.map((s) => String(s).trim()).filter(Boolean) : [],
        });
      } catch (err) {
        if (!cancelled) setLoadError(getApiErrorMessage(err, "Could not load venue."));
      } finally {
        if (!cancelled) setLoadingVenue(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isEdit, venueId]);

  useEffect(() => {
    if (loadingVenue) return;
    if (location.hash !== "#venue-availability") return;
    const id = window.setTimeout(() => {
      document.getElementById("venue-availability")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => clearTimeout(id);
  }, [loadingVenue, location.hash]);

  const validate = () => {
    const next = {};
    const nameErr = getVenueNameError(form.venueName);
    if (nameErr) next.venueName = nameErr;
    const locErr = getVenueLocationError(form.location);
    if (locErr) next.location = locErr;
    const capErr = getVenueCapacityError(form.capacity);
    if (capErr) next.capacity = capErr;
    const stErr = getVenueStatusError(form.status);
    if (stErr) next.status = stErr;
    const spErr = getVenueSportsError(form.sports);
    if (spErr) next.sports = spErr;
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setError("");
    const capacity = Number.parseInt(form.capacity, 10);
    const payload = {
      venueName: form.venueName.trim(),
      location: form.location.trim(),
      capacity,
      status: form.status,
      unavailableDates: [...form.unavailableDates].sort(),
      sports: [...form.sports],
    };
    try {
      if (isEdit && venueId) {
        await updateVenue(venueId, payload);
      } else {
        await createVenue(payload);
      }
      navigate("/admin/venues", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not save venue."));
    } finally {
      setSaving(false);
    }
  };

  if (loadingVenue) {
    return <LoadingState label="Loading venue…" />;
  }

  if (isEdit && loadError) {
    return (
      <div>
        <Link to="/admin/venues" className="text-sm font-semibold text-blue-600 hover:underline">
          ← Back to venues
        </Link>
        <p className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {loadError}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="border-b border-gray-100 pb-6">
        <Link to="/admin/venues" className="text-sm font-semibold text-blue-600 hover:underline">
          ← Back to venues
        </Link>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-gray-900 md:text-3xl">
          {isEdit ? "Edit venue" : "Create venue"}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-600">
          Venue names must be unique. All calendar days are available unless you mark specific blocked dates, and you
          can restrict which sports may use the venue.
        </p>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-8 max-w-3xl space-y-8">
        <div className="space-y-6">
          <h2 className="text-lg font-black tracking-tight text-gray-900">Venue details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id="venue-name"
              name="venueName"
              label="Venue name"
              value={form.venueName}
              onChange={(e) => {
                update({ venueName: e.target.value });
                clearFieldError("venueName");
              }}
              error={fieldErrors.venueName}
              required
            />
            <TextField
              id="venue-capacity"
              name="capacity"
              label="Capacity"
              type="number"
              min={1}
              value={form.capacity}
              onChange={(e) => {
                update({ capacity: e.target.value });
                clearFieldError("capacity");
              }}
              error={fieldErrors.capacity}
              required
            />
          </div>
          <TextField
            id="venue-location"
            name="location"
            label="Location"
            value={form.location}
            onChange={(e) => {
              update({ location: e.target.value });
              clearFieldError("location");
            }}
            error={fieldErrors.location}
            required
            placeholder="e.g. Ground floor, Main auditorium"
          />
        </div>

        <VenueSportsSection
          selected={form.sports}
          onChange={(next) => {
            update({ sports: next });
            clearFieldError("sports");
          }}
          error={fieldErrors.sports}
        />

        <VenueAvailabilitySection
          status={form.status}
          onStatusChange={(v) => {
            update({ status: v });
            clearFieldError("status");
          }}
          unavailableDateStrings={form.unavailableDates}
          onUnavailableDatesChange={(next) => update({ unavailableDates: next })}
          statusError={fieldErrors.status}
        />

        <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-6">
          <Button type="submit" variant="primary" size="sm" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create venue"}
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={saving} onClick={() => navigate("/admin/venues")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
