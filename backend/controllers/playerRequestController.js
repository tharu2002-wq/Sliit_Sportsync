const Player = require("../models/Player");
const PlayerRequest = require("../models/PlayerRequest");
const User = require("../models/User");


const createPlayerRequest = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can submit a player request." });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const studentId = user.studentId?.trim();
    if (!studentId) {
      return res.status(400).json({
        message: "Add your Student ID to your profile before requesting player registration.",
      });
    }

    const fullName = user.name?.trim();
    const email = user.email?.trim()?.toLowerCase();
    if (!fullName || !email) {
      return res.status(400).json({ message: "Your profile must include name and email." });
    }

    const existingPlayer = await Player.findOne({ studentId });
    if (existingPlayer) {
      return res.status(400).json({ message: "You are already registered as a player." });
    }

    const pending = await PlayerRequest.findOne({ user: user._id, status: "pending" });
    if (pending) {
      return res.status(400).json({ message: "You already have a pending player request." });
    }

    const profileAge =
      typeof user.age === "number" &&
      Number.isInteger(user.age) &&
      user.age >= 17 &&
      user.age <= 120
        ? user.age
        : undefined;

    const doc = await PlayerRequest.create({
      user: user._id,
      studentId,
      fullName,
      email,
      faculty: user.faculty?.trim() || undefined,
      academicYear: user.academicYear?.trim() || undefined,
      age: profileAge,
      skills: Array.isArray(user.skills) ? user.skills : [],
      status: "pending",
    });

    const populated = await PlayerRequest.findById(doc._id)
      .populate("user", "name email role")
      .lean();

    return res.status(201).json({ message: "Request submitted", request: populated });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Latest player request for the current student
 * @route   GET /api/player-requests/me
 * @access  Private (student)
 */
const getMyPlayerRequest = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const request = await PlayerRequest.findOne({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ request: request ?? null });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    List player registration requests (admin)
 * @route   GET /api/player-requests
 * @access  Private (admin)
 */
const listPlayerRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      filter.status = status;
    }

    const list = await PlayerRequest.find(filter)
      .populate("user", "name email role studentId")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(list);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Approve request and create Player record
 * @route   PATCH /api/player-requests/:id/accept
 * @access  Private (admin)
 */
const acceptPlayerRequest = async (req, res) => {
  try {
    const { department, age, gender, sportTypes } = req.body;

    if (!department || age === undefined || age === null || !gender) {
      return res.status(400).json({ message: "department, age, and gender are required" });
    }

    const request = await PlayerRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    if (request.status !== "pending") {
      return res.status(400).json({ message: "This request is not pending" });
    }

    const sid = request.studentId?.trim();
    const em = request.email?.trim()?.toLowerCase();

    const existingStudentId = await Player.findOne({ studentId: sid });
    if (existingStudentId) {
      return res.status(400).json({ message: "A player with this Student ID already exists" });
    }

    const existingEmail = await Player.findOne({ email: em });
    if (existingEmail) {
      return res.status(400).json({ message: "A player with this email already exists" });
    }

    const ageNum = Number(age);
    if (!Number.isInteger(ageNum) || ageNum <= 16 || ageNum > 120) {
      return res.status(400).json({ message: "Invalid age" });
    }

    if (!["male", "female", "other"].includes(gender)) {
      return res.status(400).json({ message: "Invalid gender" });
    }

    let sportTypesList = Array.isArray(sportTypes)
      ? sportTypes.map((s) => String(s).trim()).filter(Boolean)
      : [];
    if (
      sportTypesList.length === 0 &&
      Array.isArray(request.skills) &&
      request.skills.length > 0
    ) {
      sportTypesList = request.skills.map((s) => String(s).trim()).filter(Boolean);
    }

    const player = await Player.create({
      studentId: sid,
      fullName: request.fullName.trim(),
      email: em,
      department: String(department).trim(),
      age: ageNum,
      gender,
      sportTypes: sportTypesList,
    });

    request.status = "approved";
    request.reviewedAt = new Date();
    request.reviewedBy = req.user._id;
    request.createdPlayer = player._id;
    request.rejectReason = "";
    await request.save();

    const plain = player.toObject();
    return res.status(200).json({
      message: "Player registered from request",
      player: plain,
      request: await PlayerRequest.findById(request._id).lean(),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Reject a pending request
 * @route   PATCH /api/player-requests/:id/reject
 * @access  Private (admin)
 */
const rejectPlayerRequest = async (req, res) => {
  try {
    const { reason } = req.body;

    const request = await PlayerRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    if (request.status !== "pending") {
      return res.status(400).json({ message: "This request is not pending" });
    }

    request.status = "rejected";
    request.reviewedAt = new Date();
    request.reviewedBy = req.user._id;
    request.rejectReason = reason != null ? String(reason).trim().slice(0, 500) : "";
    await request.save();

    return res.status(200).json({ message: "Request rejected", request: await PlayerRequest.findById(request._id).lean() });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPlayerRequest,
  getMyPlayerRequest,
  listPlayerRequests,
  acceptPlayerRequest,
  rejectPlayerRequest,
};
