const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/profile", protect, (req, res) => {
  res.status(200).json({
    message: "Protected profile route accessed successfully",
    user: req.user,
  });
});

router.get("/admin", protect, authorizeRoles("admin"), (req, res) => {
  res.status(200).json({
    message: "Welcome Admin, this is a protected admin route",
  });
});

module.exports = router;