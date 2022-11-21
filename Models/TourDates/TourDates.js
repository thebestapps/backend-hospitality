const mongoose = require("mongoose");

const TourDatesSchema = new mongoose.Schema(
  {
    tour: { type: mongoose.Types.ObjectId, ref: "tours", required: true },
    day: { type: Date, default: null },
    departureTime: { type: String, default: null },
    returnTime: { type: String, default: null },
    numberOfGuests: {
      adults: { type: Number, default: 0 },
      childrens: { type: Number, default: 0 },
      infants: { type: Number, default: 0 },
    },
    price: {
      amount: {
        adults: { type: Number, default: 0 },
        childrens: { type: Number, default: 0 },
        infants: { type: Number, default: 0 },
      },
      currency: {
        type: mongoose.Types.ObjectId,
        ref: "currencies",
        required: true,
      },
    },
    soldOut: { type: Boolean, default: false, required: true },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const TourDates = mongoose.model("tourDates", TourDatesSchema, "tourDates");
module.exports = TourDates;
