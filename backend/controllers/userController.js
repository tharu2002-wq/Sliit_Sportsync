const User = require("../models/User");

const MAX_SKILLS = 30;
const MAX_SKILL_LEN = 60;

function normalizeSkillsInput(raw) {
  if (raw === undefined) return undefined;
  if (Array.isArray(raw)) {
    return raw
      .map((s) => String(s).trim())
      .filter(Boolean)
      .map((s) => s.slice(0, MAX_SKILL_LEN))
      .slice(0, MAX_SKILLS);
  }
  if (typeof raw === "string") {
    return raw
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => s.slice(0, MAX_SKILL_LEN))
      .slice(0, MAX_SKILLS);
  }
  return [];
}

/**
 * @desc    Current user (no password)
 * @route   GET /api/users/profile
 * @access  Private
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({
      message: "Profile loaded",
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update current user profile (optional campus / display fields)
 * @route   PATCH /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const { name, academicYear, faculty, studentId, skills, age } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name !== undefined) {
      const next = String(name).trim();
      if (!next) {
        return res.status(400).json({ message: "Name cannot be empty" });
      }
      if (next.length > 120) {
        return res.status(400).json({ message: "Name is too long" });
      }
      user.name = next;
    }

    if (academicYear !== undefined) {
      const t = academicYear === null || academicYear === "" ? "" : String(academicYear).trim();
      if (t.length > 50) {
        return res.status(400).json({ message: "Academic year is too long" });
      }
      user.academicYear = t || undefined;
    }

    if (faculty !== undefined) {
      const t = faculty === null || faculty === "" ? "" : String(faculty).trim();
      if (t.length > 120) {
        return res.status(400).json({ message: "Faculty is too long" });
      }
      user.faculty = t || undefined;
    }

    if (studentId !== undefined) {
      const t = studentId === null || studentId === "" ? "" : String(studentId).trim();
      if (t.length > 40) {
        return res.status(400).json({ message: "Student ID is too long" });
      }
      user.studentId = t || undefined;
    }

    if (age !== undefined) {
      if (age === null || age === "") {
        user.age = undefined;
      } else {
        const n = Number(age);
        if (!Number.isInteger(n) || n < 17 || n > 120) {
          return res.status(400).json({ message: "Age must be a whole number between 17 and 120" });
        }
        user.age = n;
      }
    }

    if (skills !== undefined) {
      const list = normalizeSkillsInput(skills);
      user.skills = list;
    }

    await user.save();

    const fresh = await User.findById(user._id).select("-password");
    return res.status(200).json({
      message: "Profile updated",
      user: fresh,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Permanently delete the authenticated student account
 * @route   DELETE /api/users/account
 * @access  Private (student only)
 */
const deleteAccount = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only student accounts can be deleted with this action." });
    }

    const deleted = await User.findByIdAndDelete(req.user._id);
    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Account deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deleteAccount,
};
