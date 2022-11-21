const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    cart: { type: mongoose.Types.ObjectId, ref: "carts", required: true },
    product: { type: mongoose.Types.ObjectId, ref: "products" },
    size: { type: mongoose.Types.ObjectId },
    quantity: { type: Number, default: 0 },
    isPaid: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const CartItem = mongoose.model("cartItems", cartItemSchema, "cartItems");
module.exports = CartItem;
