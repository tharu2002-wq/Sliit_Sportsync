const express = require("express");
const router = express.Router();

const {
  createMatch,
  getAllMatches,
  getMatchById,
  getMatchesByEvent,
  updateMatch,
  cancelMatch,
  deleteCancelledMatch,
  updateMatchStatus,
} = require("../controllers/matchController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/", protect, authorizeRoles("admin", "organizer"), createMatch);
router.get("/", protect, getAllMatches);
router.get("/event/:eventId", protect, getMatchesByEvent);
router.get("/:id", protect, getMatchById);
router.put("/:id", protect, authorizeRoles("admin", "organizer"), updateMatch);
router.patch(
  "/:id/cancel",
  protect,
  authorizeRoles("admin", "organizer"),
  cancelMatch
);
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("admin", "organizer"),
  updateMatchStatus
);
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin", "organizer"),
  deleteCancelledMatch
);

module.exports = router;