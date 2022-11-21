const mongoose = require("mongoose");

const propertiesCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    enabled: { type: Boolean, required: true, default: true },
    deleted: { type: Boolean, default: false },
    isHotelOrGuestHouse: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

const Category = mongoose.model(
  "propertycategories",
  propertiesCategorySchema,
  "propertycategories"
);
exports.Category = Category;
