const express = require("express");
const router = express.Router();

const {
  createPlayer,
  getAllPlayers,
  getPlayersForCurrentUser,
  getPlayerById,
  updatePlayer,
  deletePlayer,
} = require("../controllers/playerController");
const { getPlayerAiSummary } = require("../controllers/aiController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Create player
router.post("/", protect, authorizeRoles("admin", "organizer"), createPlayer);

// Get all players
router.get("/", protect, getAllPlayers);

// Linked player(s) for logged-in user (must be registered before /:id)
router.get("/me", protect, getPlayersForCurrentUser);

// AI summary (must be before /:id so "ai-summary" is not captured as id)
router.get("/:id/ai-summary", protect, getPlayerAiSummary);

// Get single player
router.get("/:id", protect, getPlayerById);

// Update player
router.put("/:id", protect, authorizeRoles("admin", "organizer"), updatePlayer);

// Delete player
router.delete("/:id", protect, authorizeRoles("admin", "organizer"), deletePlayer);

module.exports = router;