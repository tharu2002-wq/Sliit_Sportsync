const express = require("express");
const router = express.Router();

const {
  createResult,
  getAllResults,
  getResultById,
  updateResult,
  getResultByMatchId,
  getLeaderboard,
  getPerformanceReport,
  deleteResult,
} = require("../controllers/resultController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/", protect, authorizeRoles("admin", "organizer"), createResult);
router.get("/", protect, getAllResults);
router.get("/leaderboard/table", protect, getLeaderboard);
router.get("/performance/report", protect, getPerformanceReport);
router.get("/match/:matchId", protect, getResultByMatchId);
router.get("/:id", protect, getResultById);
router.put("/:id", protect, authorizeRoles("admin", "organizer"), updateResult);
router.delete("/:id", protect, authorizeRoles("admin"), deleteResult);

module.exports = router;