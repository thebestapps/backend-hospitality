const express = require("express");
const router = express.Router();
const jwtAuth = require("../../Services/jwtAuthorization");
const XLSX = require("xlsx");
const CompanyView = require("./CompanyView");
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

router.get("/", CompanyView.getCompany);

router.get("/:id", CompanyView.getCompany);

router.post("/", [jwtAuth.checkAuth, upload.array("image", 12)], CompanyView.createCompany);

router.put("/:id", [jwtAuth.checkAuth, upload.array("image", 12)], CompanyView.editCompany);

router.delete("/:id", jwtAuth.checkAuth, CompanyView.deleteCompany);

module.exports = router;
