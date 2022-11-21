const express = require("express");
const router = express.Router();
const XLSX = require("xlsx");
const TourInquiryView = require("./TourInquiryView");
const jwtAuth = require("../../Services/jwtAuthorization");

router.get("/", jwtAuth.checkAuth, TourInquiryView.getTourInquiries);

router.get("/:id", jwtAuth.checkAuth, TourInquiryView.getTourInquiries);

router.post("/", TourInquiryView.createTourInquiry);

router.put("/:id", jwtAuth.checkAuth, TourInquiryView.updateTourInquiry);

router.delete("/:id", jwtAuth.checkAuth, TourInquiryView.deleteTourInquiry);

module.exports = router;
