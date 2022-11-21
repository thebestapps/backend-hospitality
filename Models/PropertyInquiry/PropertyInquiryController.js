const express = require("express");
const router = express.Router();
const PropertyInquiry = require("./PropertyInquiry");
const XLSX = require("xlsx");
const PropertyInquiryView = require("./PropertyInquiryView");
const jwtAuth = require("../../Services/jwtAuthorization");

router.post("/", PropertyInquiryView.createPropertyInquiry);

router.get("/", PropertyInquiryView.getInquiries);

router.get("/:id", PropertyInquiryView.getInquiryById);

router.put("/:id", jwtAuth.checkAuth, PropertyInquiryView.approveInquiry);

router.delete("/:id", jwtAuth.checkAuth, PropertyInquiryView.deleteInquiry);

module.exports = router;
