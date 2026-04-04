const Match = require("../models/Match");
const Event = require("../models/Event");
const Team = require("../models/Team");
const Venue = require("../models/Venue");
const Result = require("../models/Result");
const { venueSportError, venueUnavailableRangeError } = require("../utils/venueRules");
const { MATCH_DETAIL_POPULATE } = require("../utils/matchPopulate");

// Convert "14:30" => total minutes
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// Normalize date to start of day
const normalizeDate = (dateValue) => {
  const d = new Date(dateValue);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Check if date is today or future
const isTodayOrFuture = (dateValue) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const inputDate = normalizeDate(dateValue);
  return inputDate >= today;
};

// Check if time ranges overlap
const hasTimeConflict = (newStart, newEnd, existingStart, existingEnd) => {
  return newStart < existingEnd && newEnd > existingStart;
};

// @desc    Create match
// @route   POST /api/matches
// @access  Private (Admin, Organizer)
const createMatch = async (req, res) => {
  try {
    const {
      event,
      teamA,
      teamB,
      venue,
      date,
      startTime,
      endTime,
      round,
      notes,
    } = req.body;

    if (!event || !teamA || !teamB || !venue || !date || !startTime || !endTime) {
      return res.status(400).json({
        message:
          "Event, teamA, teamB, venue, date, startTime, and endTime are required",
      });
    }

    if (teamA === teamB) {
      return res.status(400).json({
        message: "Team A and Team B cannot be the same",
      });
    }

    if (!isTodayOrFuture(date)) {
      return res.status(400).json({
        message: "Match date cannot be in the past",
      });
    }

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    if (startMinutes >= endMinutes) {
      return res.status(400).json({
        message: "End time must be after start time",
      });
    }

    const foundEvent = await Event.findById(event);
    if (!foundEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    const matchDateOnly = normalizeDate(date);
    const eventStartDate = normalizeDate(foundEvent.startDate);
    const eventEndDate = normalizeDate(foundEvent.endDate);

    if (matchDateOnly < eventStartDate || matchDateOnly > eventEndDate) {
      return res.status(400).json({
        message: "Match date must be within the event date range",
      });
    }

    const foundTeamA = await Team.findById(teamA);
    const foundTeamB = await Team.findById(teamB);

    if (!foundTeamA || !foundTeamB) {
      return res.status(404).json({
        message: "One or both teams not found",
      });
    }

    const foundVenue = await Venue.findById(venue);
    if (!foundVenue) {
      return res.status(404).json({ message: "Venue not found" });
    }

    if (foundVenue.status !== "available") {
      return res.status(400).json({
        message: "Venue is currently unavailable",
      });
    }

    const sportErr = venueSportError(foundVenue, foundEvent.sportType);
    if (sportErr) {
      return res.status(400).json({ message: sportErr });
    }

    const unavailErr = venueUnavailableRangeError(foundVenue, matchDateOnly, matchDateOnly);
    if (unavailErr) {
      return res.status(400).json({ message: unavailErr });
    }

    if (foundEvent.teams && foundEvent.teams.length > 0) {
      const eventTeamIds = foundEvent.teams.map((id) => id.toString());

      if (
        !eventTeamIds.includes(teamA.toString()) ||
        !eventTeamIds.includes(teamB.toString())
      ) {
        return res.status(400).json({
          message: "Both teams must belong to the selected event",
        });
      }
    }

    const nextDay = new Date(matchDateOnly);
    nextDay.setDate(nextDay.getDate() + 1);

    const sameDayMatches = await Match.find({
      venue,
      date: {
        $gte: matchDateOnly,
        $lt: nextDay,
      },
      status: { $ne: "cancelled" },
    });

    const venueConflict = sameDayMatches.some((existingMatch) => {
      const existingStart = timeToMinutes(existingMatch.startTime);
      const existingEnd = timeToMinutes(existingMatch.endTime);

      return hasTimeConflict(startMinutes, endMinutes, existingStart, existingEnd);
    });

    if (venueConflict) {
      return res.status(400).json({
        message: "Venue is already booked for the selected time",
      });
    }

    const duplicateMatch = await Match.findOne({
      event,
      date: {
        $gte: matchDateOnly,
        $lt: nextDay,
      },
      startTime,
      endTime,
      $or: [
        { teamA, teamB },
        { teamA: teamB, teamB: teamA },
      ],
    });

    if (duplicateMatch) {
      return res.status(400).json({
        message: "A similar match already exists for this event and time",
      });
    }

    const match = await Match.create({
      event,
      teamA,
      teamB,
      venue,
      date,
      startTime,
      endTime,
      round,
      notes,
    });

    return res.status(201).json(match);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get all matches
// @route   GET /api/matches
// @access  Private
const getAllMatches = async (req, res) => {
  try {
    const matches = await Match.find()
      .populate("event", "title sportType startDate endDate status description")
      .populate("teamA", "teamName sportType")
      .populate("teamB", "teamName sportType")
      .populate("venue", "venueName location capacity")
      .sort({ date: 1, startTime: 1 });

    return res.status(200).json(matches);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get single match
// @route   GET /api/matches/:id
// @access  Private
const getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id).populate(MATCH_DETAIL_POPULATE);

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    return res.status(200).json(match);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get all matches by event
// @route   GET /api/matches/event/:eventId
// @access  Private
const getMatchesByEvent = async (req, res) => {
  try {
    const foundEvent = await Event.findById(req.params.eventId);

    if (!foundEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    const matches = await Match.find({ event: req.params.eventId })
      .populate("event", "title sportType startDate endDate status description")
      .populate("teamA", "teamName sportType")
      .populate("teamB", "teamName sportType")
      .populate("venue", "venueName location")
      .sort({ date: 1, startTime: 1 });

    return res.status(200).json(matches);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update match
// @route   PUT /api/matches/:id
// @access  Private (Admin, Organizer)
const updateMatch = async (req, res) => {
  try {
    const {
      event,
      teamA,
      teamB,
      venue,
      date,
      startTime,
      endTime,
      round,
      status,
      notes,
    } = req.body;

    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    const finalEvent = event ?? match.event;
    const finalTeamA = teamA ?? match.teamA;
    const finalTeamB = teamB ?? match.teamB;
    const finalVenue = venue ?? match.venue;
    const finalDate = date ?? match.date;
    const finalStartTime = startTime ?? match.startTime;
    const finalEndTime = endTime ?? match.endTime;
    const finalRound = round ?? match.round;
    const finalStatus = status ?? match.status;
    const finalNotes = notes ?? match.notes;

    if (finalTeamA.toString() === finalTeamB.toString()) {
      return res.status(400).json({
        message: "Team A and Team B cannot be the same",
      });
    }

    if (
      !isTodayOrFuture(finalDate) &&
      finalStatus !== "completed" &&
      finalStatus !== "cancelled"
    ) {
      return res.status(400).json({
        message: "Match date cannot be in the past unless completed or cancelled",
      });
    }

    const startMinutes = timeToMinutes(finalStartTime);
    const endMinutes = timeToMinutes(finalEndTime);

    if (startMinutes >= endMinutes) {
      return res.status(400).json({
        message: "End time must be after start time",
      });
    }

    const foundEvent = await Event.findById(finalEvent);
    if (!foundEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    const finalMatchDateOnly = normalizeDate(finalDate);
    const eventStartDate = normalizeDate(foundEvent.startDate);
    const eventEndDate = normalizeDate(foundEvent.endDate);

    if (finalMatchDateOnly < eventStartDate || finalMatchDateOnly > eventEndDate) {
      return res.status(400).json({
        message: "Match date must be within the event date range",
      });
    }

    const foundTeamA = await Team.findById(finalTeamA);
    const foundTeamB = await Team.findById(finalTeamB);
    if (!foundTeamA || !foundTeamB) {
      return res.status(404).json({
        message: "One or both teams not found",
      });
    }

    const foundVenue = await Venue.findById(finalVenue);
    if (!foundVenue) {
      return res.status(404).json({ message: "Venue not found" });
    }

    if (foundVenue.status !== "available" && finalStatus !== "completed" && finalStatus !== "cancelled") {
      return res.status(400).json({
        message: "Venue is currently unavailable",
      });
    }

    const sportErr = venueSportError(foundVenue, foundEvent.sportType);
    if (sportErr) {
      return res.status(400).json({ message: sportErr });
    }

    const unavailErr = venueUnavailableRangeError(foundVenue, finalMatchDateOnly, finalMatchDateOnly);
    if (unavailErr) {
      return res.status(400).json({ message: unavailErr });
    }

    if (foundEvent.teams && foundEvent.teams.length > 0) {
      const eventTeamIds = foundEvent.teams.map((id) => id.toString());

      if (
        !eventTeamIds.includes(finalTeamA.toString()) ||
        !eventTeamIds.includes(finalTeamB.toString())
      ) {
        return res.status(400).json({
          message: "Both teams must belong to the selected event",
        });
      }
    }

    const nextDay = new Date(finalMatchDateOnly);
    nextDay.setDate(nextDay.getDate() + 1);

    const sameDayMatches = await Match.find({
      _id: { $ne: match._id },
      venue: finalVenue,
      date: {
        $gte: finalMatchDateOnly,
        $lt: nextDay,
      },
      status: { $ne: "cancelled" },
    });

    const venueConflict = sameDayMatches.some((existingMatch) => {
      const existingStart = timeToMinutes(existingMatch.startTime);
      const existingEnd = timeToMinutes(existingMatch.endTime);

      return hasTimeConflict(startMinutes, endMinutes, existingStart, existingEnd);
    });

    if (venueConflict) {
      return res.status(400).json({
        message: "Venue is already booked for the selected time",
      });
    }

    const duplicateMatch = await Match.findOne({
      _id: { $ne: match._id },
      event: finalEvent,
      date: {
        $gte: finalMatchDateOnly,
        $lt: nextDay,
      },
      startTime: finalStartTime,
      endTime: finalEndTime,
      $or: [
        { teamA: finalTeamA, teamB: finalTeamB },
        { teamA: finalTeamB, teamB: finalTeamA },
      ],
    });

    if (duplicateMatch) {
      return res.status(400).json({
        message: "A similar match already exists for this event and time",
      });
    }

    match.event = finalEvent;
    match.teamA = finalTeamA;
    match.teamB = finalTeamB;
    match.venue = finalVenue;
    match.date = finalDate;
    match.startTime = finalStartTime;
    match.endTime = finalEndTime;
    match.round = finalRound;
    match.status = finalStatus;
    match.notes = finalNotes;

    const updatedMatch = await match.save();

    return res.status(200).json(updatedMatch);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel match
// @route   PATCH /api/matches/:id/cancel
// @access  Private (Admin, Organizer)
const cancelMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    match.status = "cancelled";

    const updatedMatch = await match.save();

    return res.status(200).json({
      message: "Match cancelled successfully",
      match: updatedMatch,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Delete cancelled match (and its result if any)
// @route   DELETE /api/matches/:id
// @access  Private (Admin, Organizer)
const deleteCancelledMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    if (match.status !== "cancelled") {
      return res.status(400).json({
        message: "Only cancelled matches can be deleted",
      });
    }

    await Result.deleteMany({ match: match._id });
    await Match.findByIdAndDelete(match._id);

    return res.status(200).json({ message: "Match deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update match status
// @route   PATCH /api/matches/:id/status
// @access  Private (Admin, Organizer)
const updateMatchStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    if (!["scheduled", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    match.status = status;

    const updatedMatch = await match.save();

    return res.status(200).json({
      message: "Match status updated successfully",
      match: updatedMatch,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createMatch,
  getAllMatches,
  getMatchById,
  getMatchesByEvent,
  updateMatch,
  cancelMatch,
  deleteCancelledMatch,
  updateMatchStatus,
};