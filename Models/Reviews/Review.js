const mongoose = require("mongoose");

const reviweSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: "users" },
    property: {
      type: mongoose.Types.ObjectId,
      ref: "properties",
      default: null,
    },
    tour: { type: mongoose.Types.ObjectId, ref: "tours", default: null },
    review: { type: String },
    rate: { type: Number },
    city: { type: mongoose.Types.ObjectId, ref: "cities", default: null },
  },
  { timestamps: true }
);

const Review = mongoose.model("reviews", reviweSchema, "reviews");
exports.Review = Review;
