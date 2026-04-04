import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile } from "../../../api/users";
import { useAuth } from "../../../contexts/AuthContext";
import { getApiErrorMessage } from "../../../utils/apiError";
import { DashboardPageHeader } from "../../../components/student-dashboard/DashboardPageHeader";
import { Button } from "../../../components/ui/Button";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { TextAreaField } from "../../../components/ui/TextAreaField";
import { TextField } from "../../../components/ui/TextField";
import { SelectField } from "../../../components/ui/SelectField";
import {
  ACADEMIC_YEAR_OPTIONS,
  FACULTY_OPTIONS,
  PROFILE_AGE_OPTIONS,
  optionsWithLegacyIfNeeded,
} from "../../../constants/studentProfileOptions";
import { getPlayerAgeError } from "../../../utils/playerValidation";
import { skillsArrayToText, skillsTextToList } from "./profileFormUtils";

function buildFormState(u) {
  if (!u) {
    return {
      name: "",
      age: "",
      academicYear: "",
      faculty: "",
      studentId: "",
      skillsText: "",
    };
  }
    return {
      name: u.name ?? "",
      age: u.age != null && u.age !== "" ? String(u.age) : "",
      academicYear: u.academicYear ?? "",
      faculty: u.faculty ?? "",
      studentId: u.studentId ?? "",
      skillsText: skillsArrayToText(u.skills),
    };
}

export default function StudentEditProfilePage() {
  const navigate = useNavigate();
  const { user: authUser, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [faculty, setFaculty] = useState("");
  const [studentId, setStudentId] = useState("");
  const [skillsText, setSkillsText] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadError("");
      try {
        const data = await getProfile();
        if (cancelled || !data?.user) return;
        const next = buildFormState(data.user);
        setName(next.name);
        setAge(next.age);
        setAcademicYear(next.academicYear);
        setFaculty(next.faculty);
        setStudentId(next.studentId);
        setSkillsText(next.skillsText);
      } catch (err) {
        if (!cancelled) {
          setLoadError(getApiErrorMessage(err, "Could not load profile."));
          const fallback = buildFormState(authUser);
          setName(fallback.name);
          setAge(fallback.age);
          setAcademicYear(fallback.academicYear);
          setFaculty(fallback.faculty);
          setStudentId(fallback.studentId);
          setSkillsText(fallback.skillsText);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // Initial load only; server response is the source of truth.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- avoid resetting the form when auth context updates
  }, []);

  const emailDisplay = useMemo(() => authUser?.email ?? "—", [authUser]);

  const academicYearSelectOptions = useMemo(
    () => optionsWithLegacyIfNeeded(ACADEMIC_YEAR_OPTIONS, academicYear),
    [academicYear]
  );

  const facultySelectOptions = useMemo(() => optionsWithLegacyIfNeeded(FACULTY_OPTIONS, faculty), [faculty]);

  const ageSelectOptions = useMemo(() => optionsWithLegacyIfNeeded(PROFILE_AGE_OPTIONS, age), [age]);

  const validate = () => {
    const next = {};
    const n = name.trim();
    if (!n) next.name = "Enter your full name.";
    if (n.length > 120) next.name = "Name is too long.";
    if (age.trim()) {
      const ageErr = getPlayerAgeError(age);
      if (ageErr) next.age = ageErr;
    }
    if (academicYear.trim().length > 50) next.academicYear = "Academic year is too long.";
    if (faculty.trim().length > 120) next.faculty = "Faculty is too long.";
    if (studentId.trim().length > 40) next.studentId = "Student ID is too long.";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;

    setSaving(true);
    try {
      const skills = skillsTextToList(skillsText);
      const res = await updateProfile({
        name: name.trim(),
        age: age.trim() === "" ? null : Number.parseInt(age, 10),
        academicYear: academicYear.trim() || null,
        faculty: faculty.trim() || null,
        studentId: studentId.trim() || null,
        skills,
      });
      if (res?.user) {
        updateUser(res.user);
      }
      navigate("/student/profile", { replace: true });
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Could not save profile."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <DashboardPageHeader
        title="Edit profile"
        description="Update your display name and campus details. Your university email cannot be changed here."
      />

      {loadError ? (
        <div
          className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          role="status"
        >
          {loadError} Showing the last known values where available.
        </div>
      ) : null}

      <div className="mx-auto max-w-2xl">
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm ring-1 ring-gray-100"
        >
          <div className="border-b border-gray-100 bg-gradient-to-br from-blue-50/80 to-white px-6 py-5">
            <p className="text-sm font-semibold text-gray-900">Account</p>
            <p className="mt-1 text-sm text-gray-500">
              Email: <span className="font-medium text-gray-700">{emailDisplay}</span>
            </p>
          </div>

          <div className="space-y-4 px-6 py-6">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-gray-500" role="status">
                <LoadingSpinner size="sm" />
                <span>Loading profile…</span>
              </div>
            ) : null}

            <TextField
              id="edit-profile-name"
              name="name"
              label="Full name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setFieldErrors((prev) => ({ ...prev, name: undefined }));
              }}
              error={fieldErrors.name}
              autoComplete="name"
              required
              maxLength={120}
            />

            <SelectField
              id="edit-profile-age"
              name="age"
              label="Age"
              value={age}
              onChange={(e) => {
                setAge(e.target.value);
                setFieldErrors((prev) => ({ ...prev, age: undefined }));
              }}
              error={fieldErrors.age}
            >
              <option value="">Select age (optional)</option>
              {ageSelectOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </SelectField>

            <SelectField
              id="edit-profile-academic-year"
              name="academicYear"
              label="Academic year"
              value={academicYear}
              onChange={(e) => {
                setAcademicYear(e.target.value);
                setFieldErrors((prev) => ({ ...prev, academicYear: undefined }));
              }}
              error={fieldErrors.academicYear}
            >
              <option value="">Select academic year (optional)</option>
              {academicYearSelectOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </SelectField>

            <SelectField
              id="edit-profile-faculty"
              name="faculty"
              label="Faculty"
              value={faculty}
              onChange={(e) => {
                setFaculty(e.target.value);
                setFieldErrors((prev) => ({ ...prev, faculty: undefined }));
              }}
              error={fieldErrors.faculty}
            >
              <option value="">Select faculty (optional)</option>
              {facultySelectOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </SelectField>

            <TextField
              id="edit-profile-student-id"
              name="studentId"
              label="Student ID"
              value={studentId}
              onChange={(e) => {
                setStudentId(e.target.value);
                setFieldErrors((prev) => ({ ...prev, studentId: undefined }));
              }}
              error={fieldErrors.studentId}
              placeholder="University student ID"
              maxLength={40}
            />

            <TextAreaField
              id="edit-profile-skills"
              name="skills"
              label="Skills"
              value={skillsText}
              onChange={(e) => {
                setSkillsText(e.target.value);
              }}
              rows={3}
              placeholder="List sports or skills, separated by commas (e.g. Football, Badminton)"
            />
          </div>

          {formError ? (
            <div className="border-t border-gray-100 px-6 py-3 text-sm text-red-600" role="alert">
              {formError}
            </div>
          ) : null}

          <div className="flex flex-col gap-2 border-t border-gray-100 px-6 py-4 sm:flex-row sm:justify-end sm:gap-3">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => navigate("/student/profile")}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="w-full sm:w-auto" disabled={saving || loading}>
              {saving ? (
                <span className="inline-flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Saving…
                </span>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
