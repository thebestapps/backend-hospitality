const express = require("express");
const router = express.Router();
const jwtAuth = require("../../Services/jwtAuthorization");
const searchView = require("./searchView");

router.get("/areas", jwtAuth.checkUser, searchView.getRecentSearchesForStays);

router.delete("/", jwtAuth.checkUser, searchView.clearSearchHistory);

module.exports = router;
