const express = require("express");
const router = express.Router();

const {
  createEvent,
  getAllEvents,
  getEventById,
  getUpcomingEvents,
  updateEvent,
  cancelEvent,
  deleteCancelledEvent,
} = require("../controllers/eventController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/", protect, authorizeRoles("admin", "organizer"), createEvent);
router.get("/", protect, getAllEvents);
router.get("/upcoming/list", protect, getUpcomingEvents);
router.get("/:id", protect, getEventById);
router.put("/:id", protect, authorizeRoles("admin", "organizer"), updateEvent);
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin", "organizer"),
  deleteCancelledEvent
);
router.patch(
  "/:id/cancel",
  protect,
  authorizeRoles("admin", "organizer"),
  cancelEvent
);

module.exports = router;