const express = require("express");
const router = express.Router();
const XLSX = require("xlsx");
const CareerView = require("./CareerView");
const jwt = require("../../Services/jwtAuthorization");

router.get("/", CareerView.getCareers);

router.get("/:id", CareerView.getCareers);

router.post("/", jwt.checkAuth, CareerView.createCareer);

router.put("/:id", jwt.checkAuth, CareerView.editCareer);

router.delete("/:id", jwt.checkAuth, CareerView.deleteCareer);

module.exports = router;
