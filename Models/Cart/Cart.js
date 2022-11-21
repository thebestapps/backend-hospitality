const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: "users", required: true },
    //address: { type: mongoose.Types.ObjectId, ref: "addresses", default: null },
    cartStatus: { type: String, enum: ["open", "closed"] },
    closeDate: { type: Date, default: null },
  },
  { timestamps: true }
);

const Cart = mongoose.model("carts", cartSchema, "carts");
module.exports = Cart;
