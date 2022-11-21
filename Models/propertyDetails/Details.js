const mongoose = require("mongoose");

const detailsSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Types.ObjectId, ref: "properties" },
    location: {
      textDetails: { type: String, defult: "" },
      locationUrl: { type: String, defult: "" },
      buildingPhoto: { type: String, defult: "" },
    },

    keys: {
      instruction: { type: String, defult: "" },
      videoUrl: { type: String, defult: "" },
      photoUrl: { type: String, defult: "" },
    },
    wifi: {
      name: { type: String, defult: "" },
      password: { type: String, defult: "" },
    },
    parking: {
      details: { type: String, defult: "" },
      parkingPhoto: { type: String, defult: "" },
    },
    electricity: {
      details: { type: String, defult: "" },
      elecPhoto: { type: String, defult: "" },
    },
    garbage: { type: String, defult: "" },
    emergencyInfo: { type: String, defult: "" },
    houseRules: { type: String, defult: "" },
    generalInformation: { type: String, defult: "" },
    grocertStores: [{ groceryDetails: String, link: String, phone: String }],
    resturants: [{ resturantDetails: String, link: String, phone: String }],
    nightSpots: [{ nightSpotDetails: String, link: String, phone: String }],
    entertainment: [
      { entertainmentDetails: String, link: String, phone: String },
    ],
    transportation: [
      { transportationDetails: String, link: String, phone: String },
    ],
    checkOutInstructions: { type: String, defult: "" },
  },
  { timestamps: true }
);

const PropertyDetails = mongoose.model(
  "propertyDetails",
  detailsSchema,
  "propertyDetails"
);

module.exports = PropertyDetails;
