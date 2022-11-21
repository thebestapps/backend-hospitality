const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = new mongoose.Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "users" },
    address: { type: Schema.Types.ObjectId, ref: "addresses" },
    cart: { type: mongoose.Types.ObjectId, ref: "carts", default: null }, //Null for buy now orders
    paymentMethod: { type: mongoose.Types.ObjectId, ref: "paymentMethods" },
    //products: [{ type: Schema.Types.ObjectId, ref: "products" }],
    totalPrice: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    currency: { type: mongoose.Types.ObjectId, ref: "currencies" },
    isCancelled: { type: Boolean, default: false, required: true },
    orderStatus: { type: Number, enum: [0, 1], default: 0 }, // 0 is ongoing 1 is delivered
    isBuyNow: { type: Boolean, default: false },
    isConfirmed: { type: Boolean, default: false, required: true },
    isDelivery: { type: Boolean, default: false },
    confirmationCode: { type: String, default: null },
    // hasPromoCode:
  },
  { timestamps: true }
);

OrderSchema.methods.setOrder = function (order) {
  this.user = order.user;
  this.address = order.address;
  this.paymentMethod = order.paymentMethod;
  this.products = order.products;
  this.totalPrice = order.totalPrice;
  this.currency = order.currency;
  this.isCancelled = order.isCancelled;
  // hasPromoCode=
};

const Order = mongoose.model("orders", OrderSchema, "orders");
module.exports = Order;
