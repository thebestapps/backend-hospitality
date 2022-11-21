const express = require("express");
const router = express.Router();
const detailsView = require("./DetailsView");
const jwtAuth = require("../../Services/jwtAuthorization");
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
  { name: "keyVideo", maxCount: 1 },
  { name: "keyImage", maxCount: 1 },
  { name: "building", maxCount: 1 },
  { name: "parkingImage", maxCount: 1 },
  { name: "elecImage", maxCount: 1 },
]);

router.post("/", [jwtAuth.checkAuth, multiFields], detailsView.addDetails);

router.get("/", detailsView.getAllDetails);

router.get("/:id", detailsView.getDetailsById);

router.put("/", [jwtAuth.checkAuth, multiFields], detailsView.editDetails);

router.delete("/", jwtAuth.checkAuth, detailsView.deleteDetails);

router.get("/stay/details", detailsView.getDetailsByStayId);

module.exports = router;
