const mongoose = require("mongoose");

const playerRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    /** Snapshot from the user profile at request time */
    studentId: { type: String, required: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    faculty: { type: String, trim: true },
    academicYear: { type: String, trim: true },
    /** Snapshot of profile age at request time (optional). */
    age: { type: Number, min: 17, max: 120 },
    /** Sports / skills from student profile at request time (maps to player sportTypes). */
    skills: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedAt: { type: Date },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdPlayer: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
    rejectReason: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

playerRequestSchema.index({ user: 1, status: 1 });
playerRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model("PlayerRequest", playerRequestSchema);
