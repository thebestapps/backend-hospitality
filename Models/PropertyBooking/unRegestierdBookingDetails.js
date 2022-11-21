const mongoose = require("mongoose");

const unRegestierdBookingDetailsModel = new mongoose.Schema(
  {
    user: mongoose.Types.ObjectId,
    bookingDetails: {
      dates: {
        checkInDate: Date,
        checkOutDate: Date,
      },
      numberOfGuests: {
        adults: Number,
        infants: Number,
        childrens: Number,
      },
      priceDetails: {
        pricePerNight: Number,
        numberOfNights: Number,
        priceForNumberOfNights: Number,
        cleanFeas: Number,
        discount: Number,
        totalPrice: Number,
        currency: {
          _id: mongoose.Types.ObjectId,
          symbol: String,
        },
      },
    },
  },
  { timestamps: true }
);

const UnRegestierdBookingDetails = mongoose.model(
  "unRegestierdBookingDetails",
  unRegestierdBookingDetailsModel,
  "unRegestierdBookingDetails"
);

module.exports = UnRegestierdBookingDetails;
