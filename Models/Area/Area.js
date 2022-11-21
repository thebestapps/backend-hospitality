const mongoose = require("mongoose");

const areaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    city: { type: mongoose.Types.ObjectId, ref: "cities", required: true },
    description: { type: String },
    enabled: { type: Boolean, required: true, default: true },
    deleted: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

const Area = mongoose.model("areas", areaSchema, "areas");
exports.Area = Area;
