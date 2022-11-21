const mongoose = require("mongoose");

const currecySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    symbol: { type: String, required: true },
    isWebSiteDefault: { type: Boolean, default: false },
    enabled: { type: Boolean, required: true, default: true },
    deleted: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: true,
  }
);

const Currency = mongoose.model("currencies", currecySchema, "currencies");
exports.Currency = Currency;
