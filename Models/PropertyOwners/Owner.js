const mongoose = require("mongoose");

const ownerSchema = new mongoose.Schema(
  {
    fullName: {
      first: { type: String },
      last: { type: String },
    },
    email: { type: String },
    phoneNumber: { type: String },
  },
  { timestamps: true }
);

const Owner = mongoose.model("owners", ownerSchema, "owners");
module.exports = Owner;
