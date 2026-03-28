import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  addTeamMembers,
  assignTeamCaptain,
  deactivateTeam,
  getTeamById,
  removeTeamMember,
  updateTeam,
} from "../../../api/teams";
import { getPlayers } from "../../../api/players";
import { ConfirmDialog } from "../../../components/admin/events/ConfirmDialog";
import { PlayerPicker } from "../../../components/admin/teams/PlayerPicker";
import { Button } from "../../../components/ui/Button";
import { LoadingState } from "../../../components/ui/LoadingSpinner";
import { SelectField } from "../../../components/ui/SelectField";
import { TextField } from "../../../components/ui/TextField";
import { getApiErrorMessage } from "../../../utils/apiError";
import { refToId } from "../../../utils/eventFormUtils";
import { getTitleOrSportTypeError } from "../../../utils/eventValidation";

function memberName(m) {
  if (typeof m === "object" && m !== null && m.fullName) return m.fullName;
  return "Player";
}

export default function AdminTeamDetailPage() {
  const { teamId } = useParams();

  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [banner, setBanner] = useState("");

  const [teamName, setTeamName] = useState("");
  const [sportType, setSportType] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [savingInfo, setSavingInfo] = useState(false);

  const [captainId, setCaptainId] = useState("");
  const [savingCaptain, setSavingCaptain] = useState(false);

  const [addMemberIds, setAddMemberIds] = useState([]);
  const [addingMembers, setAddingMembers] = useState(false);

  const [removeBusy, setRemoveBusy] = useState("");
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deactivateBusy, setDeactivateBusy] = useState(false);

  const applyTeam = useCallback((t) => {
    setTeam(t);
    setTeamName(t.teamName ?? "");
    setSportType(t.sportType ?? "");
    setCaptainId(refToId(t.captain));
  }, []);

  const refreshTeam = useCallback(async () => {
    if (!teamId) return;
    const t = await getTeamById(teamId);
    applyTeam(t);
  }, [teamId, applyTeam]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!teamId) return;
      setLoading(true);
      setLoadError("");
      try {
        const [p, t] = await Promise.all([getPlayers(), getTeamById(teamId)]);
        if (cancelled) return;
        setPlayers(Array.isArray(p) ? p : []);
        applyTeam(t);
      } catch (err) {
        if (!cancelled) setLoadError(getApiErrorMessage(err, "Could not load team."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [teamId, applyTeam]);

  const memberList = useMemo(() => (Array.isArray(team?.members) ? team.members : []), [team]);
  const memberIds = useMemo(() => memberList.map((m) => refToId(m)).filter(Boolean), [memberList]);

  const playersNotInTeam = useMemo(
    () => players.filter((p) => !memberIds.includes(String(p._id))),
    [players, memberIds]
  );

  const capId = refToId(team?.captain);

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    if (!teamId) return;
    const next = {};
    const nameErr = getTitleOrSportTypeError(teamName, "Team name");
    const sportErr = getTitleOrSportTypeError(sportType, "Sport type");
    if (nameErr) next.teamName = nameErr;
    if (sportErr) next.sportType = sportErr;
    setFieldErrors(next);
    if (Object.keys(next).length > 0) return;

    setSavingInfo(true);
    setBanner("");
    setError("");
    try {
      await updateTeam(teamId, {
        teamName: teamName.trim(),
        sportType: sportType.trim(),
      });
      await refreshTeam();
      setFieldErrors({});
      setBanner("Team details saved.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not update team."));
    } finally {
      setSavingInfo(false);
    }
  };

  const handleCaptainChange = async (e) => {
    const next = e.target.value;
    if (!teamId || !next) return;
    setSavingCaptain(true);
    setBanner("");
    setError("");
    try {
      await assignTeamCaptain(teamId, next);
      setCaptainId(next);
      await refreshTeam();
      setBanner("Captain updated.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not assign captain."));
    } finally {
      setSavingCaptain(false);
    }
  };

  const handleAddMembers = async () => {
    if (!teamId || addMemberIds.length === 0) return;
    setAddingMembers(true);
    setBanner("");
    setError("");
    try {
      await addTeamMembers(teamId, addMemberIds);
      setAddMemberIds([]);
      await refreshTeam();
      setBanner("Players added to the team.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not add players."));
    } finally {
      setAddingMembers(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!teamId) return;
    const idStr = String(memberId);
    const isCaptain = capId && capId === idStr;
    const count = memberList.length;

    if (isCaptain && count > 1) {
      setError("Assign another player as captain before removing the current captain.");
      return;
    }
    if (isCaptain && count === 1) {
      setError("Cannot remove the only member. Add another player first, or deactivate the team.");
      return;
    }

    setRemoveBusy(idStr);
    setError("");
    setBanner("");
    try {
      await removeTeamMember(teamId, memberId);
      await refreshTeam();
      setBanner("Player removed from the team.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not remove player."));
    } finally {
      setRemoveBusy("");
    }
  };

  const handleDeactivate = async () => {
    if (!teamId) return;
    setDeactivateBusy(true);
    setError("");
    try {
      await deactivateTeam(teamId);
      setDeactivateOpen(false);
      await refreshTeam();
      setBanner("Team deactivated.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not deactivate team."));
    } finally {
      setDeactivateBusy(false);
    }
  };

  const handleReactivate = async () => {
    if (!teamId) return;
    setError("");
    setBanner("");
    try {
      await updateTeam(teamId, { isActive: true });
      await refreshTeam();
      setBanner("Team reactivated.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not reactivate team."));
    }
  };

  if (loading) {
    return <LoadingState label="Loading team…" />;
  }

  if (loadError) {
    return (
      <div>
        <Link to="/admin/teams" className="text-sm font-semibold text-blue-600 hover:underline">
          ← Back to teams
        </Link>
        <p className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {loadError}
        </p>
      </div>
    );
  }

  if (!team) {
    return (
      <div>
        <Link to="/admin/teams" className="text-sm font-semibold text-blue-600 hover:underline">
          ← Back to teams
        </Link>
        <p className="mt-6 text-sm text-gray-600">Team not found.</p>
      </div>
    );
  }

  const isInactive = team.isActive === false;

  return (
    <div>
      <div className="border-b border-gray-100 pb-6">
        <Link to="/admin/teams" className="text-sm font-semibold text-blue-600 hover:underline">
          ← Back to teams
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-black tracking-tight text-gray-900 md:text-3xl">{team.teamName}</h1>
          <span
            className={
              isInactive
                ? "rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700"
                : "rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800"
            }
          >
            {isInactive ? "Inactive" : "Active"}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-600">{team.sportType}</p>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      {banner ? (
        <p className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {banner}
        </p>
      ) : null}

      {!capId && memberIds.length > 0 ? (
        <p className="mt-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          This team has no captain. Choose a captain from the members list below.
        </p>
      ) : null}

      <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-gray-900">Team details</h2>
        <form onSubmit={handleSaveInfo} className="mt-4 grid gap-4 sm:grid-cols-2">
          <TextField
            id="edit-team-name"
            name="teamName"
            label="Team name"
            value={teamName}
            onChange={(e) => {
              setTeamName(e.target.value);
              setFieldErrors((f) => {
                const next = { ...f };
                delete next.teamName;
                return next;
              });
            }}
            error={fieldErrors.teamName}
            required
          />
          <TextField
            id="edit-team-sport"
            name="sportType"
            label="Sport type"
            value={sportType}
            onChange={(e) => {
              setSportType(e.target.value);
              setFieldErrors((f) => {
                const next = { ...f };
                delete next.sportType;
                return next;
              });
            }}
            error={fieldErrors.sportType}
            required
          />
          <div className="sm:col-span-2">
            <Button type="submit" variant="primary" size="sm" disabled={savingInfo}>
              {savingInfo ? "Saving…" : "Save details"}
            </Button>
          </div>
        </form>
      </section>

      <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-gray-900">Captain</h2>
        <p className="mt-1 text-sm text-gray-600">
          The captain must be a current team member. Choose who leads this team.
        </p>
        <div className="mt-4 max-w-md">
          <SelectField
            id="detail-captain"
            label="Captain"
            value={captainId}
            onChange={handleCaptainChange}
            disabled={savingCaptain || memberIds.length === 0}
          >
            <option value="">{memberIds.length ? "Select captain…" : "Add members first"}</option>
            {memberList.map((m) => {
              const id = refToId(m);
              if (!id) return null;
              return (
                <option key={id} value={id}>
                  {memberName(m)}
                </option>
              );
            })}
          </SelectField>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-gray-900">Members</h2>
        <p className="mt-1 text-sm text-gray-600">
          Remove a player from the roster. You cannot remove the captain until another member is assigned as captain.
        </p>
        {memberList.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">No members yet. Add players below.</p>
        ) : (
          <ul className="mt-4 divide-y divide-gray-100 rounded-xl border border-gray-100">
            {memberList.map((m) => {
              const id = refToId(m);
              if (!id) return null;
              const isCap = capId === id;
              return (
                <li key={id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <p className="font-semibold text-gray-900">{memberName(m)}</p>
                    {typeof m === "object" && m?.studentId ? (
                      <p className="text-xs text-gray-500">{m.studentId}</p>
                    ) : null}
                    {isCap ? (
                      <span className="mt-1 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-800">
                        Captain
                      </span>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    disabled={Boolean(removeBusy)}
                    onClick={() => handleRemoveMember(id)}
                  >
                    {removeBusy === id ? "…" : "Remove"}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <h3 className="mt-8 text-sm font-bold text-gray-900">Add players</h3>
        <p className="mt-1 text-xs text-gray-500">Only players that are not already on this team are listed.</p>
        {playersNotInTeam.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">No additional players available to add.</p>
        ) : (
          <>
            <div className="mt-3">
              <PlayerPicker
                players={playersNotInTeam}
                selectedIds={addMemberIds}
                onChange={setAddMemberIds}
                disabled={addingMembers}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              disabled={addingMembers || addMemberIds.length === 0}
              onClick={handleAddMembers}
            >
              {addingMembers ? "Adding…" : "Add selected players"}
            </Button>
          </>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-gray-900">Status</h2>
        <p className="mt-1 text-sm text-gray-600">
          Deactivated teams stay in the system but can be hidden from selections elsewhere.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {!isInactive ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="!border-red-200 !text-red-700"
              onClick={() => setDeactivateOpen(true)}
            >
              Deactivate team
            </Button>
          ) : (
            <Button type="button" variant="primary" size="sm" onClick={handleReactivate}>
              Reactivate team
            </Button>
          )}
        </div>
      </section>

      <ConfirmDialog
        open={deactivateOpen}
        title="Deactivate this team?"
        message="The team will be marked inactive. You can reactivate it later from this page."
        confirmLabel="Deactivate"
        cancelLabel="Cancel"
        danger
        loading={deactivateBusy}
        onCancel={() => !deactivateBusy && setDeactivateOpen(false)}
        onConfirm={handleDeactivate}
      />
    </div>
  );
}
