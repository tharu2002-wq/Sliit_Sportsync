const express = require("express");
const router = express.Router();

const {
  createPlayer,
  getAllPlayers,
  getPlayerById,
  updatePlayer,
} = require("../controllers/playerController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Create player
router.post("/", protect, authorizeRoles("admin", "organizer"), createPlayer);

// Get all players
router.get("/", protect, getAllPlayers);

// Get single player
router.get("/:id", protect, getPlayerById);

// Update player
router.put("/:id", protect, authorizeRoles("admin", "organizer"), updatePlayer);

module.exports = router;