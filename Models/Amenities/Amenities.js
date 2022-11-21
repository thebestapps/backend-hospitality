const mongoose = require("mongoose");

const amenitiesSchema = new mongoose.Schema(
  {
    name: { type: String, requierd: true },
    isFeatured: { type: Boolean, default: false },
    image: { type: String, default: null, requierd: true },
    enabled: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Amenities = mongoose.model("amenities", amenitiesSchema, "amenities");
exports.Amenities = Amenities;
