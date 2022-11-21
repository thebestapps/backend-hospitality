var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PackageSchema = new mongoose.Schema({
    name: String,
    imageUrl: String,
    products: [{ type: Schema.Types.ObjectId, ref: "products" },],
    price: String
}, { timestamps: true });


PackageSchema.methods.setPackage = function (package) {
    this.name = package.name;
    this.imageUrl = package.imageUrl;
    this.products = package.products;
    this.price = package.price;
}

var Package = mongoose.model('packages', PackageSchema, 'packages');
module.exports = Package;

