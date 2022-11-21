const express = require("express");
const router = express.Router();
const OwnersView = require("./OwnersView");
const jwtAuth = require("../../Services/jwtAuthorization");

router.post("/", jwtAuth.checkAuth, OwnersView.createOwner);

router.get("/", jwtAuth.checkAuth, OwnersView.getOwners);

router.get("/:id", jwtAuth.checkAuth, OwnersView.getOwnerById);

router.put("/:id", jwtAuth.checkAuth, OwnersView.editOwner);

router.delete("/:id", jwtAuth.checkAuth, OwnersView.deleteOwner);

module.exports = router;
