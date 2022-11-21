const express = require("express");
const router = express.Router();
const XLSX = require("xlsx");
const jwtAuth = require("../../Services/jwtAuthorization");
const GuesthouseView = require("./GuesthouseView");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./images");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname.replace(/ /g, '_'));
  },
});

const upload = multer({ dest: "images/", storage: storage });

const multiFields = upload.fields([
  { name: "logo", maxCount: 1 },
  { name: "cover", maxCount: 1 },
  { name: "eventImages", maxCount: 10 },
  { name: "barImg", maxCount: 1 },
]);

router.get("/", GuesthouseView.getGuesthouses);

router.get("/:id", jwtAuth.changeCurrency, GuesthouseView.getGuesthouseById);

router.get("/slug/:urlName", jwtAuth.changeCurrency, GuesthouseView.getGuesthouseById);

router.post("/", [jwtAuth.checkAuth, multiFields], GuesthouseView.createGuesthouse);

router.put("/:id", [jwtAuth.checkAuth, multiFields], GuesthouseView.editGuesthouse);

router.delete("/:id", jwtAuth.checkAuth, GuesthouseView.deleteGuesthouse);

//router.delete("/image/:id", jwtAuth.checkAuth, GuesthouseView.deleteEventImage);

module.exports = router;
