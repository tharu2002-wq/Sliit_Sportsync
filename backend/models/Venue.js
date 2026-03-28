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
    availableDates: [
      {
        type: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Venue", venueSchema);