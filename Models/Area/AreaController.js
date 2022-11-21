const express = require("express");
const router = express.Router();
const jwt = require("../../Services/jwtAuthorization");
const AreaView = require("./AreaView");

router.post("/", jwt.checkAuth, AreaView.AddArea);

router.get("/", AreaView.GetAreasApp);

router.get("/admin/all", AreaView.GetAreas);

router.get("/country", AreaView.GetAreasByCountryId);

router.get("/:id", jwt.checkAuth, AreaView.GetAreaById);

router.put("/:id", jwt.checkAuth, AreaView.EditArea);

router.delete("/:id", jwt.checkAuth, AreaView.Delete);

module.exports = router;
