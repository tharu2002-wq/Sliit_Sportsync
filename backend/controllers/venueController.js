const Venue = require("../models/Venue");

// @desc    Create venue
// @route   POST /api/venues
// @access  Private (Admin, Organizer)
const createVenue = async (req, res) => {
  try {
    const { venueName, location, capacity, status, availableDates } = req.body;

    if (!venueName || !location || !capacity) {
      return res.status(400).json({
        message: "Venue name, location, and capacity are required",
      });
    }

    const existingVenue = await Venue.findOne({ venueName });
    if (existingVenue) {
      return res.status(400).json({ message: "Venue name already exists" });
    }

    const venue = await Venue.create({
      venueName,
      location,
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

    if (venueName && venueName !== venue.venueName) {
      const existingVenue = await Venue.findOne({ venueName });
      if (existingVenue) {
        return res.status(400).json({ message: "Venue name already exists" });
      }
    }

    if (venueName !== undefined) venue.venueName = venueName;
if (location !== undefined) venue.location = location;
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

module.exports = {
  createVenue,
  getAllVenues,
  getVenueById,
  updateVenue,
  updateVenueAvailability,
};