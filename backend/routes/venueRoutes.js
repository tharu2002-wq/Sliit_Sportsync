const express = require("express");
const router = express.Router();

const {
  createVenue,
  getAllVenues,
  getVenueById,
  updateVenue,
  updateVenueAvailability,
} = require("../controllers/venueController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/", protect, authorizeRoles("admin", "organizer"), createVenue);
router.get("/", protect, getAllVenues);
router.get("/:id", protect, getVenueById);
router.put("/:id", protect, authorizeRoles("admin", "organizer"), updateVenue);
router.patch(
  "/:id/availability",
  protect,
  authorizeRoles("admin", "organizer"),
  updateVenueAvailability
);

module.exports = router;