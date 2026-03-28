import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createTeam } from "../../../api/teams";
import { getPlayers } from "../../../api/players";
import { PlayerPicker } from "../../../components/admin/teams/PlayerPicker";
import { Button } from "../../../components/ui/Button";
import { LoadingState } from "../../../components/ui/LoadingSpinner";
import { SelectField } from "../../../components/ui/SelectField";
import { TextField } from "../../../components/ui/TextField";
import { getApiErrorMessage } from "../../../utils/apiError";
import { getTitleOrSportTypeError } from "../../../utils/eventValidation";
import { refToId } from "../../../utils/eventFormUtils";

export default function AdminTeamCreatePage() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [teamName, setTeamName] = useState("");
  const [sportType, setSportType] = useState("");
  const [memberIds, setMemberIds] = useState([]);
  const [captainId, setCaptainId] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getPlayers();
        if (!cancelled) setPlayers(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, "Could not load players."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const captainOptions = useMemo(() => {
    const set = new Set(memberIds.map(String));
    return players.filter((p) => set.has(String(p._id)));
  }, [players, memberIds]);

  useEffect(() => {
    if (captainId && !memberIds.map(String).includes(String(captainId))) {
      setCaptainId("");
    }
  }, [memberIds, captainId]);

  const validate = () => {
    const next = {};
    if (!teamName.trim()) next.teamName = "Team name is required";
    const sportErr = getTitleOrSportTypeError(sportType, "Sport type");
    if (sportErr) next.sportType = sportErr;
    if (memberIds.length === 0) next.members = "Select at least one player";
    if (!captainId) next.captain = "Captain is required";
    if (captainId && !memberIds.map(String).includes(String(captainId))) {
      next.captain = "Captain must be one of the selected players";
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setError("");
    try {
      const members = [...new Set([...memberIds.map(String), String(captainId)])];
      await createTeam({
        teamName: teamName.trim(),
        sportType: sportType.trim(),
        captain: captainId,
        members,
      });
      navigate("/admin/teams", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not create team."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading players…" />;
  }

  return (
    <div>
      <div className="border-b border-gray-100 pb-6">
        <Link to="/admin/teams" className="text-sm font-semibold text-blue-600 hover:underline">
          ← Back to teams
        </Link>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-gray-900 md:text-3xl">Create team</h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-600">
          Choose players that already exist in the system. The captain must be one of the selected players.
        </p>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {players.length === 0 ? (
        <p className="mt-6 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          No players found. Register or create players before building teams.
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-8 max-w-3xl space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="team-name"
            name="teamName"
            label="Team name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            error={fieldErrors.teamName}
            required
          />
          <TextField
            id="team-sport"
            name="sportType"
            label="Sport type"
            value={sportType}
            onChange={(e) => setSportType(e.target.value)}
            error={fieldErrors.sportType}
            required
            placeholder="e.g. Cricket"
          />
        </div>

        <div>
          <p className="mb-1.5 text-sm font-semibold text-gray-700">Players</p>
          <p className="mb-2 text-xs text-gray-500">Select at least one player. The captain must be chosen from this list.</p>
          {fieldErrors.members ? (
            <p className="mb-2 text-sm text-red-600" role="alert">
              {fieldErrors.members}
            </p>
          ) : null}
          <PlayerPicker players={players} selectedIds={memberIds} onChange={setMemberIds} disabled={saving} />
        </div>

        <SelectField
          id="team-captain"
          name="captain"
          label="Captain"
          value={captainId}
          onChange={(e) => setCaptainId(e.target.value)}
          error={fieldErrors.captain}
          required
          disabled={captainOptions.length === 0}
        >
          <option value="">{captainOptions.length ? "Select captain…" : "Select players first"}</option>
          {captainOptions.map((p) => (
            <option key={p._id} value={p._id}>
              {p.fullName ?? refToId(p)}
              {p.studentId ? ` (${p.studentId})` : ""}
            </option>
          ))}
        </SelectField>

        <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-6">
          <Button type="submit" variant="primary" size="sm" disabled={saving || players.length === 0}>
            {saving ? "Creating…" : "Create team"}
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={saving} onClick={() => navigate("/admin/teams")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
