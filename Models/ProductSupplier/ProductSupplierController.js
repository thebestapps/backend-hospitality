const express = require("express");
const router = express.Router();
const ProductSupplier = require("./ProductSupplier");
const XLSX = require("xlsx");
const jwtAuth = require("../../Services/jwtAuthorization");
const ProductSupplierView = require("./ProductSupplierView");

router.get("/", ProductSupplierView.getProductSuppliers);

router.get("/:id", ProductSupplierView.getProductSuppliers);

router.post("/", jwtAuth.checkAuth, ProductSupplierView.createProductSupplier);

router.put("/:id", jwtAuth.checkAuth, ProductSupplierView.edit);

router.delete("/:id", jwtAuth.checkAuth, ProductSupplierView.deleteSupplier);

module.exports = router;
