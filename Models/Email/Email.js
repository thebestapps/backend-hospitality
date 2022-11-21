const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema(
  {
    sender: { type: String, required: true },
    subject: { type: String },
    body: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Email = mongoose.model("emails", emailSchema, "email");

module.exports = Email;
