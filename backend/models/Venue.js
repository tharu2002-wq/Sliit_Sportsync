const mongoose = require("mongoose");

const venueSchema = new mongoose.Schema(
  {
    venueName: {
      type: String,
      required: [true, "Venue name is required"],
      trim: true,
      unique: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
      min: 1,
    },
    status: {
      type: String,
      enum: ["available", "unavailable"],
      default: "available",
    },
    /** Calendar days the venue cannot be used (all other days are treated as available). */
    unavailableDates: [
      {
        type: Date,
      },
    ],
    /** At least one sport is required when creating or updating via the API. */
    sports: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Venue", venueSchema);