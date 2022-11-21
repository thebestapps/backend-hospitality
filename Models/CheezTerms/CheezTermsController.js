const express = require("express");
const router = express.Router();
const CheezTermsView = require("./CheezTermsView");
const jwtAuth = require("../../Services/jwtAuthorization");
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

router.post("/", [jwtAuth.checkAuth, upload.array("image", 12)], CheezTermsView.createCheezTerms);

router.get("/", CheezTermsView.getCheezTerms);

router.put("/", [jwtAuth.checkAuth, upload.array("image", 12)], CheezTermsView.editCheezTerms);

module.exports = router;
