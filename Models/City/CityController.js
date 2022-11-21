const express = require("express");
const router = express.Router();
const jwtAuth = require("../../Services/jwtAuthorization");
const CityView = require("./CityView");
const multer = require("multer");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./image");
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname.replace(/ /g, '_'));
    },
  });

const upload = multer({ dest: "image/", storage });

router.post("/", [jwtAuth.checkAuth, upload.array("image", 12)], CityView.AddCity);

router.get("/", CityView.GetCitiesApp);

router.get("/admin/all", CityView.GetCities);

router.get("/world/city/:id", CityView.GetCitisOfACountryInTheWorld);

router.get("/country", CityView.GetCitiesByCountryId);

router.get("/search", CityView.search);

router.get("/:id", jwtAuth.checkAuth, CityView.GetCityById);

router.put("/:id", [jwtAuth.checkAuth, upload.array("image", 12)], CityView.EditCity);

router.delete("/:id", jwtAuth.checkAuth, CityView.Delete);

module.exports = router;
