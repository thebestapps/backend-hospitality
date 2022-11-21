const mongoose = require("mongoose");

const bedSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Beds = mongoose.model("beds", bedSchema, "beds");
exports.Beds = Beds;
