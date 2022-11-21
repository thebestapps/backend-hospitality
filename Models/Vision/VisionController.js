const express = require("express");
const router = express.Router();
const jwtAuth = require("../../Services/jwtAuthorization");
const MissionView = require("./VisionView");
const multer = require("multer");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./image");
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname.replace(/ /g, '_'));
    },
  });
  
  const upload = multer({ dest: "image/", storage: storage });
router.get("/", MissionView.getVision);

router.post("/", [jwtAuth.checkAuth, upload.array("image", 12)], MissionView.createVision);

router.put("/", [jwtAuth.checkAuth, upload.array("image", 12)], MissionView.editVision);

module.exports = router;
