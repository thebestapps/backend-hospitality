const express = require("express");
const router = express.Router();
const DetailsView = require("./ContactDetailsView");
const jwtAuth = require("../../Services/jwtAuthorization");

router.post("/", jwtAuth.checkAuth, DetailsView.createDetails);

router.get("/", DetailsView.getDetails);

router.put("/", jwtAuth.checkAuth, DetailsView.ediDetails);

router.delete("/", jwtAuth.checkAuth, DetailsView.deleteDetials);

module.exports = router;
