const express = require("express");
const router = express.Router();
const jwtAuth = require("../../Services/jwtAuthorization");
const bathView = require("./bathroomView");

router.post("/", jwtAuth.checkAuth, bathView.AddBathType);

router.get("/", bathView.GetBathTypes);

router.get("/:id", jwtAuth.checkAuth, bathView.GetBathTypesById);

router.put("/:id", jwtAuth.checkAuth, bathView.EditBathroom);

router.delete("/:id", jwtAuth.checkAuth, bathView.deleteBathroom);

module.exports = router;
