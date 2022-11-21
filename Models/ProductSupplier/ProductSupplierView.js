const express = require("express");
const router = express.Router();
const ProductSupplier = require("./ProductSupplier");
const messages = require("../../messages.json");

async function createProductSupplier(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let newProductSupplier = new ProductSupplier(req.body);
  //newProductSupplier.setProductSupplier(req.body);
  await newProductSupplier.save();
  console.log("ProductSupplier successfully created");
  res.status(200).send(newProductSupplier);
}

async function getProductSuppliers(req, res) {
  let productSuppliers;
  try {
    if (req.params.id) {
      var query = { _id: req.params.id };
      productSuppliers = await ProductSupplier.findOne(query);
    } else {
      productSuppliers = await ProductSupplier.find({});
    }
    if (productSuppliers) res.status(200).send(productSuppliers);
    else res.status(200).send({ message: "No product Suppliers" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
}

async function edit(req, res) {
  let supplierId = req.params.id;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  const productSupplier = await ProductSupplier.findOne({ _id: supplierId });

  if (!productSupplier)
    return res
      .status(404)
      .send({ productSupplier: null, message: messages.en.noRecords });

  let updated = await ProductSupplier.findOneAndUpdate(
    { _id: supplierId },
    { $set: req.body },
    { new: true }
  );

  return res
    .status(200)
    .send({ productSupplier: updated, message: messages.en.updateSucces });
}

async function deleteSupplier(req, res) {
  let supplierId = req.params.id;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  const productSupplier = await ProductSupplier.findOne({ _id: supplierId });

  if (!productSupplier)
    return res
      .status(404)
      .send({ productSupplier: null, message: messages.en.noRecords });

  let deleted = await ProductSupplier.findOneAndDelete({ _id: supplierId });

  return res
    .status(200)
    .send({ productSupplier: deleted, message: messages.en.deleted });
}

module.exports = {
  createProductSupplier,
  getProductSuppliers,
  edit,
  deleteSupplier,
};
