const express = require("express");
const router = express.Router();
const jwtAuth = require("../../Services/jwtAuthorization");
const CostView = require("./ShippingCostView");

router.post("/", jwtAuth.checkAuth, CostView.addShippingCost);

router.get("/", jwtAuth.changeCurrency, CostView.getCost);

router.put("/", jwtAuth.checkAuth, CostView.editCost);

module.exports = router;
