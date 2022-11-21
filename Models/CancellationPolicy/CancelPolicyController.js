const express = require("express");
const router = express.Router();
const CancelView = require("./CancelPolicyView");

router.get("/", CancelView.GetPolicis);

router.get("/:id", CancelView.GetPolicyById);

module.exports = router;
