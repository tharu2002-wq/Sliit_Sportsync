const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  createPlayerRequest,
  getMyPlayerRequest,
  listPlayerRequests,
  acceptPlayerRequest,
  rejectPlayerRequest,
} = require("../controllers/playerRequestController");

router.get("/me", protect, authorizeRoles("student"), getMyPlayerRequest);
router.post("/", protect, authorizeRoles("student"), createPlayerRequest);

router.get("/", protect, authorizeRoles("admin"), listPlayerRequests);
router.patch("/:id/accept", protect, authorizeRoles("admin"), acceptPlayerRequest);
router.patch("/:id/reject", protect, authorizeRoles("admin"), rejectPlayerRequest);

module.exports = router;
