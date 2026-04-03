const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["admin", "organizer", "student"],
      default: "student",
    },
    /** Optional student profile fields (editable via PATCH /api/users/profile). */
    academicYear: {
      type: String,
      trim: true,
    },
    faculty: {
      type: String,
      trim: true,
    },
    studentId: {
      type: String,
      trim: true,
    },
    /** Optional; aligned with player age rules (17–120). */
    age: {
      type: Number,
      min: 17,
      max: 120,
    },
    skills: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);