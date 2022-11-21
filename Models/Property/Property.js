const mongoose = require("mongoose");

const PropertySchema = new mongoose.Schema(
  {
    name: String,
    subtitle: String,
    internalName: String,
    briefDescription: { type: String, default: null },
    stayers: { type: String, default: null },
    location: {
      lat: { type: String, default: "0" },
      long: { type: String, default: "0" },
    },
    locationUrl: { type: String, default: null },
    numberOfGuests: {
      minimum: { type: Number, default: 0 },
      maximum: { type: Number, default: 0 },
    },
    sleepingArrangements: [String],
    sizeInM: String,
    airbnbUrl: String,
    enabled: { type: Boolean, default: true, required: true },
    apartmentHighlights: [String],
    locHighlights: String,
    amenities: [{ type: mongoose.Types.ObjectId, ref: "amenities" }],
    images: [String],
    image360Urls: { type: String, default: null },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "propertycategories",
      required: true,
    },
    numberOfBedrooms: { type: Number },
    bedrooms: [
      {
        name: { type: String },
        beds: [{ type: mongoose.Schema.Types.ObjectId, ref: "beds" }],
      },
    ],
    numberOfBathrooms: { type: Number },
    bathrooms: [
      {
        name: { type: String },
        bathType: { type: mongoose.Schema.Types.ObjectId, ref: "bathrooms" },
      },
    ],
    address: { floor: String, building: String, street: String },
    area: { type: mongoose.Types.ObjectId, ref: "areas" /*required: true*/ },
    city: { type: mongoose.Types.ObjectId, ref: "cities", required: true },
    country: {
      type: mongoose.Types.ObjectId,
      ref: "countries",
      required: true,
    },
    price: {
      //amount: { type: Number, default: 0 },
      cleanFeas: { type: Number, default: 0 },
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
    priceAccordingToDate: [
      { price: { type: Number, default: 1 }, dates: [{ type: Date }] },
    ],
    priceAccordingToWeekDays: {
      price: { type: Number, default: 1 },
    },
    priceAccordingToWeekends: {
      price: { type: Number, default: 1 },
    },
    // rateToUse: { type: String, enum: ["days", "dates"], default: "dates" },
    weeklyDiscount: { type: Number, default: 0 },
    monthlyDiscount: { type: Number, default: 0 },
    checkInTime: { type: String, default: "2:00 pm" },
    checkOutTime: { type: String, default: "12:00 pm" },
    urlName: String,
    rate: Number,
    deposit: Number,
    checkinImages: [String],
    checkinDescription: String,
    checkinVideoUrl: String,
    checkinLink: String,
    minNbOfNights: { type: Number },
    maxNbOfNights: { type: Number },
    alwaysAvailable: Boolean,
    expiresAt: String,
    rules: [{ type: mongoose.Types.ObjectId, ref: "rules" }],
    additionalRules: { type: String, default: null },
    cancelationPolicy: { type: mongoose.Types.ObjectId, default: null },
    transPortInfo: [{ type: String }],
    importantInfo: [{ type: String }],
    highlights: [{ type: mongoose.Types.ObjectId, ref: "highlights" }],
    deleted: { type: Boolean, default: false },
    distanceFromDowntown: { type: String },
    otherDistance: [{ type: String }],
    popularityCounter: { type: Number, default: 0 },
    owner: { type: mongoose.Types.ObjectId, ref: "owners", default: null },
    amenitiesHighlight: { type: String, default: null },
    guestHouse: { type: mongoose.Types.ObjectId, ref: "guesthouses" },
  },
  { timestamps: true }
);

PropertySchema.methods.setProperty = function (property) {
  this.name = property.name;
  this.subtitle = property.subtitle;
  this.internalName = property.internalName;
  this.briefDescription = property.briefDescription;
  this.stayers = property.stayers;
  this.location = property.location;
  this.locationUrl = property.locationUrl;
  this.numberOfGuests = property.numberOfGuests;
  this.sleepingArrangements = property.sleepingArrangements;
  this.sizeInM = property.sizeInM;
  this.airbnbUrl = property.airbnbUrl;
  this.enabled = property.enabled;
  this.apartmentHighlights = property.apartmentHighlights;
  this.locHighlights = property.locHighlights;
  this.amenities = property.amenities;
  this.images = property.images;
  this.image360Urls = property.image360Urls;
  this.category = property.category;
  this.videoUrl = property.videoUrl;
  this.checkInTime = property.checkInTime;
  this.checkOutTime = property.checkOutTime;
  this.price = property.price;
  this.rate = property.rate;
  this.deposit = property.deposit;
  this.monthlyPrice = property.monthlyPrice;
  this.weeklyPrice = property.weeklyPrice;
  this.weekendPrice = property.weekendPrice;
  this.urlName = property.name.replace(/\s+/g, "-");
  this.checkinVideoUrl = property.checkinVideoUrl;
  this.checkinLink = property.checkinLink;
  this.minNbOfNights = property.minNbOfNights;
  this.maxNbOfNights = property.maxNbOfNights;
  this.alwaysAvailable = property.alwaysAvailable;
  this.expiresAt = property.expiresAt;
  this.rules = property.rules;
  this.highlights = property.highlights;
  this.blockedDates = property.blockedDates;
};

var Property = mongoose.model("properties", PropertySchema, "properties");
module.exports = Property;
