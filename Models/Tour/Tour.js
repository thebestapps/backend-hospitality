const mongoose = require("mongoose");

const TourSchema = new mongoose.Schema(
  {
    internalName: { type: String, required: true, default: null },
    title: { type: String, required: true, default: null },
    subtitle: { type: String, required: true, default: null },
    briefDescription: { type: String, required: true, default: null },
    url: String,
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
    sale: {
      salePercent: { type: Number, default: 0 },
      onSale: { type: Boolean, default: false },
    },
    new: { type: Boolean, default: false },
    category: { type: mongoose.Types.ObjectId, ref: "tourcategories" },
    highlights: [{ type: mongoose.Types.ObjectId, ref: "highlights" }],
    included: [{ type: mongoose.Types.ObjectId, ref: "amenities" }],
    area: { type: mongoose.Types.ObjectId, ref: "areas", required: true },
    city: { type: mongoose.Types.ObjectId, ref: "cities", required: true },
    country: {
      type: mongoose.Types.ObjectId,
      ref: "countries",
      required: true,
    },
    numberOfGuests: {
      minimum: { type: Number, default: 0 },
      maximum: { type: Number, default: 0 },
      adults: { type: Number, default: 0 },
      childrens: { type: Number, default: 0 },
      infants: { type: Number, default: 0 },
    },
    //rateAccordingToWeekends: {
    //  rate: { type: Number, default: 1 },
    //  days: [String],
    //},
    //rateAccordingToWeekDays: {
    //  rate: { type: Number, default: 1 },
    //  days: [String],
    //},
    //rateAccordingToDate: [
    //  { rate: { type: Number, default: 1 }, dates: [{ type: Date }] },
    //],
    //rateToUse: { type: String, enum: ["days", "dates"], default: "dates" },
    time: { type: String, default: null },
    pickUp: {
      locationName: { type: String, default: null },
      lat: { type: String, default: "0.0" },
      long: { type: String, default: "0.0" },
    },
    dropOff: {
      locationName: { type: String, default: null },
      lat: { type: String, default: "0.0" },
      long: { type: String, default: "0.0" },
    },
    itinerary: [
      {
        description: { type: String, default: null },
        lat: { type: Number, default: 34 },
        long: { type: Number, default: 34 },
      },
    ],
    meals: { type: Number, default: 0 },
    images: [String],
    urlName: String,
    blockedDates: [Date],
    location: String,
    program: {
      event: {
        description: { type: String, default: null },
        details: [String],
      },
      whatToBring: [String],
    },
    cancelationPolicy: { type: mongoose.Types.ObjectId, default: null },
    enabled: { type: Boolean, required: true, default: true },
    deleted: { type: Boolean, required: true, default: false },
    popularityCounter: { type: Number, default: 0 },
    importantInfo: [{ type: String }],
    rules: { type: String, default: null },
    guestHouse: { type: mongoose.Types.ObjectId, ref: "guesthouses" },
  },
  { timestamps: true }
);

TourSchema.methods.setTour = function (tour) {
  this.internalName = tour.internalName;
  this.title = tour.title;
  this.subtitle = tour.subtitle;
  this.briefDescription = tour.briefDescription;
  this.url = tour.url;
  this.price = tour.price;
  this.date = tour.date;
  this.numberOfGuests = tour.numberOfGuests;
  this.time = tour.time;
  this.pickUp = tour.pickUp;
  this.departureTime = tour.departureTime;
  this.dropOff = tour.dropOff;
  this.returnTime = tour.returnTime;
  this.included = tour.included;
  this.itinerary = tour.itinerary;
  this.images = tour.images;
  this.category = tour.category;
  this.urlName = tour.title.replace(/\s+/g, "-");
  this.highlights = tour.highlights;
  this.blockedDates = tour.blockedDates;
  this.location = tour.location;
  this.weekendPrice = tour.weekendPrice;
};

const Tour = mongoose.model("tours", TourSchema, "tours");
module.exports = Tour;
