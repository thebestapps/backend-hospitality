const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: "user", required: true },
    order: { type: mongoose.Types.ObjectId, ref: "orders", required: true },
    product: { type: mongoose.Types.ObjectId, ref: "products", required: true },
    size: { type: mongoose.Types.ObjectId },
    quantity: { type: Number },
    total: { type: Number, required: true },
    currency: { type: mongoose.Types.ObjectId, ref: "currencies" },
    isDelivered: { type: Boolean },
  },
  { timestamps: true }
);

const OrderItems = mongoose.model("orderItems", orderItemSchema, "orderItems");
module.exports = OrderItems;
