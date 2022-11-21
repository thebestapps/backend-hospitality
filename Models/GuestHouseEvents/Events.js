const mongoose = require("mongoose");

const eventsSchema = new mongoose.Schema(
  {
    name: { type: String, requierd: true },
    image: { type: String, default: null, requierd: true },
    enabled: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Events = mongoose.model("events", eventsSchema, "events");
exports.Events = Events;
