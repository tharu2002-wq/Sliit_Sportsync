const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: [true, "Match is required"],
      unique: true,
    },
    scoreA: {
      type: Number,
      required: [true, "Score A is required"],
      min: 0,
    },
    scoreB: {
      type: Number,
      required: [true, "Score B is required"],
      min: 0,
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Updated by user is required"],
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    playerNotes: {
      type: [
        {
          player: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Player",
            required: true,
          },
          note: {
            type: String,
            default: "",
            trim: true,
            maxlength: 500,
          },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Result", resultSchema);