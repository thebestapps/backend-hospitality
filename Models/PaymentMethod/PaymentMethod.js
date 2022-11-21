const mongoose = require("mongoose");

const paymentMethodSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: "users" },
    stripeCustomerId: { type: String, default: null },
    propertyBooking: {
      type: mongoose.Types.ObjectId,
      ref: "propertyBookings",
      default: null,
    },
    tourBooking: {
      type: mongoose.Types.ObjectId,
      ref: "tourBookings",
      default: null,
    },
    stripePaymentIntent: { type: String, default: null },
    order: { type: mongoose.Types.ObjectId, ref: "orders", default: null },
    paymentGate: { type: Number, enum: [0, 1] }, //0 is stripe 1 is Areeba
    paidAmount: { type: Number },
  },
  { timestamps: true }
);

const PaymentMethod = mongoose.model(
  "paymentMethods",
  paymentMethodSchema,
  "paymentMethods"
);
module.exports = PaymentMethod;

//var express = require('express');
//var router = express.Router();
//var bodyParser = require('body-parser');
//var mongoose = require('mongoose');
//var Schema = mongoose.Schema;
//
//
//var PaymentMethodSchema = new mongoose.Schema({
//    nickname: String,
//    token: String,
//    last_four: String,
//    card_type: String,
//    bin_code: String,
//    expiry_date: String,
//    updatedAt: String,
//    createdAt: String,
//    deleted: Boolean
//}, { timestamps: true });
//
//PaymentMethodSchema.methods.setPaymentMethod = function (paymentMethod) {
//    this.nickname = paymentMethod.nickname;
//    this.token = paymentMethod.token;
//    this.last_four = paymentMethod.last_four;
//    this.card_type = paymentMethod.card_type;
//    this.bin_code = paymentMethod.bin_code;
//    this.expiry_date = paymentMethod.expiry_date;
//    this.updatedAt = paymentMethod.updatedAt;
//    this.createdAt = paymentMethod.createdAt;
//    this.deleted = paymentMethod.deleted;
//};
//
//var PaymentMethod = mongoose.model('paymentMethods', PaymentMethodSchema, 'paymentMethods');
//module.exports = PaymentMethod;
