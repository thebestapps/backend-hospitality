const mongoose = require("mongoose");

const bathSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Bath = mongoose.model("bathrooms", bathSchema, "bathrooms");
exports.Bath = Bath;
