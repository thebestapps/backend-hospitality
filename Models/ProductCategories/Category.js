const mongoose = require("mongoose");

const productCategorySchema = new mongoose.Schema({
  name: { type: String, default: null, required: true },
  enabled: { type: Boolean, default: true, required: true },
  deleted: { type: Boolean, default: false, required: true },
});

const Category = mongoose.model(
  "productcategories",
  productCategorySchema,
  "productcategories"
);

exports.Category = Category;
