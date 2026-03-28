const Team = require("../models/Team");
const Player = require("../models/Player");

// @desc    Create team
// @route   POST /api/teams
// @access  Private (Admin, Organizer)
const createTeam = async (req, res) => {
  try {
    const { teamName, sportType, captain, members, scheduleNotes } = req.body;

    if (!teamName || !sportType) {
      return res.status(400).json({ message: "Team name and sport type are required" });
    }

    const existingTeam = await Team.findOne({ teamName });
    if (existingTeam) {
      return res.status(400).json({ message: "Team name already exists" });
    }

    let validatedMembers = [];

    if (members && members.length > 0) {
      const foundPlayers = await Player.find({ _id: { $in: members } });
      if (foundPlayers.length !== members.length) {
        return res.status(400).json({ message: "One or more member IDs are invalid" });
      }
      validatedMembers = members;
    }

    if (captain) {
      const captainPlayer = await Player.findById(captain);
      if (!captainPlayer) {
        return res.status(400).json({ message: "Captain player not found" });
      }

      if (!validatedMembers.includes(captain)) {
        validatedMembers.push(captain);
      }
    }

    const team = await Team.create({
      teamName,
      sportType,
      captain: captain || null,
      members: validatedMembers,
      scheduleNotes,
    });

    return res.status(201).json(team);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get all teams
// @route   GET /api/teams
// @access  Private
const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate("captain", "fullName studentId email")
      .populate("members", "fullName studentId email")
      .sort({ createdAt: -1 });

    return res.status(200).json(teams);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get single team
// @route   GET /api/teams/:id
// @access  Private
const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate("captain", "fullName studentId email")
      .populate("members", "fullName studentId email");

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    return res.status(200).json(team);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private (Admin, Organizer)
const updateTeam = async (req, res) => {
  try {
    const { teamName, sportType, scheduleNotes, isActive } = req.body;

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (teamName && teamName !== team.teamName) {
      const existingTeam = await Team.findOne({ teamName });
      if (existingTeam) {
        return res.status(400).json({ message: "Team name already exists" });
      }
    }

    team.teamName = teamName || team.teamName;
    team.sportType = sportType || team.sportType;
    team.scheduleNotes = scheduleNotes ?? team.scheduleNotes;

    if (typeof isActive === "boolean") {
      team.isActive = isActive;
    }

    const updatedTeam = await team.save();

    return res.status(200).json(updatedTeam);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Add members to team
// @route   PATCH /api/teams/:id/members/add
// @access  Private (Admin, Organizer)
const addMembersToTeam = async (req, res) => {
  try {
    const { memberIds } = req.body;

    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({ message: "memberIds array is required" });
    }

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const foundPlayers = await Player.find({ _id: { $in: memberIds } });
    if (foundPlayers.length !== memberIds.length) {
      return res.status(400).json({ message: "One or more member IDs are invalid" });
    }

    memberIds.forEach((id) => {
      if (!team.members.includes(id)) {
        team.members.push(id);
      }
    });

    const updatedTeam = await team.save();

    return res.status(200).json(updatedTeam);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Remove member from team
// @route   PATCH /api/teams/:id/members/remove
// @access  Private (Admin, Organizer)
const removeMemberFromTeam = async (req, res) => {
  try {
    const { memberId } = req.body;

    if (!memberId) {
      return res.status(400).json({ message: "memberId is required" });
    }

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    team.members = team.members.filter(
      (id) => id.toString() !== memberId.toString()
    );

    if (team.captain && team.captain.toString() === memberId.toString()) {
      team.captain = null;
    }

    const updatedTeam = await team.save();

    return res.status(200).json(updatedTeam);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Assign captain
// @route   PATCH /api/teams/:id/captain
// @access  Private (Admin, Organizer)
const assignCaptain = async (req, res) => {
  try {
    const { captainId } = req.body;

    if (!captainId) {
      return res.status(400).json({ message: "captainId is required" });
    }

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const player = await Player.findById(captainId);
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    const isMember = team.members.some(
      (member) => member.toString() === captainId.toString()
    );

    if (!isMember) {
      return res.status(400).json({ message: "Captain must be a team member" });
    }

    team.captain = captainId;

    const updatedTeam = await team.save();

    return res.status(200).json(updatedTeam);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Deactivate team
// @route   PATCH /api/teams/:id/deactivate
// @access  Private (Admin, Organizer)
const deactivateTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    team.isActive = false;

    const updatedTeam = await team.save();

    return res.status(200).json({
      message: "Team deactivated successfully",
      team: updatedTeam,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
  addMembersToTeam,
  removeMemberFromTeam,
  assignCaptain,
  deactivateTeam,
};