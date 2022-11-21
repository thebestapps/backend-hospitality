const mongoose = require("mongoose");

const VisionSchema = new mongoose.Schema(
  {
    vision: { type: String, required: true },
    vision_id: { type: String, required: true },
    image: { type: String, required: true },
  },
  { timestamps: true }
);

const Vision = mongoose.model("vision", VisionSchema, "vision");
module.exports = Vision;
