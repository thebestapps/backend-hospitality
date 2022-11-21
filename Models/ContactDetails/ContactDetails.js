const mongoose = require("mongoose");

const detailsSchema = new mongoose.Schema(
  {
    id: { type: String },
    email: { type: String },
    phoneNumber: { type: String },
    whatsapp: { type: String },
    location: { long: { type: Number }, lat: { type: Number }, label: String },
  },
  { timestamps: true }
);

const ContactDetails = mongoose.model(
  "contactDetails",
  detailsSchema,
  "contactDetails"
);

module.exports = ContactDetails;
