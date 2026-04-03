import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  acceptPlayerRequest,
  listPlayerRequests,
  rejectPlayerRequest,
} from "../../../api/playerRequests";
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
  getSportTypesInputError,
} from "../../../utils/playerValidation";
import { cn } from "../../../utils/cn";

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-amber-50 text-amber-900 ring-amber-200",
    approved: "bg-emerald-50 text-emerald-900 ring-emerald-200",
    rejected: "bg-red-50 text-red-900 ring-red-200",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ring-1",
        styles[status] ?? "bg-gray-50 text-gray-800 ring-gray-200"
      )}
    >
      {status}
    </span>
  );
}

export default function AdminPlayerRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");

  const [acceptFor, setAcceptFor] = useState(null);
  const [acceptForm, setAcceptForm] = useState({
    faculty: FACULTY_OPTIONS[0]?.value ?? "",
    age: "",
    gender: "male",
    sportTypesRaw: "",
  });
  const [acceptErrors, setAcceptErrors] = useState({});
  const [acceptSaving, setAcceptSaving] = useState(false);
  const [acceptError, setAcceptError] = useState("");

  const [rejectFor, setRejectFor] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectSaving, setRejectSaving] = useState(false);
  const [rejectError, setRejectError] = useState("");

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const params = statusFilter === "all" ? {} : { status: statusFilter };
      const data = await listPlayerRequests(params);
      setRequests(data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not load player requests."));
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const acceptFacultyOptions = useMemo(
    () => optionsWithLegacyIfNeeded(FACULTY_OPTIONS, acceptForm.faculty),
    [acceptForm.faculty]
  );

  const openAccept = (requestRow) => {
    setAcceptError("");
    setAcceptErrors({});
    setAcceptFor(requestRow);

    const snapshotAge = requestRow?.age;
    const ageStr =
      snapshotAge != null && snapshotAge !== ""
        ? String(snapshotAge).trim()
        : "";
    const ageOk =
      ageStr &&
      (() => {
        const n = Number.parseInt(ageStr, 10);
        return Number.isInteger(n) && n >= 17 && n <= 120;
      })();

    setAcceptForm({
      faculty: FACULTY_OPTIONS[0]?.value ?? "",
      age: ageOk ? ageStr : "",
      gender: "male",
      sportTypesRaw: formatSportTypesForInput(requestRow?.skills),
    });
  };

  const closeAccept = () => {
    if (acceptSaving) return;
    setAcceptFor(null);
  };

  const submitAccept = async (e) => {
    e.preventDefault();
    if (!acceptFor) return;
    setAcceptError("");
    const next = {};
    const fErr = getPlayerFacultyError(acceptForm.faculty);
    if (fErr) next.faculty = fErr;
    const aErr = getPlayerAgeError(acceptForm.age);
    if (aErr) next.age = aErr;
    if (!acceptForm.gender) next.gender = "Select gender.";
    const sErr = getSportTypesInputError(acceptForm.sportTypesRaw);
    if (sErr) next.sportTypesRaw = sErr;
    setAcceptErrors(next);
    if (Object.keys(next).length) return;

    setAcceptSaving(true);
    try {
      await acceptPlayerRequest(String(acceptFor._id), {
        department: acceptForm.faculty.trim(),
        age: Number.parseInt(String(acceptForm.age).trim(), 10),
        gender: acceptForm.gender,
        sportTypes: parseSportTypesInput(acceptForm.sportTypesRaw),
      });
      setAcceptFor(null);
      await load();
    } catch (err) {
      setAcceptError(getApiErrorMessage(err, "Could not register player."));
    } finally {
      setAcceptSaving(false);
    }
  };

  const submitReject = async (e) => {
    e.preventDefault();
    if (!rejectFor) return;
    setRejectError("");
    setRejectSaving(true);
    try {
      await rejectPlayerRequest(String(rejectFor._id), {
        reason: rejectReason.trim() || undefined,
      });
      setRejectFor(null);
      setRejectReason("");
      await load();
    } catch (err) {
      setRejectError(getApiErrorMessage(err, "Could not reject request."));
    } finally {
      setRejectSaving(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-gray-100 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 md:text-3xl">Player requests</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-600">
            Students who asked to be registered as players. Approve to create their athlete profile with the details
            you enter.
          </p>
        </div>
        <Button to="/admin/players" variant="outline" size="sm" className="shrink-0">
          Player list
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label className="text-sm font-semibold text-gray-700" htmlFor="admin-pr-status">
          Status
        </label>
        <select
          id="admin-pr-status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="pending">Pending</option>
          <option value="all">All</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <LoadingState label="Loading requests…" className="mt-10" />
      ) : requests.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-10 text-center text-sm text-gray-600">
          No requests for this filter.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm ring-1 ring-gray-100">
          <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-4 py-3 font-bold text-gray-700">Student</th>
                <th className="px-4 py-3 font-bold text-gray-700">Student ID</th>
                <th className="px-4 py-3 font-bold text-gray-700">Email</th>
                <th className="px-4 py-3 font-bold text-gray-700">Faculty / year</th>
                <th className="px-4 py-3 font-bold text-gray-700">Requested</th>
                <th className="px-4 py-3 font-bold text-gray-700">Status</th>
                <th className="px-4 py-3 font-bold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.map((r) => (
                <tr key={String(r._id)} className="align-top">
                  <td className="px-4 py-3 font-semibold text-gray-900">{r.fullName}</td>
                  <td className="px-4 py-3 text-gray-700">{r.studentId}</td>
                  <td className="px-4 py-3 text-gray-600">{r.email}</td>
                  <td className="max-w-[200px] px-4 py-3 text-gray-600">
                    {[r.faculty, r.academicYear].filter(Boolean).join(" · ") || "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                    {r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3">
                    {r.status === "pending" ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openAccept(r)}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRejectError("");
                            setRejectReason("");
                            setRejectFor(r);
                          }}
                          className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                        >
                          Reject
                        </button>
                      </div>
                    ) : r.status === "approved" && r.createdPlayer ? (
                      <Link
                        to={`/admin/players/${r.createdPlayer}/edit`}
                        className="text-xs font-semibold text-blue-700 hover:text-blue-800"
                      >
                        Open player
                      </Link>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {acceptFor ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="accept-pr-title"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h2 id="accept-pr-title" className="text-lg font-black text-gray-900">
              Register player
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {acceptFor.fullName} · {acceptFor.studentId}
            </p>

            {acceptError ? (
              <p className="mt-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-800">{acceptError}</p>
            ) : null}

            {(acceptFor?.age != null ||
              (Array.isArray(acceptFor?.skills) && acceptFor.skills.length > 0)) ? (
              <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700">
                Age and sport types are prefilled from the student&apos;s profile at the time they sent this request. You
                can change them before registering.
              </p>
            ) : null}

            <form onSubmit={submitAccept} className="mt-4 space-y-4">
              <SelectField
                id="accept-faculty"
                label="Faculty"
                name="faculty"
                value={acceptForm.faculty}
                onChange={(e) => {
                  setAcceptForm((p) => ({ ...p, faculty: e.target.value }));
                  setAcceptErrors((prev) => ({ ...prev, faculty: undefined }));
                }}
                error={acceptErrors.faculty}
                required
              >
                <option value="">Select faculty…</option>
                {acceptFacultyOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </SelectField>

              <TextField
                id="accept-age"
                label="Age"
                name="age"
                type="number"
                value={acceptForm.age}
                onChange={(e) => {
                  setAcceptForm((p) => ({ ...p, age: e.target.value }));
                  setAcceptErrors((prev) => ({ ...prev, age: undefined }));
                }}
                error={acceptErrors.age}
                required
                min={17}
                max={120}
              />

              <SelectField
                id="accept-gender"
                label="Gender"
                name="gender"
                value={acceptForm.gender}
                onChange={(e) => {
                  setAcceptForm((p) => ({ ...p, gender: e.target.value }));
                  setAcceptErrors((prev) => ({ ...prev, gender: undefined }));
                }}
                error={acceptErrors.gender}
                required
              >
                {PLAYER_GENDER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </SelectField>

              <TextField
                id="accept-sports"
                label="Sport types (optional)"
                name="sportTypes"
                value={acceptForm.sportTypesRaw}
                onChange={(e) => {
                  setAcceptForm((p) => ({ ...p, sportTypesRaw: e.target.value }));
                  setAcceptErrors((prev) => ({ ...prev, sportTypesRaw: undefined }));
                }}
                error={acceptErrors.sportTypesRaw}
                placeholder="e.g. Football, Cricket"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeAccept}
                  disabled={acceptSaving}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={acceptSaving}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {acceptSaving ? "Saving…" : "Create player"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {rejectFor ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-pr-title"
        >
          <form
            onSubmit={submitReject}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 id="reject-pr-title" className="text-lg font-black text-gray-900">
              Reject request
            </h2>
            <p className="mt-1 text-sm text-gray-600">{rejectFor.fullName}</p>

            {rejectError ? (
              <p className="mt-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-800">{rejectError}</p>
            ) : null}

            <TextAreaField
              id="reject-reason"
              label="Reason (optional)"
              name="reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="mt-4"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => !rejectSaving && setRejectFor(null)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={rejectSaving}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {rejectSaving ? "Rejecting…" : "Reject request"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
