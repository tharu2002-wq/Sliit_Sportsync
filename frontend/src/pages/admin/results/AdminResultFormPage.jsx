import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getMatchById, getMatches } from "../../../api/matches";
import { createResult, getResultById, getResults, updateResult } from "../../../api/results";
import { MatchResultSummary } from "../../../components/admin/results/MatchResultSummary";
import { ResultPlayerNotesFields } from "../../../components/admin/results/ResultPlayerNotesFields";
import { ResultScoreFields } from "../../../components/admin/results/ResultScoreFields";
import { Button } from "../../../components/ui/Button";
import { LoadingState } from "../../../components/ui/LoadingSpinner";
import { SelectField } from "../../../components/ui/SelectField";
import { getApiErrorMessage } from "../../../utils/apiError";
import { matchesAwaitingResult } from "../../../utils/resultDisplayUtils";
import { getPlayerNoteError, getResultNotesError, getScoreFieldError } from "../../../utils/resultValidation";
import {
  buildPlayerNotesPayload,
  collectTeamRoster,
  playerNotesArrayToMap,
} from "../../../utils/resultRosterUtils";

const emptyScores = { scoreA: "", scoreB: "", notes: "" };

export default function AdminResultFormPage() {
  const { resultId } = useParams();
  const isEdit = Boolean(resultId);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const presetMatchId = searchParams.get("matchId") ?? "";

  const [matches, setMatches] = useState([]);
  const [existingResults, setExistingResults] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(!isEdit);
  const [loadingResult, setLoadingResult] = useState(isEdit);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [form, setForm] = useState(emptyScores);
  const [loadedMatch, setLoadedMatch] = useState(null);
  const [loadedResult, setLoadedResult] = useState(null);
  const [detailMatch, setDetailMatch] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [playerNotesById, setPlayerNotesById] = useState({});
  const [playerNoteErrors, setPlayerNoteErrors] = useState({});

  const updateForm = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const clearField = (key) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  useEffect(() => {
    if (isEdit) return;
    let cancelled = false;
    (async () => {
      setLoadingMeta(true);
      setLoadError("");
      try {
        const [m, r] = await Promise.all([getMatches(), getResults()]);
        if (cancelled) return;
        setMatches(Array.isArray(m) ? m : []);
        setExistingResults(Array.isArray(r) ? r : []);
      } catch (err) {
        if (!cancelled) setLoadError(getApiErrorMessage(err, "Could not load matches."));
      } finally {
        if (!cancelled) setLoadingMeta(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isEdit]);

  const pendingMatches = useMemo(
    () => matchesAwaitingResult(matches, existingResults),
    [matches, existingResults]
  );

  useEffect(() => {
    if (isEdit || !presetMatchId || pendingMatches.length === 0) return;
    const ok = pendingMatches.some((m) => String(m._id) === String(presetMatchId));
    if (ok) setSelectedMatchId(presetMatchId);
  }, [isEdit, presetMatchId, pendingMatches]);

  useEffect(() => {
    if (isEdit || !selectedMatchId) {
      if (!isEdit && !selectedMatchId) setDetailMatch(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setDetailLoading(true);
      try {
        const m = await getMatchById(selectedMatchId);
        if (cancelled) return;
        if (String(m._id) !== String(selectedMatchId)) return;
        setDetailMatch(m);
      } catch {
        if (!cancelled) setDetailMatch(null);
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isEdit, selectedMatchId]);

  useEffect(() => {
    if (isEdit || !detailMatch) return;
    const next = {};
    for (const p of collectTeamRoster(detailMatch.teamA)) next[p._id] = "";
    for (const p of collectTeamRoster(detailMatch.teamB)) next[p._id] = "";
    setPlayerNotesById(next);
    setPlayerNoteErrors({});
  }, [isEdit, detailMatch?._id]);

  useEffect(() => {
    if (!isEdit || !loadedResult) return;
    const map = playerNotesArrayToMap(loadedResult.playerNotes);
    const rm = loadedMatch;
    if (!rm) {
      setPlayerNotesById(map);
      return;
    }
    const next = { ...map };
    for (const p of collectTeamRoster(rm.teamA)) {
      if (!(p._id in next)) next[p._id] = "";
    }
    for (const p of collectTeamRoster(rm.teamB)) {
      if (!(p._id in next)) next[p._id] = "";
    }
    setPlayerNotesById(next);
    setPlayerNoteErrors({});
  }, [isEdit, loadedResult, loadedMatch]);

  useEffect(() => {
    if (!isEdit || !resultId) {
      setLoadingResult(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingResult(true);
      setLoadError("");
      try {
        const res = await getResultById(resultId);
        if (cancelled) return;
        setLoadedResult(res);
        setLoadedMatch(res.match ?? null);
        setForm({
          scoreA: res.scoreA != null ? String(res.scoreA) : "",
          scoreB: res.scoreB != null ? String(res.scoreB) : "",
          notes: res.notes ?? "",
        });
      } catch (err) {
        if (!cancelled) setLoadError(getApiErrorMessage(err, "Could not load result."));
      } finally {
        if (!cancelled) setLoadingResult(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isEdit, resultId]);

  const selectedMatch = useMemo(() => {
    if (isEdit) return loadedMatch;
    return pendingMatches.find((m) => String(m._id) === String(selectedMatchId)) ?? null;
  }, [isEdit, loadedMatch, pendingMatches, selectedMatchId]);

  const displayMatch = isEdit ? loadedMatch : detailMatch ?? selectedMatch;

  const rosterMatch = isEdit ? loadedMatch : detailMatch;
  const rosterA = useMemo(() => collectTeamRoster(rosterMatch?.teamA), [rosterMatch]);
  const rosterB = useMemo(() => collectTeamRoster(rosterMatch?.teamB), [rosterMatch]);

  const teamAName = displayMatch?.teamA?.teamName ?? "Team A";
  const teamBName = displayMatch?.teamB?.teamName ?? "Team B";

  const validate = () => {
    const next = {};
    const pnErr = {};
    if (!isEdit) {
      if (!selectedMatchId) next.match = "Select a match";
    }
    const aErr = getScoreFieldError(form.scoreA, `Score (${teamAName})`);
    if (aErr) next.scoreA = aErr;
    const bErr = getScoreFieldError(form.scoreB, `Score (${teamBName})`);
    if (bErr) next.scoreB = bErr;
    const nErr = getResultNotesError(form.notes);
    if (nErr) next.notes = nErr;
    for (const p of [...rosterA, ...rosterB]) {
      const e = getPlayerNoteError(playerNotesById[p._id] ?? "");
      if (e) pnErr[p._id] = e;
    }
    setFieldErrors(next);
    setPlayerNoteErrors(pnErr);
    return Object.keys(next).length === 0 && Object.keys(pnErr).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setError("");
    const scoreA = Number.parseInt(form.scoreA, 10);
    const scoreB = Number.parseInt(form.scoreB, 10);
    const notes = form.notes.trim();
    const playerNotes = buildPlayerNotesPayload(playerNotesById);
    try {
      if (isEdit && resultId) {
        await updateResult(resultId, { scoreA, scoreB, notes, playerNotes });
      } else {
        await createResult({ match: selectedMatchId, scoreA, scoreB, notes, playerNotes });
      }
      navigate("/admin/results", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, isEdit ? "Could not update result." : "Could not record result."));
    } finally {
      setSaving(false);
    }
  };

  if (loadingMeta || loadingResult) {
    return <LoadingState label={loadingResult ? "Loading result…" : "Loading…"} />;
  }

  if (isEdit && loadError) {
    return (
      <div>
        <Link to="/admin/results" className="text-sm font-semibold text-blue-600 hover:underline">
          ← Back to results
        </Link>
        <p className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {loadError}
        </p>
      </div>
    );
  }

  if (!isEdit && loadError) {
    return (
      <div>
        <Link to="/admin/results" className="text-sm font-semibold text-blue-600 hover:underline">
          ← Back to results
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
        <Link to="/admin/results" className="text-sm font-semibold text-blue-600 hover:underline">
          ← Back to results
        </Link>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-gray-900 md:text-3xl">
          {isEdit ? "Update result" : "Record result"}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-600">
          {isEdit
            ? "Change scores or notes. The winner is updated automatically on save (draw when scores are equal)."
            : "Choose a match that does not have a result yet. Saving completes the match and stores the winner from the scores."}
        </p>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-8 max-w-3xl space-y-8">
        {!isEdit ? (
          <div>
            <SelectField
              id="result-match"
              name="match"
              label="Match"
              value={selectedMatchId}
              onChange={(e) => {
                setSelectedMatchId(e.target.value);
                clearField("match");
              }}
              error={fieldErrors.match}
              required
            >
              <option value="">Select a match awaiting a result…</option>
              {pendingMatches.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.event?.title ?? "Event"} — {m.teamA?.teamName} vs {m.teamB?.teamName}
                </option>
              ))}
            </SelectField>
            {pendingMatches.length === 0 ? (
              <p className="mt-2 text-sm text-gray-500">
                No eligible matches. Create matches in match management, or all matches already have results.
              </p>
            ) : null}
          </div>
        ) : null}

        {!isEdit && selectedMatchId && detailLoading ? (
          <p className="text-sm text-gray-500">Loading team rosters…</p>
        ) : null}

        {displayMatch ? <MatchResultSummary match={displayMatch} /> : null}

        {rosterMatch ? (
          <div className="space-y-8 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Team rosters and player notes</h2>
              <p className="mt-1 text-sm text-gray-600">
                Optional notes per player (e.g. performance, discipline). Only players listed on each team appear here.
              </p>
            </div>
            <div>
              <h3 className="mb-3 text-base font-black text-gray-900">{teamAName}</h3>
              <ResultPlayerNotesFields
                teamName={teamAName}
                players={rosterA}
                notesByPlayerId={playerNotesById}
                onPlayerNoteChange={(playerId, note) => {
                  setPlayerNotesById((prev) => ({ ...prev, [playerId]: note }));
                  setPlayerNoteErrors((prev) => {
                    if (!prev[playerId]) return prev;
                    const next = { ...prev };
                    delete next[playerId];
                    return next;
                  });
                }}
                errors={playerNoteErrors}
              />
            </div>
            <div>
              <h3 className="mb-3 text-base font-black text-gray-900">{teamBName}</h3>
              <ResultPlayerNotesFields
                teamName={teamBName}
                players={rosterB}
                notesByPlayerId={playerNotesById}
                onPlayerNoteChange={(playerId, note) => {
                  setPlayerNotesById((prev) => ({ ...prev, [playerId]: note }));
                  setPlayerNoteErrors((prev) => {
                    if (!prev[playerId]) return prev;
                    const next = { ...prev };
                    delete next[playerId];
                    return next;
                  });
                }}
                errors={playerNoteErrors}
              />
            </div>
          </div>
        ) : null}

        {isEdit && loadedResult ? (
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-800">Currently recorded winner: </span>
            {loadedResult.winner?.teamName
              ? loadedResult.winner.teamName
              : Number(loadedResult.scoreA) === Number(loadedResult.scoreB)
                ? "Draw"
                : "—"}
          </p>
        ) : null}

        <ResultScoreFields
          teamAName={teamAName}
          teamBName={teamBName}
          scoreA={form.scoreA}
          scoreB={form.scoreB}
          notes={form.notes}
          onScoreAChange={(v) => {
            updateForm({ scoreA: v });
            clearField("scoreA");
          }}
          onScoreBChange={(v) => {
            updateForm({ scoreB: v });
            clearField("scoreB");
          }}
          onNotesChange={(v) => {
            updateForm({ notes: v });
            clearField("notes");
          }}
          errors={fieldErrors}
        />

        <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-6">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={
              saving ||
              (!isEdit && pendingMatches.length === 0) ||
              (!isEdit && Boolean(selectedMatchId) && detailLoading)
            }
          >
            {saving ? "Saving…" : isEdit ? "Save changes" : "Record result"}
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={saving} onClick={() => navigate("/admin/results")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
