const mongoose = require("mongoose");

const countrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    id: { type: Number }, //refrence to the list of all countries items id
    enabled: { type: Boolean, required: true, default: true },
    deleted: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

const Country = mongoose.model("countries", countrySchema, "countries");
exports.Country = Country;
