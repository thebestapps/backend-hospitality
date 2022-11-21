const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSupplierSchema = new mongoose.Schema(
  {
    //id: String,
    name: { type: String, default: null, required: true },
    description: { type: String, default: null },
    location: { type: String, default: null },
    logo: { type: String, default: null },
    enabled: { type: Boolean, default: true, required: true },
  },
  { timestamps: true }
);

ProductSupplierSchema.methods.setProductSupplier = function (productSupplier) {
  this.id = productSupplier.id;
  this.name = productSupplier.name;
  this.description = productSupplier.description;
  this.location = productSupplier.location;
  this.logo = productSupplier.logo;
  this.enabled = productSupplier.enabled;
};

const ProductSupplier = mongoose.model(
  "productSuppliers",
  ProductSupplierSchema,
  "productSuppliers"
);
module.exports = ProductSupplier;
