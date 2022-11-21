const mongoose = require("mongoose");

const guestsSchema = new mongoose.Schema(
  {
    stayBooking: { type: mongoose.Types.ObjectId, ref: "propertyBookings" },
    fullName: {
      first: { type: String },
      last: { type: String },
    },
    gender: { type: String, enum: ["F", "M", "O"] },
    birthday: { type: Date },
    nationality: { type: String },
    address: { type: String },
    city: { type: String },
    country: { type: String },
    DocumentType: { type: Number, enum: [0, 1] }, //o ID 1 passport
    document: { type: String, required: true },
    isMainGuest: { type: Boolean },
  },
  {
    timestamps: true,
  }
);

const Guest = mongoose.model("guests", guestsSchema, "guests");
module.exports = Guest;
