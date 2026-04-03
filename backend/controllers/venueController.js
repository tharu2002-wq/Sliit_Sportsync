const Venue = require("../models/Venue");
const Event = require("../models/Event");
const Match = require("../models/Match");

function isDigitsOnly(str) {
  const s = String(str ?? "").trim();
  return s.length > 0 && /^[0-9]+$/.test(s);
}

const createVenue = async (req, res) => {
  try {
    const { venueName, location, capacity, status, availableDates } = req.body;

    const nameTrim = String(venueName ?? "").trim();
    const locationTrim = String(location ?? "").trim();

    if (!nameTrim || !locationTrim || !capacity) {
      return res.status(400).json({
        message: "Venue name, location, and capacity are required",
      });
    }

    if (isDigitsOnly(nameTrim)) {
      return res.status(400).json({ message: "Venue name cannot be numbers only" });
    }
    if (isDigitsOnly(locationTrim)) {
      return res.status(400).json({ message: "Location cannot be numbers only" });
    }

    const existingVenue = await Venue.findOne({ venueName: nameTrim });
    if (existingVenue) {
      return res.status(400).json({ message: "Venue name already exists" });
    }

    const venue = await Venue.create({
      venueName: nameTrim,
      location: locationTrim,
      capacity,
      status,
      availableDates,
    });

    return res.status(201).json(venue);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get all venues
// @route   GET /api/venues
// @access  Private
const getAllVenues = async (req, res) => {
  try {
    const venues = await Venue.find().sort({ createdAt: -1 });
    return res.status(200).json(venues);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get single venue
// @route   GET /api/venues/:id
// @access  Private
const getVenueById = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);

    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }

    return res.status(200).json(venue);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update venue
// @route   PUT /api/venues/:id
// @access  Private (Admin, Organizer)
const updateVenue = async (req, res) => {
  try {
    const { venueName, location, capacity, status, availableDates } = req.body;

    const venue = await Venue.findById(req.params.id);

    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }

    if (venueName !== undefined) {
      const nameTrim = String(venueName).trim();
      if (!nameTrim) {
        return res.status(400).json({ message: "Venue name cannot be empty" });
      }
      if (isDigitsOnly(nameTrim)) {
        return res.status(400).json({ message: "Venue name cannot be numbers only" });
      }
      if (nameTrim !== venue.venueName) {
        const existingVenue = await Venue.findOne({ venueName: nameTrim });
        if (existingVenue) {
          return res.status(400).json({ message: "Venue name already exists" });
        }
      }
      venue.venueName = nameTrim;
    }

    if (location !== undefined) {
      const locationTrim = String(location).trim();
      if (!locationTrim) {
        return res.status(400).json({ message: "Location cannot be empty" });
      }
      if (isDigitsOnly(locationTrim)) {
        return res.status(400).json({ message: "Location cannot be numbers only" });
      }
      venue.location = locationTrim;
    }

    if (capacity !== undefined) venue.capacity = capacity;
    if (status !== undefined) venue.status = status;
    if (availableDates !== undefined) venue.availableDates = availableDates;

    const updatedVenue = await venue.save();

    return res.status(200).json(updatedVenue);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update venue availability
// @route   PATCH /api/venues/:id/availability
// @access  Private (Admin, Organizer)
const updateVenueAvailability = async (req, res) => {
  try {
    const { status, availableDates } = req.body;

    const venue = await Venue.findById(req.params.id);

    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }

    if (status) {
      venue.status = status;
    }

    if (availableDates) {
      venue.availableDates = availableDates;
    }

    const updatedVenue = await venue.save();

    return res.status(200).json({
      message: "Venue availability updated successfully",
      venue: updatedVenue,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Delete venue
// @route   DELETE /api/venues/:id
// @access  Private (Admin, Organizer)
const deleteVenue = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);

    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }

    const [eventCount, matchCount] = await Promise.all([
      Event.countDocuments({ venue: venue._id }),
      Match.countDocuments({ venue: venue._id }),
    ]);

    if (eventCount > 0 || matchCount > 0) {
      return res.status(409).json({
        message:
          "This venue cannot be deleted because it is linked to one or more events or matches. Remove or reassign those first.",
      });
    }

    await Venue.findByIdAndDelete(venue._id);
    return res.status(200).json({ message: "Venue deleted successfully", id: String(venue._id) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createVenue,
  getAllVenues,
  getVenueById,
  updateVenue,
  updateVenueAvailability,
  deleteVenue,
};