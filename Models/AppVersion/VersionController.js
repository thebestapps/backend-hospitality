const express = require("express");
const router = express.Router();
const jwtAuth = require("../../Services/jwtAuthorization");
const VersionView = require("./VersionView");

router.post("/ios", jwtAuth.checkAuth, VersionView.addVersionIos);

router.put("/ios", jwtAuth.checkAuth, VersionView.editVersionIos);

router.get("/ios", VersionView.getVersionIos);

router.get("/", VersionView.getVersion);

router.post("/android", jwtAuth.checkAuth, VersionView.addVersionAndroid);

router.put("/android", jwtAuth.checkAuth, VersionView.editVersionAndroid);

router.get("/android", VersionView.getVersionAndroid);

module.exports = router;
