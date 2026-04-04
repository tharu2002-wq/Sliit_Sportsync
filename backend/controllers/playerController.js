const Player = require("../models/Player");
const Team = require("../models/Team");
const Event = require("../models/Event");
const PlayerRequest = require("../models/PlayerRequest");

/**
 * Teams that list this player in `members` (true membership). Player.team is legacy/optional.
 * @param {import("mongoose").Types.ObjectId[]} playerIds
 */
async function findTeamsByMembership(playerIds) {
  if (!playerIds.length) return [];
  return Team.find({ members: { $in: playerIds } })
    .select("teamName sportType members")
    .lean();
}

/**
 * @param {{ _id: import("mongoose").Types.ObjectId }[]} players
 * @returns {Promise<Map<string, Array<{ _id: unknown, teamName: string, sportType: string }>>>}
 */
async function buildTeamsByPlayerId(players) {
  const map = new Map();
  const ids = players.map((p) => p._id);
  for (const id of ids) {
    map.set(id.toString(), []);
  }
  const teams = await findTeamsByMembership(ids);
  for (const t of teams) {
    for (const mid of t.members || []) {
      const pid = mid.toString();
      if (map.has(pid)) {
        map.get(pid).push({
          _id: t._id,
          teamName: t.teamName,
          sportType: t.sportType,
        });
      }
    }
  }
  return map;
}

// @desc    Create player
// @route   POST /api/players
// @access  Private
const createPlayer = async (req, res) => {
  try {
    const { studentId, fullName, email, department, age, gender, sportTypes } =
      req.body;

    if (!studentId || !fullName || !email || !department || !age || !gender) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const existingStudentId = await Player.findOne({ studentId });
    if (existingStudentId) {
      return res.status(400).json({ message: "Student ID already exists" });
    }

    const existingEmail = await Player.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const player = await Player.create({
      studentId,
      fullName,
      email,
      department,
      age,
      gender,
      sportTypes,
    });

    const teamsByPlayer = await buildTeamsByPlayerId([player]);
    const plain = player.toObject();
    plain.teams = teamsByPlayer.get(player._id.toString()) ?? [];

    return res.status(201).json(plain);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Players linked to the current user (same Student ID on account as on athlete record)
// @route   GET /api/players/me
// @access  Private
const getPlayersForCurrentUser = async (req, res) => {
  try {
    const sid = req.user.studentId?.trim();
    if (!sid) {
      return res.status(200).json([]);
    }

    const players = await Player.find({ studentId: sid }).sort({ createdAt: -1 }).lean();
    const teamsByPlayer = await buildTeamsByPlayerId(players);

    const result = players.map((p) => ({
      ...p,
      teams: teamsByPlayer.get(p._id.toString()) ?? [],
    }));

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get all players
// @route   GET /api/players
// @access  Private
const getAllPlayers = async (req, res) => {
  try {
    const players = await Player.find().sort({ createdAt: -1 }).lean();
    const teamsByPlayer = await buildTeamsByPlayerId(players);

    const result = players.map((p) => ({
      ...p,
      teams: teamsByPlayer.get(p._id.toString()) ?? [],
    }));

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get single player
// @route   GET /api/players/:id
// @access  Private
const getPlayerById = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id)
      .populate("participationHistory", "title sportType startDate endDate status");

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    const teamsByPlayer = await buildTeamsByPlayerId([player]);
    const plain = player.toObject();
    plain.teams = teamsByPlayer.get(player._id.toString()) ?? [];

    return res.status(200).json(plain);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update player
// @route   PUT /api/players/:id
// @access  Private
const updatePlayer = async (req, res) => {
  try {
    const { studentId, fullName, email, department, age, gender, sportTypes } =
      req.body;

    const player = await Player.findById(req.params.id);

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    if (studentId && studentId !== player.studentId) {
      const existingStudentId = await Player.findOne({ studentId });
      if (existingStudentId) {
        return res.status(400).json({ message: "Student ID already exists" });
      }
    }

    if (email && email !== player.email) {
      const existingEmail = await Player.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    player.studentId = studentId || player.studentId;
    player.fullName = fullName || player.fullName;
    player.email = email || player.email;
    player.department = department || player.department;
    player.age = age || player.age;
    player.gender = gender || player.gender;
    player.sportTypes = sportTypes || player.sportTypes;

    const updatedPlayer = await player.save();

    const teamsByPlayer = await buildTeamsByPlayerId([updatedPlayer]);
    const plain = updatedPlayer.toObject();
    plain.teams = teamsByPlayer.get(updatedPlayer._id.toString()) ?? [];

    return res.status(200).json(plain);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Delete player and detach from teams / events
// @route   DELETE /api/players/:id
// @access  Private (admin, organizer)
const deletePlayer = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    const pid = player._id;

    await Team.updateMany({ members: pid }, { $pull: { members: pid } });
    await Team.updateMany({ captain: pid }, { $unset: { captain: 1 } });
    await Event.updateMany({ participants: pid }, { $pull: { participants: pid } });
    await PlayerRequest.updateMany({ createdPlayer: pid }, { $unset: { createdPlayer: 1 } });

    await Player.findByIdAndDelete(pid);

    return res.status(200).json({ message: "Player removed", _id: pid });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPlayer,
  getAllPlayers,
  getPlayersForCurrentUser,
  getPlayerById,
  updatePlayer,
  deletePlayer,
};