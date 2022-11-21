const mongoose = require("mongoose");

const highlightSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String, default: null },
    description: { type: String, default: null },
    enabled: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Highlight = mongoose.model("highlights", highlightSchema, "highlights");
exports.Highlight = Highlight;
