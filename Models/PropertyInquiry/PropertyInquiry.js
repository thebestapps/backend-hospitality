const mongoose = require("mongoose");

const PropertyInquirySchema = new mongoose.Schema(
  {
    fullName: {
      first: { type: String },
      last: { type: String },
    },
    email: { type: String },
    phoneNumber: { type: String },
    description: { type: String },
    amenities: [{ type: mongoose.Types.ObjectId, ref: "amenities" }],
    location: {
      country: {
        type: mongoose.Types.ObjectId,
        ref: "countries",
        required: true,
      },
      city: { type: String },
      state: { type: String },
      street: { type: String },
      building: { type: String },
    },
    sleepingArrangements: {
      numberOfBedrooms: { type: Number },
      commonSpaces: {
        sofa: { type: Number },
        couch: { type: Number },
      },
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "propertycategories",
      required: true,
    },
    numberOfGuests: {
      adults: { type: Number, default: 0 },
      childrens: { type: Number, default: 0 },
      infants: { type: Number, default: 0 },
    },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const PropertyInquiry = mongoose.model(
  "propertyInquiries",
  PropertyInquirySchema,
  "propertyInquiries"
);
module.exports = PropertyInquiry;

//var express = require('express');
//var router = express.Router();
//var bodyParser = require('body-parser');
//var mongoose = require('mongoose');
//var Schema = mongoose.Schema;
//
//var PropertyInquirySchema = new mongoose.Schema({
//    stay: { type: Schema.Types.ObjectId, ref: "properties" },
//    fullName: String,
//    phoneNumber: String,
//    email:String,
//    checkInDate: Date,
//    checkOutDate: Date,
//    numberOfGuests: String,
//    housekeepingService: Boolean,
//    breakfast: Boolean,
//    airportPickup: Boolean,
//    airportDropoff: Boolean,
//    packedFridge: Boolean,
//    extraPillows: Boolean,
//    spotifyNetflix: Boolean,
//    status: String
//    //promoCode
//}, { timestamps: true });
//
//
//PropertyInquirySchema.methods.setPropertyInquiry = function (propertyInquiry) {
//    this.stay = propertyInquiry.stay;
//    this.fullName  = propertyInquiry.fullName;
//    this.phoneNumber = propertyInquiry.phoneNumber;
//    this.email = propertyInquiry.email;
//    this.checkInDate = propertyInquiry.checkInDate;
//    this.checkOutDate = propertyInquiry.checkOutDate;
//    this.numberOfGuests = propertyInquiry.numberOfGuests;
//    this.housekeepingService = propertyInquiry.housekeepingService;
//    this.breakfast = propertyInquiry.breakfast;
//    this.airportPickup = propertyInquiry.airportPickup;
//    this.airportDropoff = propertyInquiry.airportDropoff;
//    this.packedFridge = propertyInquiry.packedFridge;
//    this.extraPillows = propertyInquiry.extraPillows;
//    this.spotifyNetflix = propertyInquiry.spotifyNetflix;
//    this.status = propertyInquiry.status;
//}
