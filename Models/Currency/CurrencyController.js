const express = require("express");
const router = express.Router();
const jwtAuth = require("../../Services/jwtAuthorization");
const CurrencyView = require("./CurrencyView");

router.post("/", jwtAuth.checkAuth, CurrencyView.AddCurrency);

router.get("/", CurrencyView.GetCurrencyApp);

router.get("/admin/view/currency", CurrencyView.GetCurrency);

router.get("/:id", CurrencyView.GetCurrencyById);

router.get("/website/default", CurrencyView.GetDefaultCurrency);

router.put("/:id", jwtAuth.checkAuth, CurrencyView.edit);

router.delete("/:id", jwtAuth.checkAuth, CurrencyView.Delete);

module.exports = router;
