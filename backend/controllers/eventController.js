const Event = require("../models/Event");
const Venue = require("../models/Venue");
const Team = require("../models/Team");
const Player = require("../models/Player");
const Match = require("../models/Match");
const Result = require("../models/Result");
const { venueSportError, venueUnavailableRangeError } = require("../utils/venueRules");

// normalize date to beginning of day
const normalizeDate = (dateValue) => {
  const d = new Date(dateValue);
  d.setHours(0, 0, 0, 0);
  return d;
};

// check today or future
const isTodayOrFuture = (dateValue) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const inputDate = normalizeDate(dateValue);
  return inputDate >= today;
};

const getTodayStart = () => {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
};

/**
 * Derives status from calendar vs today. Does not override cancelled or completed.
 */
function resolveScheduleDrivenStatus(eventLike) {
  const { status, startDate, endDate } = eventLike;
  if (status === "cancelled" || status === "completed") {
    return null;
  }

  const today = getTodayStart();
  const start = normalizeDate(startDate);
  const end = normalizeDate(endDate);

  let desired;
  if (today > end) {
    desired = "completed";
  } else if (today >= start) {
    desired = "ongoing";
  } else {
    desired = "upcoming";
  }

  return desired === status ? null : desired;
}

async function syncAllNonCancelledEventsScheduleStatus() {
  const candidates = await Event.find({ status: { $in: ["upcoming", "ongoing"] } }).lean();
  const ops = [];
  for (const e of candidates) {
    const next = resolveScheduleDrivenStatus(e);
    if (next) {
      ops.push({
        updateOne: {
          filter: { _id: e._id },
          update: { $set: { status: next } },
        },
      });
    }
  }
  if (ops.length) {
    await Event.bulkWrite(ops, { ordered: false });
  }
}

/** Only these statuses reserve the venue on their date range (no double-booking). */
const VENUE_RESERVING_STATUSES = ["upcoming", "ongoing"];

function statusReservesVenue(status) {
  return VENUE_RESERVING_STATUSES.includes(status);
}

/** @param {unknown} excludeEventId omit to skip exclusion */
async function findOverlappingVenueBooking(venueId, rangeStart, rangeEnd, excludeEventId) {
  const filter = {
    venue: venueId,
    status: { $in: VENUE_RESERVING_STATUSES },
    startDate: { $lte: rangeEnd },
    endDate: { $gte: rangeStart },
  };
  if (excludeEventId) {
    filter._id = { $ne: excludeEventId };
  }
  return Event.findOne(filter).select("title startDate endDate").lean();
}

// @desc    Create event
// @route   POST /api/events
// @access  Private (Admin, Organizer)
const createEvent = async (req, res) => {
  try {
    const {
      title,
      sportType,
      startDate,
      endDate,
      venue,
      teams,
      participants,
      description,
      status: statusInput,
    } = req.body;

    const allowedStatuses = ["upcoming", "ongoing", "completed", "cancelled"];
    const initialStatus =
      statusInput && allowedStatuses.includes(statusInput) ? statusInput : "upcoming";

    if (!title || !sportType || !startDate || !endDate || !venue) {
      return res.status(400).json({
        message: "Title, sport type, startDate, endDate, and venue are required",
      });
    }

    if (!isTodayOrFuture(startDate)) {
      return res.status(400).json({
        message: "Event start date cannot be in the past",
      });
    }

    const normalizedStartDate = normalizeDate(startDate);
    const normalizedEndDate = normalizeDate(endDate);

    if (normalizedEndDate < normalizedStartDate) {
      return res.status(400).json({
        message: "End date must be the same as or after start date",
      });
    }

    const foundVenue = await Venue.findById(venue);
    if (!foundVenue) {
      return res.status(404).json({ message: "Venue not found" });
    }

    if (foundVenue.status !== "available") {
      return res.status(400).json({ message: "Venue is currently unavailable" });
    }

    const sportErr = venueSportError(foundVenue, sportType.trim());
    if (sportErr) {
      return res.status(400).json({ message: sportErr });
    }

    const unavailErr = venueUnavailableRangeError(foundVenue, normalizedStartDate, normalizedEndDate);
    if (unavailErr) {
      return res.status(400).json({ message: unavailErr });
    }

    if (statusReservesVenue(initialStatus)) {
      await syncAllNonCancelledEventsScheduleStatus();
      const clash = await findOverlappingVenueBooking(
        venue,
        normalizedStartDate,
        normalizedEndDate,
        null
      );
      if (clash) {
        return res.status(400).json({
          message: `This venue is already booked for overlapping dates by another event (“${clash.title}”).`,
        });
      }
    }

    const duplicateEvent = await Event.findOne({
      title: title.trim(),
      sportType: sportType.trim(),
      startDate: normalizedStartDate,
      endDate: normalizedEndDate,
    });

    if (duplicateEvent) {
      return res.status(400).json({
        message: "A similar event already exists",
      });
    }

    if (teams && teams.length > 0) {
      const foundTeams = await Team.find({ _id: { $in: teams } });
      if (foundTeams.length !== teams.length) {
        return res.status(400).json({
          message: "One or more team IDs are invalid",
        });
      }
    }

    if (participants && participants.length > 0) {
      const foundPlayers = await Player.find({ _id: { $in: participants } });
      if (foundPlayers.length !== participants.length) {
        return res.status(400).json({
          message: "One or more participant IDs are invalid",
        });
      }
    }

    const event = await Event.create({
      title,
      sportType,
      startDate: normalizedStartDate,
      endDate: normalizedEndDate,
      venue,
      teams: teams || [],
      participants: participants || [],
      description,
      status: initialStatus,
    });

    const scheduleStatus = resolveScheduleDrivenStatus(event);
    if (scheduleStatus) {
      event.status = scheduleStatus;
      await event.save();
    }

    return res.status(201).json(event);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Private
const getAllEvents = async (req, res) => {
  try {
    await syncAllNonCancelledEventsScheduleStatus();

    const events = await Event.find()
      .populate("venue", "venueName location capacity status")
      .populate("teams", "teamName sportType")
      .populate("participants", "fullName studentId email")
      .sort({ startDate: 1 });

    return res.status(200).json(events);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Private
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const scheduleStatus = resolveScheduleDrivenStatus(event);
    if (scheduleStatus) {
      event.status = scheduleStatus;
      await event.save();
    }

    await event.populate("venue", "venueName location capacity status");
    await event.populate("teams", "teamName sportType captain");
    await event.populate("participants", "fullName studentId email");

    return res.status(200).json(event);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get upcoming events
// @route   GET /api/events/upcoming/list
// @access  Private
const getUpcomingEvents = async (req, res) => {
  try {
    await syncAllNonCancelledEventsScheduleStatus();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const events = await Event.find({
      endDate: { $gte: today },
      status: { $in: ["upcoming", "ongoing"] },
    })
      .populate("venue", "venueName location")
      .sort({ startDate: 1 });

    return res.status(200).json(events);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Admin, Organizer)
const updateEvent = async (req, res) => {
  try {
    const {
      title,
      sportType,
      startDate,
      endDate,
      venue,
      teams,
      participants,
      status,
      description,
    } = req.body;

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const finalTitle = title ?? event.title;
    const finalSportType = sportType ?? event.sportType;
    const finalStartDate = startDate ? normalizeDate(startDate) : normalizeDate(event.startDate);
    const finalEndDate = endDate ? normalizeDate(endDate) : normalizeDate(event.endDate);
    const finalVenue = venue ?? event.venue;
    const finalStatus = status ?? event.status;
    const finalDescription = description ?? event.description;

    if (
      !isTodayOrFuture(finalStartDate) &&
      !["completed", "ongoing", "cancelled"].includes(finalStatus)
    ) {
      return res.status(400).json({
        message: "Start date cannot be in the past unless event is ongoing, completed, or cancelled",
      });
    }

    if (finalEndDate < finalStartDate) {
      return res.status(400).json({
        message: "End date must be the same as or after start date",
      });
    }

    const foundVenue = await Venue.findById(finalVenue);
    if (!foundVenue) {
      return res.status(404).json({ message: "Venue not found" });
    }

    if (foundVenue.status !== "available") {
      return res.status(400).json({ message: "Venue is currently unavailable" });
    }

    const sportErr = venueSportError(foundVenue, finalSportType.trim());
    if (sportErr) {
      return res.status(400).json({ message: sportErr });
    }

    const unavailErr = venueUnavailableRangeError(foundVenue, finalStartDate, finalEndDate);
    if (unavailErr) {
      return res.status(400).json({ message: unavailErr });
    }

    if (statusReservesVenue(finalStatus)) {
      await syncAllNonCancelledEventsScheduleStatus();
      const clash = await findOverlappingVenueBooking(
        finalVenue,
        finalStartDate,
        finalEndDate,
        event._id
      );
      if (clash) {
        return res.status(400).json({
          message: `This venue is already booked for overlapping dates by another event (“${clash.title}”).`,
        });
      }
    }

    const duplicateEvent = await Event.findOne({
      _id: { $ne: event._id },
      title: finalTitle.trim(),
      sportType: finalSportType.trim(),
      startDate: finalStartDate,
      endDate: finalEndDate,
    });

    if (duplicateEvent) {
      return res.status(400).json({
        message: "Another similar event already exists",
      });
    }

    if (teams !== undefined) {
      const foundTeams = await Team.find({ _id: { $in: teams } });
      if (foundTeams.length !== teams.length) {
        return res.status(400).json({
          message: "One or more team IDs are invalid",
        });
      }
      event.teams = teams;
    }

    if (participants !== undefined) {
      const foundPlayers = await Player.find({ _id: { $in: participants } });
      if (foundPlayers.length !== participants.length) {
        return res.status(400).json({
          message: "One or more participant IDs are invalid",
        });
      }
      event.participants = participants;
    }

    event.title = finalTitle;
    event.sportType = finalSportType;
    event.startDate = finalStartDate;
    event.endDate = finalEndDate;
    event.venue = finalVenue;
    event.status = finalStatus;
    event.description = finalDescription;

    let updatedEvent = await event.save();

    const scheduleStatus = resolveScheduleDrivenStatus(updatedEvent);
    if (scheduleStatus) {
      updatedEvent.status = scheduleStatus;
      updatedEvent = await updatedEvent.save();
    }

    return res.status(200).json(updatedEvent);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel event
// @route   PATCH /api/events/:id/cancel
// @access  Private (Admin, Organizer)
const cancelEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    event.status = "cancelled";

    const updatedEvent = await event.save();

    return res.status(200).json({
      message: "Event cancelled successfully",
      event: updatedEvent,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Delete cancelled event (and its matches / results)
// @route   DELETE /api/events/:id
// @access  Private (Admin, Organizer)
const deleteCancelledEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.status !== "cancelled") {
      return res.status(400).json({
        message: "Only cancelled events can be deleted",
      });
    }

    const matchIds = await Match.find({ event: event._id }).distinct("_id");
    if (matchIds.length > 0) {
      await Result.deleteMany({ match: { $in: matchIds } });
      await Match.deleteMany({ _id: { $in: matchIds } });
    }

    await Player.updateMany(
      { participationHistory: event._id },
      { $pull: { participationHistory: event._id } }
    );

    await Event.findByIdAndDelete(event._id);

    return res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  getUpcomingEvents,
  updateEvent,
  cancelEvent,
  deleteCancelledEvent,
};