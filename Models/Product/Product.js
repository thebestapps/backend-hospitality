const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new mongoose.Schema(
  {
    //id: String,
    images: [{ type: String }],
    title: { type: String, default: null, required: true },
    dimensions: String,
    urlName: { type: String },
    artist: String,
    barcode: String,
    story: { type: String, default: null },
    usage: { type: String, default: null },
    ingredients: { type: String, default: null },
    sizes: [
      {
        size: { type: String, default: null },
        quantity: { type: Number, default: 0 },
        price: {
          amount: { type: Number, default: 0 },
          currency: {
            type: mongoose.Types.ObjectId,
            ref: "currencies",
            required: true,
          },
        },
      },
    ],
    shippingCost: { type: Number, default: 0 },
    supplier: {
      type: mongoose.Types.ObjectId,
      ref: "productSuppliers",
      required: true,
    },
    sale: {
      salePercent: { type: Number, default: 0 },
      onSale: { type: Boolean, default: false },
    },
    new: { type: Boolean, default: false },
    type: String,
    quantity: { type: Number, default: 0 },
    category: { type: mongoose.Types.ObjectId, ref: "productcategories" },
    enabled: { type: Boolean, default: true, required: true },
    deleted: { type: Boolean, default: false, required: true },
    popularityCounter: { type: Number, default: 0 },
    cancelationPolicy: { type: mongoose.Types.ObjectId, default: null },
    rules: { type: String, default: null },
  },
  { timestamps: true }
);

ProductSchema.methods.setProduct = function (product) {
  this.id = product.id;
  this.imageUrl = product.imageUrl;
  this.title = product.title;
  this.dimensions = product.dimensions;
  this.artist = product.artist;
  this.price = product.price;
  this.type = product.type;
  this.category = product.category;
  this.barcode = product.barcode;
  this.story = product.story;
  this.usage = product.usage;
  this.ingredients = product.ingredients;
  this.size = product.size;
  this.supplier = product.supplier;
  this.enabled = true;
};

const Product = mongoose.model("products", ProductSchema, "products");
module.exports = Product;
