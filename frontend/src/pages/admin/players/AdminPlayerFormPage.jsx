import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createPlayer, getPlayerById, updatePlayer } from "../../../api/players";
import { Button } from "../../../components/ui/Button";
import { LoadingState } from "../../../components/ui/LoadingSpinner";
import { SelectField } from "../../../components/ui/SelectField";
import { TextAreaField } from "../../../components/ui/TextAreaField";
import { TextField } from "../../../components/ui/TextField";
import {
  FACULTY_OPTIONS,
  optionsWithLegacyIfNeeded,
} from "../../../constants/studentProfileOptions";
import { PLAYER_GENDER_OPTIONS } from "../../../constants/playerGender";
import { getApiErrorMessage } from "../../../utils/apiError";
import { formatSportTypesForInput, parseSportTypesInput } from "../../../utils/playerFormUtils";
import {
  getPlayerAgeError,
  getPlayerFacultyError,
  getPlayerEmailError,
  getSportTypesInputError,
  getStudentIdError,
} from "../../../utils/playerValidation";
import { getNameValidationError } from "../../../utils/registrationValidation";

const emptyForm = {
  studentId: "",
  fullName: "",
  email: "",
  faculty: "",
  age: "",
  gender: "",
  sportTypesRaw: "",
};

export default function AdminPlayerFormPage() {
  const { playerId } = useParams();
  const isEdit = Boolean(playerId);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [loadingPlayer, setLoadingPlayer] = useState(isEdit);
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
    if (!isEdit || !playerId) {
      setLoadingPlayer(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingPlayer(true);
      setLoadError("");
      try {
        const p = await getPlayerById(playerId);
        if (cancelled) return;
        setForm({
          studentId: p.studentId ?? "",
          fullName: p.fullName ?? "",
          email: p.email ?? "",
          faculty: p.department ?? "",
          age: p.age != null ? String(p.age) : "",
          gender: p.gender ?? "",
          sportTypesRaw: formatSportTypesForInput(p.sportTypes),
        });
      } catch (err) {
        if (!cancelled) setLoadError(getApiErrorMessage(err, "Could not load player."));
      } finally {
        if (!cancelled) setLoadingPlayer(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isEdit, playerId]);

  const facultySelectOptions = useMemo(
    () => optionsWithLegacyIfNeeded(FACULTY_OPTIONS, form.faculty),
    [form.faculty]
  );

  const validate = () => {
    const next = {};

    const studentErr = getStudentIdError(form.studentId);
    if (studentErr) next.studentId = studentErr;

    const nameErr = getNameValidationError(form.fullName);
    if (nameErr) next.fullName = nameErr;

    const emailErr = getPlayerEmailError(form.email);
    if (emailErr) next.email = emailErr;

    const facErr = getPlayerFacultyError(form.faculty);
    if (facErr) next.faculty = facErr;

    const ageErr = getPlayerAgeError(form.age);
    if (ageErr) next.age = ageErr;

    if (!form.gender) next.gender = "Gender is required";

    const sportsErr = getSportTypesInputError(form.sportTypesRaw);
    if (sportsErr) next.sportTypesRaw = sportsErr;

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setError("");
    const ageNum = Number.parseInt(form.age, 10);
    const payload = {
      studentId: form.studentId.trim(),
      fullName: form.fullName.trim(),
      email: form.email.trim().toLowerCase(),
      department: form.faculty.trim(),
      age: ageNum,
      gender: form.gender,
      sportTypes: parseSportTypesInput(form.sportTypesRaw),
    };
    try {
      if (isEdit && playerId) {
        await updatePlayer(playerId, payload);
      } else {
        await createPlayer(payload);
      }
      navigate("/admin/players", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not save player."));
    } finally {
      setSaving(false);
    }
  };

  if (loadingPlayer) {
    return <LoadingState label="Loading player…" />;
  }

  if (isEdit && loadError) {
    return (
      <div>
        <Link to="/admin/players" className="text-sm font-semibold text-blue-600 hover:underline">
          ← Back to players
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
        <Link to="/admin/players" className="text-sm font-semibold text-blue-600 hover:underline">
          ← Back to players
        </Link>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-gray-900 md:text-3xl">
          {isEdit ? "Edit player" : "Create player"}
        </h1>
        
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-8 max-w-3xl space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="player-student-id"
            name="studentId"
            label="Student ID"
            value={form.studentId}
            onChange={(e) => {
              update({ studentId: e.target.value });
              clearFieldError("studentId");
            }}
            error={fieldErrors.studentId}
            required
          />
          <TextField
            id="player-full-name"
            name="fullName"
            label="Full name"
            value={form.fullName}
            onChange={(e) => {
              update({ fullName: e.target.value });
              clearFieldError("fullName");
            }}
            error={fieldErrors.fullName}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="player-email"
            name="email"
            type="email"
            label="Email"
            value={form.email}
            onChange={(e) => {
              update({ email: e.target.value });
              clearFieldError("email");
            }}
            error={fieldErrors.email}
            required
            autoComplete="email"
          />
          <SelectField
            id="player-faculty"
            name="faculty"
            label="Faculty"
            value={form.faculty}
            onChange={(e) => {
              update({ faculty: e.target.value });
              clearFieldError("faculty");
            }}
            error={fieldErrors.faculty}
            required
          >
            <option value="">Select faculty…</option>
            {facultySelectOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </SelectField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="player-age"
            name="age"
            label="Age"
            type="number"
            min={17}
            max={120}
            value={form.age}
            onChange={(e) => {
              update({ age: e.target.value });
              clearFieldError("age");
            }}
            error={fieldErrors.age}
            required
          />
          <SelectField
            id="player-gender"
            name="gender"
            label="Gender"
            value={form.gender}
            onChange={(e) => {
              update({ gender: e.target.value });
              clearFieldError("gender");
            }}
            error={fieldErrors.gender}
            required
          >
            <option value="">Select…</option>
            {PLAYER_GENDER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </SelectField>
        </div>

        <TextAreaField
          id="player-sports"
          name="sportTypes"
          label="Sports (optional)"
          value={form.sportTypesRaw}
          onChange={(e) => {
            update({ sportTypesRaw: e.target.value });
            clearFieldError("sportTypesRaw");
          }}
          error={fieldErrors.sportTypesRaw}
          rows={2}
          placeholder="e.g. Cricket, Badminton, Football"
        />

        <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-6">
          <Button type="submit" variant="primary" size="sm" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create player"}
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={saving} onClick={() => navigate("/admin/players")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
