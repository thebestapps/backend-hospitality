const express = require("express");
const router = express.Router();
const jwtAuth = require("../../Services/jwtAuthorization");
const multer = require("multer");
const AmenitiesView = require("./AmenitiesView");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./image");
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname.replace(/ /g, '+'));
    },
  });

const upload = multer({ dest: "image/", storage });

router.post("/", [jwtAuth.checkAuth, upload.array("image", 12)], AmenitiesView.AddAmenities);

router.get("/", AmenitiesView.GetAmenities);

router.get("/featured", AmenitiesView.GetAmenities);

router.get("/nonefeatured", AmenitiesView.GetAmenities);

router.get("/:id", jwtAuth.checkAuth, AmenitiesView.GetAmenitiesById);

router.put("/:id", [jwtAuth.checkAuth, upload.array("image", 12)], AmenitiesView.Edit);

router.delete("/:id", jwtAuth.checkAuth, AmenitiesView.Delete);

module.exports = router;
