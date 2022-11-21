const mongoose = require("mongoose");

const citySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    country: {
      type: mongoose.Types.ObjectId,
      ref: "countries",
      required: true,
    },
    id: { type: String }, //refrence to the list of all cities items id
    image: { type: String, required: true },
    enabled: { type: Boolean, required: true, default: true },
    deleted: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

const City = mongoose.model("cities", citySchema, "cities");
exports.City = City;
