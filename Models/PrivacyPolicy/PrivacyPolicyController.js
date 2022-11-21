const express = require("express");
const router = express.Router();
const PrivacyPolicyView = require("./PrivacyPolicyView");
const multer = require("multer");
const jwtAuth = require("../../Services/jwtAuthorization");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./image");
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname.replace(/ /g, '_'));
    },
  });
  
  const upload = multer({ dest: "image/", storage: storage });

router.post("/", [jwtAuth.checkAuth, upload.array("image", 12)], PrivacyPolicyView.createCheezTerms);

router.get("/", PrivacyPolicyView.getPrivacyPolicy);

router.put("/", [jwtAuth.checkAuth, upload.array("image", 12)], PrivacyPolicyView.editPrivacyPolicy);

module.exports = router;
