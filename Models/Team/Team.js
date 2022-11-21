const mongoose = require("mongoose");

const TeamSchema = new mongoose.Schema(
  {
    name: { type: String },
    role: { type: String },
    image: { type: String },
    imageSize: { type: String },
    imagePosition: { type: String },
    order: { type: Number, default: 1 },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Team = mongoose.model("team", TeamSchema, "team");
module.exports = Team;
