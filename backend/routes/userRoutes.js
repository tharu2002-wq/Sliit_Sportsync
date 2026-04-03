const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { getProfile, updateProfile, deleteAccount } = require("../controllers/userController");

router.get("/profile", protect, getProfile);
router.patch("/profile", protect, updateProfile);
router.delete("/account", protect, deleteAccount);

router.get("/admin", protect, authorizeRoles("admin"), (req, res) => {
  res.status(200).json({
    message: "Welcome Admin, this is a protected admin route",
  });
});

module.exports = router;
