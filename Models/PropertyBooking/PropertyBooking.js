const mongoose = require("mongoose");

const PropertyBookingSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Types.ObjectId, ref: "properties" },
    user: { type: mongoose.Types.ObjectId, ref: "users" },
    checkInDate: { type: Date, default: null, required: true },
    checkOutDate: { type: Date, default: null, required: true },
    numberOfGuests: {
      adults: { type: Number, default: 0 },
      childrens: { type: Number, default: 0 },
      infants: { type: Number, default: 0 },
    },
    nights: { type: Number, required: true },
    discount: { type: Number, required: true },
    cleanFeas: { type: Number, required: true },
    pricePerNight: { type: Number, required: true },
    priceForNumberOfNights: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    paidAmount: { type: Number, default: 0, required: true }, //Used to detarimine the profite after a booking is Cancelled
    currency: { type: mongoose.Types.ObjectId, ref: "currencies" },
    paymentMethod: String,
    //paymentType: {
    //  type: String,
    //  enum: ["online", "paylater"],
    //  default: "paylater",
    //},
    //holdBookingStartDate: { type: Date, default: null },
    isConfirmed: { type: Boolean, default: false, required: true },
    isCancelled: { type: Boolean, default: false, required: true },
    isPaid: { type: Boolean, default: true },
    cancelledDate: { type: Date, default: null },
    confirmationCode: { type: String, default: null },
    extraCharge: { type: Number, default: 0 },
    refundAmount: { type: Number, default: 0 },
    //isDone: { type: Boolean, default: false },
    //promoCode
  },
  { timestamps: true }
);

PropertyBookingSchema.methods.setPropertyBooking = function (propertyBooking) {
  this.property = propertyBooking.property;
  this.user = propertyBooking.userId;
  this.checkInDate = propertyBooking.checkInDate;
  this.checkOutDate = propertyBooking.checkOutDate;
  this.numberOfGuests = propertyBooking.numberOfGuests;
  this.totalPrice = propertyBooking.totalPrice;
  this.paymentMethod = propertyBooking.paymentMethod;
  this.isCancelled = propertyBooking.isCancelled;
};

const PropertyBooking = mongoose.model(
  "propertyBookings",
  PropertyBookingSchema,
  "propertyBookings"
);
module.exports = PropertyBooking;
