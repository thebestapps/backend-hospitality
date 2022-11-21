const express = require("express");
const router = express.Router();
const jwtAuth = require("../../Services/jwtAuthorization");
const CountryView = require("./CountryView");

router.post("/:id", jwtAuth.checkAuth, CountryView.AddCountry);

router.get("/", CountryView.GetCountriesApp);

router.get("/admin/all", CountryView.GetCountries);

router.get("/world/countries", CountryView.GetAllCountries);

router.get("/:id", jwtAuth.checkAuth, CountryView.GetCountryById);

router.put("/:id", jwtAuth.checkAuth, CountryView.EditCountry);

router.delete("/:id", jwtAuth.checkAuth, CountryView.Delete);

module.exports = router;
