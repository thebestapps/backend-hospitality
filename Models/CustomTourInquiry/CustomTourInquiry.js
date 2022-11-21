var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CustomTourInquirySchema = new mongoose.Schema({
  selectedCities: [String],
  email: String,
  fullName: String,
  phoneNumber : String,
  participantsType: String,
  setBudget: Boolean,
  budget: Number,
  adultsNumber: Number,
  infantsNumber: Number,
  description: String,
  beginDate: Date,
  endDate: Date,
  setAccomodation: Boolean,
  accomodationType: String,
  numberOfRooms:Number,
  accomodationDetails:String,
  setCarRental :Boolean,
  vehicle: String,
  withDriver: Boolean,
  carDetails:String,
  status:String,

}, { timestamps: true });

                
CustomTourInquirySchema.methods.setCustomTourInquiry = function (customTourInquiry) {

  this.selectedCities = customTourInquiry.selectedCities
  this.email = customTourInquiry.email
  this.fullName = customTourInquiry.fullName
  this.phoneNumber  = customTourInquiry.phoneNumber
  this.participantsType = customTourInquiry.participantsType
  this.setBudget = customTourInquiry.setBudget
  this.budget = customTourInquiry.budget
  this.adultsNumber = customTourInquiry.adultsNumber
  this.infantsNumber = customTourInquiry.infantsNumber
  this.description = customTourInquiry.description
  this.beginDate = customTourInquiry.beginDate
  this.endDate = customTourInquiry.endDate
  this.setAccomodation = customTourInquiry.setAccomodation
  this.accomodationType = customTourInquiry.accomodationType
  this.numberOfRooms = customTourInquiry.numberOfRooms
  this.accomodationDetails = customTourInquiry.accomodationDetails
  this.setCarRental  = customTourInquiry.setCarRental
  this.vehicle = customTourInquiry.vehicle
  this.withDriver = customTourInquiry.withDriver
  this.carDetails = customTourInquiry.carDetails
  this.status = customTourInquiry.status
};

var CustomTourInquiry = mongoose.model('customTourInquiries', CustomTourInquirySchema, 'customTourInquiries');
module.exports = CustomTourInquiry;

