const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: "users" },
    regionAndRoad: { type: String, default: null, required: true },
    buildingAndFloor: { type: String, default: null, required: true },
    city: { type: mongoose.Types.ObjectId, ref: "cities", required: true },
    cityWritten: { type: String, derfault: null },
    country: {
      type: mongoose.Types.ObjectId,
      ref: "countries",
      required: true,
    },
    isDefault: { type: Boolean, default: false, required: true },
    phoneNumber: String,
    details: String,
    nickname: String,
    //street: { type: String, required: true, default: null },
    //building: { type: String, required: true, default: null },
    //floor: { type: String, required: true, default: null },
    //appartment: { type: String, required: true, default: null },
    interphone: String,
    contact: String,
    long: String,
    lat: String,
    adminDescription: String,
    deleted: { type: Boolean, default: false, required: true },
  },
  { timestamps: true }
);

AddressSchema.methods.setAddress = function (address) {
  this.phoneNumber = address.phoneNumber;
  this.country = address.country;
  this.city = address.city;
  this.details = address.details;
  this.nickname = address.nickname;
  this.street = address.street;
  this.building = address.building;
  this.floor = address.floor;
  this.appartment = address.appartment;
  this.interphone = address.interphone;
  this.contact = address.contact;
  this.lat = address.lat;
  this.long = address.long;
  this.adminDescription = address.adminDescription;
  this.deleted = address.deleted;
};

const Address = mongoose.model("addresses", AddressSchema, "addresses");
module.exports = Address;
