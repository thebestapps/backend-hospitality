const mongoose = require("mongoose");

const cancelSchema = new mongoose.Schema(
  {
    name: { type: String },
    description: [{ type: String }],
    numberOfDays: { type: Number },
    refundAmount: { type: Number },
  },
  {
    timestamps: true,
  }
);

const CancellationPolicy = mongoose.model(
  "cancellationPolicy",
  cancelSchema,
  "cancellationPolicy"
);

const policis = [
  {
    _id: mongoose.Types.ObjectId("61d47125cfb4c82474123833"),
    name: "Flexible",
    description: [
      "Full refund 2 days prior to arrival",
      "Less than 2-days full charge",
    ],
    numberOfDays: 2,
    refundAmountPercent: 1,
  },
  {
    _id: mongoose.Types.ObjectId("61d4713498ab5d21f86ab540"),
    name: "Moderate",
    description: [
      "Full refund 5 days prior to arrival",
      "Less than 5-days full charge",
    ],
    numberOfDays: 5,
    refundAmountPercent: 1,
  },
  {
    _id: mongoose.Types.ObjectId("61d4713d5d7845472cc0555b"),
    name: "Firm",
    description: [
      "50% refund up to 7 days before check-in",
      "Less than 7-days full charge",
    ],
    numberOfDays: 7,
    refundAmountPercent: 0.5,
  },
  {
    _id: mongoose.Types.ObjectId("61d47147dc3aeb1f2cfc89cf"),
    name: "Strict",
    description: [
      "50% refund up to 14 days before check-in",
      "Less than 14-days full charge",
    ],
    numberOfDays: 14,
    refundAmountPercent: 0.5,
  },
  {
    _id: mongoose.Types.ObjectId("61d4715f248d461f98323e44"),
    name: "Non-Refundable",
    description: ["Full charge any time of cancellation"],
    numberOfDays: 0,
    refundAmountPercent: 0,
  },
];

module.exports = { CancellationPolicy, policis };
