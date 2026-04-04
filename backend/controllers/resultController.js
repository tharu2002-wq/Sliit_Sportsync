const mongoose = require("mongoose");
const Result = require("../models/Result");
const Match = require("../models/Match");
const Event = require("../models/Event");
const Team = require("../models/Team");
require("../models/Venue");
const { MATCH_DETAIL_POPULATE } = require("../utils/matchPopulate");

const MAX_PLAYER_NOTE_LEN = 500;

async function rosterPlayerIdSet(teamAId, teamBId) {
  const [ta, tb] = await Promise.all([
    Team.findById(teamAId).select("captain members"),
    Team.findById(teamBId).select("captain members"),
  ]);
  const set = new Set();
  const add = (id) => {
    if (id) set.add(String(id));
  };
  if (ta) {
    add(ta.captain);
    (ta.members || []).forEach(add);
  }
  if (tb) {
    add(tb.captain);
    (tb.members || []).forEach(add);
  }
  return set;
}

function parsePlayerNotesArray(raw, allowedIds) {
  if (!Array.isArray(raw)) {
    return { error: "playerNotes must be an array" };
  }
  const seen = new Set();
  const out = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const pid = row.player;
    if (!pid) {
      return { error: "Each player note entry must include a player id" };
    }
    const idStr = String(pid);
    if (!allowedIds.has(idStr)) {
      return {
        error:
          "Each player note must reference a player on one of the teams in this match",
      };
    }
    if (seen.has(idStr)) {
      return { error: "Duplicate player in player notes" };
    }
    seen.add(idStr);
    const note = typeof row.note === "string" ? row.note.trim() : "";
    if (note.length > MAX_PLAYER_NOTE_LEN) {
      return {
        error: `Player notes must be at most ${MAX_PLAYER_NOTE_LEN} characters each`,
      };
    }
    out.push({ player: new mongoose.Types.ObjectId(idStr), note });
  }
  return { value: out };
}

/**
 * When a result is saved, the match is marked completed — bump the parent event from
 * `upcoming` to `ongoing` so status reflects active play (including early result entry).
 */
async function promoteEventToOngoingIfApplicable(eventId) {
  if (!eventId) return;
  const event = await Event.findById(eventId);
  if (!event || event.status === "cancelled" || event.status === "completed") return;
  if (event.status === "upcoming") {
    event.status = "ongoing";
    await event.save();
  }
}

// @desc    Create result
// @route   POST /api/results
// @access  Private (Admin, Organizer)
const createResult = async (req, res) => {
  try {
    const { match, scoreA, scoreB, notes, playerNotes } = req.body;

    if (!match || scoreA === undefined || scoreB === undefined) {
      return res.status(400).json({
        message: "Match, scoreA, and scoreB are required",
      });
    }

    const foundMatch = await Match.findById(match);

    if (!foundMatch) {
      return res.status(404).json({ message: "Match not found" });
    }

    if (foundMatch.status === "cancelled") {
      return res.status(400).json({
        message: "Cannot create a result for a cancelled match",
      });
    }

    const existingResult = await Result.findOne({ match });

    if (existingResult) {
      return res.status(400).json({
        message: "Result already exists for this match",
      });
    }

    const allowedIds = await rosterPlayerIdSet(foundMatch.teamA, foundMatch.teamB);
    const rawNotes =
      playerNotes === undefined || playerNotes === null ? [] : playerNotes;
    const parsedNotes = parsePlayerNotesArray(rawNotes, allowedIds);
    if (parsedNotes.error) {
      return res.status(400).json({ message: parsedNotes.error });
    }

    let winner = null;

    if (scoreA > scoreB) {
      winner = foundMatch.teamA;
    } else if (scoreB > scoreA) {
      winner = foundMatch.teamB;
    }

    const result = await Result.create({
      match,
      scoreA,
      scoreB,
      winner,
      updatedBy: req.user._id,
      notes,
      playerNotes: parsedNotes.value,
    });

    if (foundMatch.status !== "completed") {
      foundMatch.status = "completed";
      await foundMatch.save();
    }

    await promoteEventToOngoingIfApplicable(foundMatch.event);

    const populatedResult = await Result.findById(result._id)
      .populate({
        path: "match",
        populate: MATCH_DETAIL_POPULATE,
      })
      .populate("winner", "teamName sportType")
      .populate("updatedBy", "name email role")
      .populate({
        path: "playerNotes.player",
        select: "fullName studentId",
      });

    return res.status(201).json(populatedResult);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get all results
// @route   GET /api/results
// @access  Private
const getAllResults = async (req, res) => {
  try {
    const results = await Result.find()
      .populate({
        path: "match",
        populate: [
          { path: "event", select: "title sportType startDate endDate status description" },
          { path: "teamA", select: "teamName sportType" },
          { path: "teamB", select: "teamName sportType" },
          { path: "venue", select: "venueName location" },
        ],
      })
      .populate("winner", "teamName sportType")
      .populate("updatedBy", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get single result
// @route   GET /api/results/:id
// @access  Private
const getResultById = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate({
        path: "match",
        populate: MATCH_DETAIL_POPULATE,
      })
      .populate("winner", "teamName sportType")
      .populate("updatedBy", "name email role")
      .populate({
        path: "playerNotes.player",
        select: "fullName studentId",
      });

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update result
// @route   PUT /api/results/:id
// @access  Private (Admin, Organizer)
const updateResult = async (req, res) => {
  try {
    const { scoreA, scoreB, notes, playerNotes } = req.body;

    const result = await Result.findById(req.params.id);

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    const match = await Match.findById(result.match);

    if (!match) {
      return res.status(404).json({ message: "Related match not found" });
    }

    if (match.status === "cancelled") {
      return res.status(400).json({
        message: "Cannot update result for a cancelled match",
      });
    }

    if (scoreA !== undefined) result.scoreA = scoreA;
    if (scoreB !== undefined) result.scoreB = scoreB;
    if (notes !== undefined) result.notes = notes;

    if (playerNotes !== undefined) {
      const allowedIds = await rosterPlayerIdSet(match.teamA, match.teamB);
      const rawNotes = playerNotes === null ? [] : playerNotes;
      const parsedNotes = parsePlayerNotesArray(rawNotes, allowedIds);
      if (parsedNotes.error) {
        return res.status(400).json({ message: parsedNotes.error });
      }
      result.playerNotes = parsedNotes.value;
    }

    if (result.scoreA > result.scoreB) {
      result.winner = match.teamA;
    } else if (result.scoreB > result.scoreA) {
      result.winner = match.teamB;
    } else {
      result.winner = null;
    }

    result.updatedBy = req.user._id;

    const updatedResult = await result.save();

    if (match.status !== "completed") {
      match.status = "completed";
      await match.save();
    }

    await promoteEventToOngoingIfApplicable(match.event);

    const populatedResult = await Result.findById(updatedResult._id)
      .populate({
        path: "match",
        populate: MATCH_DETAIL_POPULATE,
      })
      .populate("winner", "teamName sportType")
      .populate("updatedBy", "name email role")
      .populate({
        path: "playerNotes.player",
        select: "fullName studentId",
      });

    return res.status(200).json(populatedResult);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get results by match
// @route   GET /api/results/match/:matchId
// @access  Private
const getResultByMatchId = async (req, res) => {
  try {
    const result = await Result.findOne({ match: req.params.matchId })
      .populate({
        path: "match",
        populate: MATCH_DETAIL_POPULATE,
      })
      .populate("winner", "teamName sportType")
      .populate("updatedBy", "name email role")
      .populate({
        path: "playerNotes.player",
        select: "fullName studentId",
      });

    if (!result) {
      return res.status(404).json({ message: "Result not found for this match" });
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get leaderboard
// @route   GET /api/results/leaderboard/table
// @access  Private
const getLeaderboard = async (req, res) => {
  try {
    const { eventId } = req.query;

    const query = {};

    if (eventId) {
      const matches = await Match.find({ event: eventId }).select("_id");
      const matchIds = matches.map((m) => m._id);
      query.match = { $in: matchIds };
    }

    const results = await Result.find(query).populate({
      path: "match",
      populate: [
        { path: "teamA", select: "teamName" },
        { path: "teamB", select: "teamName" },
      ],
    });

    const table = {};

    results.forEach((result) => {
      if (!result.match || !result.match.teamA || !result.match.teamB) return;

      const teamAId = result.match.teamA._id.toString();
      const teamBId = result.match.teamB._id.toString();

      if (!table[teamAId]) {
        table[teamAId] = {
          teamId: teamAId,
          teamName: result.match.teamA.teamName,
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0,
        };
      }

      if (!table[teamBId]) {
        table[teamBId] = {
          teamId: teamBId,
          teamName: result.match.teamB.teamName,
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0,
        };
      }

      table[teamAId].played += 1;
      table[teamBId].played += 1;

      table[teamAId].goalsFor += result.scoreA;
      table[teamAId].goalsAgainst += result.scoreB;

      table[teamBId].goalsFor += result.scoreB;
      table[teamBId].goalsAgainst += result.scoreA;

      if (!result.winner) {
        table[teamAId].draws += 1;
        table[teamBId].draws += 1;
        table[teamAId].points += 1;
        table[teamBId].points += 1;
      } else if (result.winner.toString() === teamAId) {
        table[teamAId].wins += 1;
        table[teamAId].points += 3;
        table[teamBId].losses += 1;
      } else {
        table[teamBId].wins += 1;
        table[teamBId].points += 3;
        table[teamAId].losses += 1;
      }

      table[teamAId].goalDifference =
        table[teamAId].goalsFor - table[teamAId].goalsAgainst;
      table[teamBId].goalDifference =
        table[teamBId].goalsFor - table[teamBId].goalsAgainst;
    });

    const leaderboard = Object.values(table).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) {
        return b.goalDifference - a.goalDifference;
      }
      return b.goalsFor - a.goalsFor;
    });

    return res.status(200).json(leaderboard);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get performance report
// @route   GET /api/results/performance/report
// @access  Private
const getPerformanceReport = async (req, res) => {
  try {
    const { eventId } = req.query;

    const query = {};

    if (eventId) {
      const matches = await Match.find({ event: eventId }).select("_id");
      const matchIds = matches.map((m) => m._id);
      query.match = { $in: matchIds };
    }

    const results = await Result.find(query)
      .populate({
        path: "match",
        populate: [
          { path: "event", select: "title startDate endDate" },
          { path: "teamA", select: "teamName" },
          { path: "teamB", select: "teamName" },
          { path: "venue", select: "venueName location" },
        ],
      })
      .populate("winner", "teamName")
      .sort({ createdAt: -1 });

    const report = results.map((result) => ({
      resultId: result._id,
      eventTitle: result.match?.event?.title || null,
      matchId: result.match?._id || null,
      matchDate: result.match?.date || null,
      round: result.match?.round || null,
      venue: result.match?.venue?.venueName || null,
      teamA: result.match?.teamA?.teamName || null,
      teamB: result.match?.teamB?.teamName || null,
      scoreA: result.scoreA,
      scoreB: result.scoreB,
      scoreLine: `${result.scoreA} - ${result.scoreB}`,
      winner: result.winner?.teamName || "Draw",
      notes: result.notes || "",
      updatedAt: result.updatedAt,
    }));

    return res.status(200).json(report);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Delete result
// @route   DELETE /api/results/:id
// @access  Private (Admin)
const deleteResult = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id);

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    const match = await Match.findById(result.match);

    await result.deleteOne();

    if (match) {
      const remainingResult = await Result.findOne({ match: match._id });

      if (!remainingResult && match.status === "completed") {
        match.status = "scheduled";
        await match.save();
      }
    }

    return res.status(200).json({
      message: "Result deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createResult,
  getAllResults,
  getResultById,
  updateResult,
  getResultByMatchId,
  getLeaderboard,
  getPerformanceReport,
  deleteResult,
};