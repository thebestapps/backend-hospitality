const express = require("express");
const router = express.Router();
const jwtAuth = require("../../Services/jwtAuthorization");
const XLSX = require("xlsx");
const RateView = require("./ConversionView");

router.get("/", RateView.getRates);

router.get("/:id", RateView.getRateById);

router.get("/website/default", RateView.getDefaultCurrencyRate);

router.post("/", jwtAuth.checkAuth, RateView.createRate);

router.put("/:id", jwtAuth.checkAuth, RateView.editRate);

router.delete("/:id", jwtAuth.checkAuth, RateView.deleteRate);

module.exports = router;
