const express = require("express");
const router = express.Router();
const jwtAuth = require("../../Services/jwtAuthorization");
const GuestsView = require("./GuestView");
const AddressView = require("../Address/AddressView");

router.get("/", jwtAuth.checkAuth, GuestsView.getGuests);

router.post("/all/dropdown", jwtAuth.checkAuth, GuestsView.getAllAsDropDown);

router.get("/:id", jwtAuth.checkAuth, GuestsView.getGuestById);

router.put("/:id", jwtAuth.checkAuth, GuestsView.editGuestInfo);

router.put("/address/:id", jwtAuth.checkAuth, GuestsView.editAddress);

router.post("/", jwtAuth.checkAuth, GuestsView.addGuest);

module.exports = router;
