const mongoose = require("mongoose");

const costSchema = new mongoose.Schema(
  {
    id: String,
    cost: { type: Number, default: 0 },
    currency: { type: mongoose.Types.ObjectId, ref: "currencies" },
  },
  { timestamps: true }
);

const ShippingCost = mongoose.model("shippingCost", costSchema, "shippingCost");
module.exports = ShippingCost;
