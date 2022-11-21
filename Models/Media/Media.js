const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    name: { type: String },
    image: { type: String },
    profileLink: { type: String },
    enabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Media = mongoose.model("media", mediaSchema, "media");
module.exports = Media;
