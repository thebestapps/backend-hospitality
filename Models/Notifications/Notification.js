const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: [{ type: mongoose.Types.ObjectId, ref: "users", required: true }],
    title: { type: String },
    body: { type: String, required: true },
    listingKey: {
      key: { type: String },
      id: { type: mongoose.Types.ObjectId },
    },
    tour: { type: mongoose.Types.ObjectId, ref: "tours" },
    property: { type: mongoose.Types.ObjectId, ref: "properties" },
    product: { type: mongoose.Types.ObjectId, ref: "products" },
    sender: { type: mongoose.Types.ObjectId, ref: "admins", default: null },
    deleted: { type: Boolean, default: false },
    type: { type: Number, enum: [0, 1], default: 1 }, //0 is promotions 1 is automated about bookings
  },
  { timestamps: true }
);

const Notification = mongoose.model(
  "notifications",
  notificationSchema,
  "notifications"
);

module.exports = Notification;
