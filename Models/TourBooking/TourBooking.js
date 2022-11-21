const mongoose = require("mongoose");

const TourBookingSchema = new mongoose.Schema(
  {
    tour: { type: mongoose.Types.ObjectId, ref: "tours" },
    tourDateId: { type: mongoose.Types.ObjectId, ref: "tourDates" },
    user: { type: mongoose.Types.ObjectId, ref: "users" },
    bookingDuration: String,
    pricePerOneAdult: { type: Number, required: true },
    pricePerOneChilde: { type: Number, required: true },
    pricePerOneInfant: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    sale: {
      salePercent: { type: Number, default: 0 },
      onSale: { type: Boolean, default: false },
    },
    paidAmount: { type: Number, default: 0, required: true },
    isCustomized: { type: Boolean, default: false, required: true },
    currency: { type: mongoose.Types.ObjectId, ref: "currencies" },
    vehicle: String,
    numberOfGuests: {
      adults: { type: Number, default: 0 },
      childrens: { type: Number, default: 0 },
      infants: { type: Number, default: 0 },
    },
    paymentMethod: String,
    //paymentType: {
    //  type: String,
    //  enum: ["online", "paylater"],
    //  default: "paylater",
    //},
    referenceNumber: String,
    //holdBookingStartDate: { type: Date, default: null },
    isConfirmed: { type: Boolean, default: false, required: true },
    isCancelled: { type: Boolean, default: false, required: true },
    confirmationCode: { type: String, default: null },
    cancelledDate: { type: Date, default: null },
    refundAmount: { type: Number, default: 0 },

    //promoCode
  },
  { timestamps: true }
);

TourBookingSchema.methods.setTourBooking = function (tourBooking) {
  this.tour = tourBooking.tour;
  this.user = tourBooking.userId;
  this.bookingDuration = tourBooking.bookingDuration;
  this.totalPrice = tourBooking.totalPrice;
  this.isCustomized = tourBooking.isCustomized;
  this.vehicle = tour.vehicle;
  this.numberOfGuests = tourBooking.numberOfGuests;
  this.paymentMethod = tourBooking.paymentMethod;
  this.isCancelled = tourBooking.isCancelled;
  this.referenceNumber = tourBooking.referenceNumber;
};

const TourBooking = mongoose.model(
  "tourBookings",
  TourBookingSchema,
  "tourBookings"
);
module.exports = TourBooking;
