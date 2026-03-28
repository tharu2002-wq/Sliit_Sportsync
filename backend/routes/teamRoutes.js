const express = require("express");
const router = express.Router();

const {
  createTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
  addMembersToTeam,
  removeMemberFromTeam,
  assignCaptain,
  deactivateTeam,
} = require("../controllers/teamController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/", protect, authorizeRoles("admin", "organizer"), createTeam);
router.get("/", protect, getAllTeams);
router.get("/:id", protect, getTeamById);
router.put("/:id", protect, authorizeRoles("admin", "organizer"), updateTeam);

router.patch(
  "/:id/members/add",
  protect,
  authorizeRoles("admin", "organizer"),
  addMembersToTeam
);

router.patch(
  "/:id/members/remove",
  protect,
  authorizeRoles("admin", "organizer"),
  removeMemberFromTeam
);

router.patch(
  "/:id/captain",
  protect,
  authorizeRoles("admin", "organizer"),
  assignCaptain
);

router.patch(
  "/:id/deactivate",
  protect,
  authorizeRoles("admin", "organizer"),
  deactivateTeam
);

module.exports = router;