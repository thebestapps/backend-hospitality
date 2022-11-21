const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const HoldEventSchema = new mongoose.Schema(
  {
    stay: { type: Schema.Types.ObjectId, ref: "properties" },
    tour: { type: Schema.Types.ObjectId, ref: "tours" },
    stayBooking: { type: mongoose.Types.ObjectId, ref: "propertyBookings" },
    tourBooking: { type: mongoose.Types.ObjectId, ref: "tourBookings" },
    holdDates: [{ type: Date }],
    blockedDates: [{ type: Date }],
    notes: { type: String, default: null },
  },
  { timestamps: true }
);

HoldEventSchema.methods.setHoldEvent = function (holdEvent) {
  this.stay = holdEvent.stay;
  this.tour = holdEvent.tour;
  this.holdDates = holdEvent.holdDates;
  this.notes = holdEvent.notes;
};

const HoldEvent = mongoose.model("holdEvents", HoldEventSchema, "holdEvents");
module.exports = HoldEvent;
