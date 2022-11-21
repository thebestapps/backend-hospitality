const express = require("express");
const router = express.Router();
const profileView = require("./userProfileView");
const addressView = require("../Address/AddressView");
const jwtAuth = require("../../Services/jwtAuthorization");

router.get("/", jwtAuth.checkUser, profileView.getProfile);

router.put("/", jwtAuth.checkUser, profileView.updateInfo);

router.post("/address", jwtAuth.checkUser, addressView.createAddress);

router.get("/favorites", jwtAuth.checkUser, profileView.getFavorites)

router.put("/address/:id", jwtAuth.checkUser, addressView.editAddress);

router.delete("/address/:id", jwtAuth.checkUser, addressView.deleteAddress);

router.put("/address/set-default/:id", jwtAuth.checkUser, addressView.setAddressToDefault);

router.post("/request-change-email", jwtAuth.checkUser, profileView.changeEmailRequest);

router.post("/confirm-change-email", jwtAuth.checkUser, profileView.confirmNewEmail);

router.post("/request-change-phone", jwtAuth.checkUser, profileView.changePhoneNumberRequest);

router.post("/confirm-change-phone", jwtAuth.checkUser, profileView.confirmNewPhoneNumber);

router.post("/phone-numbers/add", jwtAuth.checkUser, profileView.addNumberForUser);

router.put("/phone-numbers/add", jwtAuth.checkUser, profileView.editPhoneNumbers);

router.delete("/phone-numbers/add", jwtAuth.checkUser, profileView.deletPhoneNumber);

module.exports = router;
