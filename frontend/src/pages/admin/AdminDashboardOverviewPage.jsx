import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getEvents } from "../../api/events";
import { getMatches } from "../../api/matches";
import { getPlayers } from "../../api/players";
import { listPlayerRequests } from "../../api/playerRequests";
import { getResults } from "../../api/results";
import { getTeams } from "../../api/teams";
import { getVenues } from "../../api/venues";
import { getProfile } from "../../api/users";
import { Button } from "../../components/ui/Button";
import { LoadingState } from "../../components/ui/LoadingSpinner";
import { ADMIN_NAV_ITEMS } from "../../constants/adminDashboardNav";
import { getApiErrorMessage } from "../../utils/apiError";
import { cn } from "../../utils/cn";
import { isPastMatch, formatMatchDay } from "../../utils/matchUtils";
import { matchesAwaitingResult } from "../../utils/resultDisplayUtils";

/** Minimal inline icons (no extra dependencies). */
function IconCalendar({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconMatch({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="8" cy="9" r="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="15" r="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.5 10.5l5 5M13.5 13.5l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconUsers({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconUser({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconMapPin({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1118 0z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconTrophy({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M6 9v7a2 2 0 002 2h8a2 2 0 002-2V9M6 9h12M12 22v-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconInbox({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconClipboard({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2M15 2H9a1 1 0 00-1 1v2a1 1 0 001 1h6a1 1 0 001-1V3a1 1 0 00-1-1z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconChevron({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * @param {{ title: string; value: string | number; hint?: string; to?: string; barClass: string; iconWrapClass: string; Icon: import("react").ComponentType<{ className?: string }> }} props
 */
function StatCard({ title, value, hint, to, barClass, iconWrapClass, Icon }) {
  const inner = (
    <div
      className={cn(
        "group relative h-full overflow-hidden rounded-2xl bg-white",
        "ring-1 ring-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.06)]",
        "transition-[box-shadow,transform] duration-200",
        to && "hover:shadow-md hover:ring-slate-300/90 hover:-translate-y-0.5"
      )}
    >
      <div className={cn("absolute inset-x-0 top-0 h-1", barClass)} aria-hidden />
      <div className="p-5 pt-6">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{title}</p>
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset",
              iconWrapClass
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
        </div>
        <p className="mt-3 text-3xl font-bold tabular-nums tracking-tight text-slate-900">{value}</p>
        {hint ? <p className="mt-2 text-sm leading-relaxed text-slate-600">{hint}</p> : null}
        {to ? (
          <p className="mt-4 inline-flex items-center gap-0.5 text-sm font-semibold text-blue-600 transition-colors group-hover:text-blue-700">
            Open section
            <IconChevron className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </p>
        ) : null}
      </div>
    </div>
  );
  if (to) {
    return (
      <Link
        to={to}
        className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-2xl"
      >
        {inner}
      </Link>
    );
  }
  return inner;
}

function SectionCard({ eyebrow, title, description, children, className, headerAction }) {
  return (
    <section
      className={cn(
        "rounded-2xl bg-white ring-1 ring-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.06)]",
        "md:rounded-[1.25rem]",
        className
      )}
    >
      <div className="border-b border-slate-100 px-5 py-4 md:px-6 md:py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {eyebrow ? (
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{eyebrow}</p>
            ) : null}
            <h2 className={cn("text-lg font-bold tracking-tight text-slate-900 md:text-xl", eyebrow && "mt-1")}>
              {title}
            </h2>
            {description ? <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600">{description}</p> : null}
          </div>
          {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
        </div>
      </div>
      <div className="px-5 py-5 md:px-6 md:py-6">{children}</div>
    </section>
  );
}

function matchTeamsLabel(m) {
  const a = typeof m.teamA === "object" && m.teamA?.teamName ? m.teamA.teamName : "Team A";
  const b = typeof m.teamB === "object" && m.teamB?.teamName ? m.teamB.teamName : "Team B";
  return `${a} vs ${b}`;
}

function eventTitle(m) {
  return typeof m.event === "object" && m.event?.title ? m.event.title : "Event";
}

function eventVenueLabel(ev) {
  if (typeof ev.venue === "object" && ev.venue?.venueName) return ev.venue.venueName;
  return null;
}

function AttentionBanner({ tone, title, body, actionLabel, actionTo }) {
  const tones = {
    amber: {
      wrap: "from-amber-50 to-orange-50/80 ring-amber-200/60",
      icon: "bg-amber-100 text-amber-800 ring-amber-200/80",
      title: "text-amber-950",
      body: "text-amber-900/85",
    },
    blue: {
      wrap: "from-sky-50 to-blue-50/80 ring-blue-200/60",
      icon: "bg-sky-100 text-sky-800 ring-sky-200/80",
      title: "text-slate-900",
      body: "text-slate-700",
    },
  };
  const t = tones[tone];
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl bg-gradient-to-br p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between md:p-6",
        "ring-1",
        t.wrap
      )}
    >
      <div className="flex gap-4">
        <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset", t.icon)}>
          {tone === "amber" ? <IconInbox className="h-5 w-5" /> : <IconClipboard className="h-5 w-5" />}
        </span>
        <div>
          <p className={cn("text-sm font-bold", t.title)}>{title}</p>
          <p className={cn("mt-1 text-sm leading-relaxed", t.body)}>{body}</p>
        </div>
      </div>
      <Button
        to={actionTo}
        variant="primary"
        size="sm"
        className="shrink-0 self-stretch sm:self-center sm:px-6"
      >
        {actionLabel}
      </Button>
    </div>
  );
}

export default function AdminDashboardOverviewPage() {
  const [events, setEvents] = useState([]);
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [venues, setVenues] = useState([]);
  const [results, setResults] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [adminName, setAdminName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [ev, ma, te, pl, ve, re, pr, profile] = await Promise.all([
        getEvents(),
        getMatches(),
        getTeams(),
        getPlayers(),
        getVenues(),
        getResults(),
        listPlayerRequests({ status: "pending" }),
        getProfile().catch(() => null),
      ]);
      setEvents(Array.isArray(ev) ? ev : []);
      setMatches(Array.isArray(ma) ? ma : []);
      setTeams(Array.isArray(te) ? te : []);
      setPlayers(Array.isArray(pl) ? pl : []);
      setVenues(Array.isArray(ve) ? ve : []);
      setResults(Array.isArray(re) ? re : []);
      setPendingRequests(Array.isArray(pr) ? pr : []);
      const name = typeof profile?.name === "string" ? profile.name.trim() : "";
      setAdminName(name);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not load dashboard data."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const eventTotal = events.length;
    const eventOngoing = events.filter((e) => e.status === "ongoing").length;
    const eventUpcoming = events.filter((e) => e.status === "upcoming").length;
    const matchScheduled = matches.filter((m) => m.status === "scheduled").length;
    const matchCompleted = matches.filter((m) => m.status === "completed").length;
    const teamActive = teams.filter((t) => t.isActive !== false).length;
    const venueAvailable = venues.filter((v) => v.status === "available").length;
    const awaiting = matchesAwaitingResult(matches, results);
    const overdueResults = awaiting.filter((m) => isPastMatch(m));

    return {
      eventTotal,
      eventOngoing,
      eventUpcoming,
      matchScheduled,
      matchCompleted,
      teamActive,
      teamTotal: teams.length,
      playerTotal: players.length,
      venueAvailable,
      venueTotal: venues.length,
      resultsTotal: results.length,
      pendingRequestCount: pendingRequests.length,
      overdueResultsCount: overdueResults.length,
    };
  }, [events, matches, teams, players, venues, results, pendingRequests]);

  const upcomingMatches = useMemo(() => {
    return matches
      .filter((m) => m && m.status === "scheduled" && !isPastMatch(m))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 6);
  }, [matches]);

  const upcomingEvents = useMemo(() => {
    return events
      .filter((e) => e && e.status === "upcoming")
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 6);
  }, [events]);

  const quickLinks = useMemo(
    () => ADMIN_NAV_ITEMS.filter((item) => item.segment !== "overview"),
    []
  );

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    []
  );

  if (loading) {
    return (
      <div className="rounded-2xl bg-white py-16 ring-1 ring-slate-200/80 shadow-sm">
        <LoadingState label="Loading overview…" minHeight={false} className="min-h-[14rem]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-red-200/80 shadow-sm">
        <div className="border-b border-red-100 bg-red-50/50 px-6 py-5">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">Dashboard overview</h1>
          <p className="mt-1 text-sm text-slate-600">We could not reach the server for this summary.</p>
        </div>
        <div className="px-6 py-6">
          <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
            {error}
          </p>
          <Button type="button" variant="primary" size="sm" className="mt-5" onClick={load}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-2">
      <header className="relative overflow-hidden rounded-2xl md:rounded-[1.25rem] ring-1 ring-slate-200/80 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.08)]">
        <div
          className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          aria-hidden
        />
        <div
          className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"
          aria-hidden
        />
        <div
          className="absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl"
          aria-hidden
        />
        <div className="relative px-6 py-8 md:px-10 md:py-10">
          <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200 ring-1 ring-white/15 backdrop-blur-sm">
            {todayLabel}
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-white md:text-3xl lg:text-[2rem]">
            Dashboard overview
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 md:text-[15px]">
            {adminName ? (
              <>
                Welcome back, <span className="font-semibold text-white">{adminName}</span>. Monitor registrations,
                fixtures, and results at a glance.
              </>
            ) : (
              "Monitor SportSync registrations, fixtures, and results at a glance."
            )}
          </p>
        </div>
      </header>

      {(stats.pendingRequestCount > 0 || stats.overdueResultsCount > 0) && (
        <section aria-label="Attention items" className="space-y-4">
          <h2 className="sr-only">Needs attention</h2>
          {stats.pendingRequestCount > 0 ? (
            <AttentionBanner
              tone="amber"
              title="Player registration requests"
              body={`${stats.pendingRequestCount} pending request${stats.pendingRequestCount === 1 ? "" : "s"} waiting for your review.`}
              actionLabel="Review requests"
              actionTo="/admin/player-requests"
            />
          ) : null}
          {stats.overdueResultsCount > 0 ? (
            <AttentionBanner
              tone="blue"
              title="Match results due"
              body={`${stats.overdueResultsCount} finished match${stats.overdueResultsCount === 1 ? "" : "es"} still need a recorded result.`}
              actionLabel="Open results"
              actionTo="/admin/results"
            />
          ) : null}
        </section>
      )}

      <section aria-labelledby="overview-kpis-heading">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 id="overview-kpis-heading" className="text-sm font-bold uppercase tracking-[0.12em] text-slate-500">
              Key metrics
            </h2>
            <p className="mt-1 text-sm text-slate-600">Live counts across your SportSync directory</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Events"
            value={stats.eventTotal}
            hint={
              stats.eventOngoing || stats.eventUpcoming
                ? `${stats.eventOngoing} ongoing · ${stats.eventUpcoming} upcoming`
                : "Full event catalogue"
            }
            to="/admin/events"
            barClass="bg-gradient-to-r from-blue-500 to-indigo-500"
            iconWrapClass="bg-blue-50 text-blue-700 ring-blue-100"
            Icon={IconCalendar}
          />
          <StatCard
            title="Matches"
            value={matches.length}
            hint={`${stats.matchScheduled} scheduled · ${stats.matchCompleted} completed`}
            to="/admin/matches"
            barClass="bg-gradient-to-r from-indigo-500 to-violet-500"
            iconWrapClass="bg-indigo-50 text-indigo-700 ring-indigo-100"
            Icon={IconMatch}
          />
          <StatCard
            title="Teams"
            value={stats.teamActive}
            hint={
              stats.teamTotal !== stats.teamActive
                ? `${stats.teamTotal} total in directory`
                : "All listed teams are active"
            }
            to="/admin/teams"
            barClass="bg-gradient-to-r from-violet-500 to-purple-500"
            iconWrapClass="bg-violet-50 text-violet-700 ring-violet-100"
            Icon={IconUsers}
          />
          <StatCard
            title="Players"
            value={stats.playerTotal}
            hint="Registered athlete profiles"
            to="/admin/players"
            barClass="bg-gradient-to-r from-emerald-500 to-teal-500"
            iconWrapClass="bg-emerald-50 text-emerald-700 ring-emerald-100"
            Icon={IconUser}
          />
          <StatCard
            title="Venues"
            value={stats.venueAvailable}
            hint={`${stats.venueTotal} total · ${stats.venueAvailable} available`}
            to="/admin/venues"
            barClass="bg-gradient-to-r from-teal-500 to-cyan-500"
            iconWrapClass="bg-teal-50 text-teal-700 ring-teal-100"
            Icon={IconMapPin}
          />
          <StatCard
            title="Results recorded"
            value={stats.resultsTotal}
            hint="Matches with official scores on file"
            to="/admin/results"
            barClass="bg-gradient-to-r from-sky-500 to-blue-500"
            iconWrapClass="bg-sky-50 text-sky-700 ring-sky-100"
            Icon={IconTrophy}
          />
          <StatCard
            title="Pending requests"
            value={stats.pendingRequestCount}
            hint={stats.pendingRequestCount === 0 ? "Queue is clear" : "Player registration queue"}
            to="/admin/player-requests"
            barClass={
              stats.pendingRequestCount > 0
                ? "bg-gradient-to-r from-amber-400 to-orange-500"
                : "bg-gradient-to-r from-slate-300 to-slate-400"
            }
            iconWrapClass={
              stats.pendingRequestCount > 0
                ? "bg-amber-50 text-amber-800 ring-amber-100"
                : "bg-slate-50 text-slate-600 ring-slate-200/80"
            }
            Icon={IconInbox}
          />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          eyebrow="Schedule"
          title="Upcoming matches"
          description="Next scheduled fixtures that have not passed by date."
          headerAction={
            <Button to="/admin/matches/new" variant="outline" size="sm" className="whitespace-nowrap">
              New match
            </Button>
          }
        >
          {upcomingMatches.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center">
              <p className="text-sm text-slate-600">No upcoming scheduled matches.</p>
              <p className="mt-2 text-sm text-slate-500">
                Create matches from{" "}
                <Link to="/admin/events" className="font-semibold text-blue-600 hover:underline">
                  events
                </Link>
                .
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {upcomingMatches.map((m) => (
                <li key={m._id}>
                  <div className="group flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/40 px-4 py-3 transition-colors hover:border-slate-200 hover:bg-white sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">{matchTeamsLabel(m)}</p>
                      <p className="mt-0.5 truncate text-sm text-slate-600">{eventTitle(m)}</p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">
                      <span className="inline-flex items-center rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200/80">
                        {formatMatchDay(m.date)}
                      </span>
                      <Link
                        to={`/admin/matches/${m._id}/edit`}
                        className="inline-flex items-center gap-0.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
                      >
                        Manage
                        <IconChevron className="h-4 w-4 opacity-70" />
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          eyebrow="Events"
          title="Upcoming events"
          description="Events with status upcoming, ordered by start date."
          headerAction={
            <Button to="/admin/events/new" variant="outline" size="sm" className="whitespace-nowrap">
              New event
            </Button>
          }
        >
          {upcomingEvents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center">
              <p className="text-sm text-slate-600">No upcoming events on file.</p>
              <p className="mt-2 text-sm text-slate-500">
                <Link to="/admin/events/new" className="font-semibold text-blue-600 hover:underline">
                  Create an event
                </Link>{" "}
                or check the full list for ongoing and completed items.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {upcomingEvents.map((ev) => {
                const venueName = eventVenueLabel(ev);
                return (
                  <li key={ev._id}>
                    <div className="group flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/40 px-4 py-3 transition-colors hover:border-slate-200 hover:bg-white sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">{ev.title ?? "Untitled event"}</p>
                        <p className="mt-0.5 truncate text-sm text-slate-600">
                          {[typeof ev.sportType === "string" ? ev.sportType.trim() : "", venueName]
                            .filter(Boolean)
                            .join(" · ") || "—"}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">
                        <span className="inline-flex items-center rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200/80">
                          {formatMatchDay(ev.startDate)}
                        </span>
                        <Link
                          to={`/admin/events/${ev._id}/edit`}
                          className="inline-flex items-center gap-0.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
                        >
                          Manage
                          <IconChevron className="h-4 w-4 opacity-70" />
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-5 border-t border-slate-100 pt-5">
            <Link
              to="/admin/events"
              className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              View all events
              <IconChevron className="h-4 w-4" />
            </Link>
          </div>
        </SectionCard>
      </div>

      <SectionCard eyebrow="Navigation" title="Quick links" description="Shortcuts to every admin workspace.">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((item) => (
            <li key={item.segment}>
              <Link
                to={`/admin/${item.segment}`}
                className={cn(
                  "group flex items-center justify-between gap-3 rounded-xl px-4 py-3.5",
                  "bg-slate-50/80 ring-1 ring-slate-200/70",
                  "text-sm font-semibold text-slate-800",
                  "transition-[background,box-shadow,transform] duration-200",
                  "hover:bg-white hover:shadow-md hover:ring-slate-300/90 hover:-translate-y-0.5"
                )}
              >
                <span className="min-w-0 truncate">{item.label}</span>
                <IconChevron className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-500" />
              </Link>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
