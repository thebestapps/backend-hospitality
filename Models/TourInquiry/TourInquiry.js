const mongoose = require("mongoose");

const TourInquirySchema = new mongoose.Schema(
  {
    tour: { type: mongoose.Types.ObjectId, ref: "tours" },
    type: { type: Number, enum: [0, 1, 2] }, //0 family 1 friends 2 couples
    fullName: { first: { type: String }, last: { type: String } },
    email: { type: String },
    phoneNumber: { type: String },
    destinations: [{ type: mongoose.Types.ObjectId, ref: "cities" }],
    startDate: { type: Date },
    endDate: { type: Date },
    budget: {
      isSpecific: { type: Boolean, default: false },
      minimum: { type: Number, default: 0 },
      maximum: { type: Number, default: 0 },
    },
    numberOfGuests: {
      adults: { type: Number, default: 0 },
      childrens: { type: Number, default: 0 },
      infants: { type: Number, default: 0 },
    },
    accomodation: { type: Boolean, default: false },
    accomodationType: { type: String, enum: ["standard", "comfort", "luxury"] },
    numberOfBedrooms: { type: Number },
    description: { type: String },
    isCustomized: { type: Boolean },
    vehicle: {
      type: String,
      enum: [
        "4 seatr",
        "7 seatr",
        "mini bus 11 seatr",
        "mini bus 13 seatr",
        "bus 24 seatr",
      ],
    },
    driver: { type: Boolean },
    status: String,
    breakfast: Boolean,
  },
  { timestamps: true }
);

TourInquirySchema.methods.setTourInquiry = function (tourInquiry) {
  this.tour = tourInquiry.tour;
  (this.fullName = tourInquiry.fullName),
    (this.email = tourInquiry.email),
    (this.phoneNumber = tourInquiry.phoneNumber),
    (this.date = tourInquiry.date);
  this.isCustomized = tourInquiry.isCustomized;
  this.vehicle = tourInquiry.vehicle;
  this.breakfast = tourInquiry.breakfast;
  this.numberOfGuests = tourInquiry.numberOfGuests;
  this.status = tourInquiry.status;
};

const TourInquiry = mongoose.model(
  "tourInquiries",
  TourInquirySchema,
  "tourInquiries"
);
module.exports = TourInquiry;
