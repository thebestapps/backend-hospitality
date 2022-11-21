const express = require("express");
const router = express.Router();
const XLSX = require("xlsx");
//const AdminView = require("./adminView");
const cartView = require("./cartView");
const jwtAuth = require("../../Services/jwtAuthorization");

router.post("/", jwtAuth.checkUser, cartView.addToCart);

router.get("/", jwtAuth.checkUser, cartView.getCart);

router.put("/item/:id", jwtAuth.checkUser, cartView.editItemQuantity);

router.delete("/item/:id", jwtAuth.checkUser, cartView.removeItemFromCart);

module.exports = router;
