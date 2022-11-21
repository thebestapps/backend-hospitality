const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RateSchema = new mongoose.Schema(
  {
    rate: { type: Number, default: 1, required: true },
    from: {
      type: mongoose.Types.ObjectId,
      ref: "currencies",
      default: null,
    },
    to: {
      type: mongoose.Types.ObjectId,
      ref: "currencies",
      default: null,
    },
  },
  { timestamps: true }
);

const Rate = mongoose.model("rate", RateSchema, "rate");
module.exports = Rate;
