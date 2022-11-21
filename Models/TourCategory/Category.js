const mongoose = require("mongoose");

const toursCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    enabled: { type: Boolean, required: true, default: true },
    deleted: { type: Boolean, default: false },
    image: { type: String, default: null },
  },
  { timestamps: true }
);

const Category = mongoose.model(
  "tourcategories",
  toursCategorySchema,
  "tourcategories"
);
exports.Category = Category;
