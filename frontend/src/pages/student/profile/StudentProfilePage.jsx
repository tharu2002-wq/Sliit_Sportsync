import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import userAvatar from "../../../assets/user.png";
import { getProfile } from "../../../api/users";
import { useAuth } from "../../../contexts/AuthContext";
import { getApiErrorMessage } from "../../../utils/apiError";
import { DashboardPageHeader } from "../../../components/student-dashboard/DashboardPageHeader";
import { Button } from "../../../components/ui/Button";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { cn } from "../../../utils/cn";

function formatDate(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(d);
  } catch {
    return "—";
  }
}

const NOT_SET = "Not set";

function ProfileField({ label, value, muted, className }) {
  const display = value ?? "—";
  return (
    <div
      className={cn(
        "flex flex-col gap-0.5 border-b border-gray-100 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
        className
      )}
    >
      <dt className="shrink-0 text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</dt>
      <dd
        className={cn(
          "min-w-0 break-words text-sm",
          muted ? "font-normal text-gray-500" : "font-semibold text-gray-900"
        )}
      >
        {display}
      </dd>
    </div>
  );
}

function EmptyParticipation() {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-6 py-12 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
      <p className="text-sm font-semibold text-gray-900">No participation yet</p>
      <p className="mt-1 text-sm text-gray-500">
        When you join events or teams, they will be listed here.
      </p>
      <Link
        to="/student/events"
        className="mt-5 inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-colors hover:bg-blue-700"
      >
        Browse events
      </Link>
    </div>
  );
}

export default function StudentProfilePage() {
  const { user: authUser } = useAuth();
  const [serverUser, setServerUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setFetchError("");
      try {
        const data = await getProfile();
        if (!cancelled && data?.user) {
          setServerUser(data.user);
        }
      } catch (err) {
        if (!cancelled) setFetchError(getApiErrorMessage(err, "Could not refresh profile from server."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const display = useMemo(() => {
    const u = serverUser ?? authUser;
    if (!u) return null;
    return {
      name: u.name ?? "—",
      email: u.email ?? "—",
      memberSince: formatDate(u.createdAt),
      /** Wired when backend exposes these on the user profile. */
      academicYear: u.academicYear ?? null,
      faculty: u.faculty ?? null,
      studentId: u.studentId ?? null,
    };
  }, [serverUser, authUser]);

  const handleEditProfile = () => {
    /* Reserved: open edit form or navigate to `/student/profile/edit` when the API exists. */
  };

  const handleDeleteAccount = () => {
    const ok = window.confirm(
      "Delete your SportSync account permanently? This action cannot be undone."
    );
    if (!ok) return;
    window.alert("Account deletion is not available yet. This option will be enabled in a future update.");
  };

  return (
    <>
      <DashboardPageHeader
        title="Profile"
        description="Your SportSync account details and campus sports participation."
      />

      {fetchError ? (
        <div
          className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          role="status"
        >
          {fetchError} Showing details from your last sign-in.
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)]">
        <section aria-labelledby="account-heading">
          <h2 id="account-heading" className="sr-only">
            Account information
          </h2>
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm ring-1 ring-gray-100">
            <div className="border-b border-gray-100 bg-gradient-to-br from-blue-50/80 to-white px-6 py-6 sm:flex sm:items-center sm:gap-6">
              <div className="mx-auto shrink-0 sm:mx-0">
                <div className="rounded-full bg-blue-50 p-1 ring-2 ring-blue-100 shadow-sm">
                  <img
                    src={userAvatar}
                    alt={authUser?.name ? `${authUser.name}'s profile photo` : "Student profile photo"}
                    width={96}
                    height={96}
                    className="h-24 w-24 rounded-full object-cover"
                    decoding="async"
                  />
                </div>
              </div>
              <div className="mt-4 min-w-0 text-center sm:mt-0 sm:text-left">
                <p className="text-xl font-black tracking-tight text-gray-900">{display?.name ?? "—"}</p>
                <p className="mt-0.5 truncate text-sm text-gray-500">{display?.email ?? "—"}</p>
              </div>
            </div>

            <dl className="px-6 pb-2 pt-2">
              <ProfileField label="Full name" value={display?.name} />
              <ProfileField label="University email" value={display?.email} />
              <ProfileField label="Member since" value={display?.memberSince} />
              <ProfileField
                label="Academic year"
                value={display?.academicYear ?? NOT_SET}
                muted={!display?.academicYear}
              />
              <ProfileField label="Faculty" value={display?.faculty ?? NOT_SET} muted={!display?.faculty} />
              <ProfileField
                label="Student ID"
                value={display?.studentId ?? NOT_SET}
                muted={!display?.studentId}
              />
            </dl>

            <div className="flex flex-col gap-2 border-t border-gray-100 px-6 py-4 sm:flex-row sm:justify-end sm:gap-3">
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={handleEditProfile}>
                Edit profile
              </Button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="inline-flex w-full items-center justify-center rounded-xl border-2 border-red-100 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 sm:w-auto"
              >
                Delete account
              </button>
            </div>

            {loading ? (
              <div
                className="flex items-center gap-2 border-t border-gray-100 px-6 py-3 text-xs text-gray-400"
                role="status"
                aria-live="polite"
              >
                <LoadingSpinner size="sm" />
                <span>Syncing profile…</span>
              </div>
            ) : null}
          </div>
        </section>

        <section className="mt-2" aria-labelledby="participation-heading">
          <h2 id="participation-heading" className="text-lg font-black tracking-tight text-gray-900">
            My participation
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Events and teams you join through SportSync will show up here.
          </p>

          <div className="mt-4">
            <EmptyParticipation />
          </div>
        </section>
      </div>
    </>
  );
}
