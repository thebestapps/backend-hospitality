const express = require("express");
const router = express.Router();
const jwtAuth = require("../../Services/jwtAuthorization");
const BedsView = require("./bedView");

router.post("/", jwtAuth.checkAuth, BedsView.AddBedType);

router.get("/", BedsView.GetBedsTypes);

router.get("/:id", jwtAuth.checkAuth, BedsView.GetBedsTypesById);

router.put("/:id", jwtAuth.checkAuth, BedsView.EditBeds);

router.delete("/:id", jwtAuth.checkAuth, BedsView.deleteBed);

module.exports = router;
