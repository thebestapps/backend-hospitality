const mongoose = require("mongoose");

const versionSchema = new mongoose.Schema(
  {
    id: { type: String },
    version: { type: String, required: true },
    urgent: { type: Boolean, default: false },
    platform: { type: String, enum: ["ios", "android"] },
    downloadLink: { type: String },
  },
  { timestamps: true }
);

const Version = mongoose.model("version", versionSchema, "version");
module.exports = Version;
