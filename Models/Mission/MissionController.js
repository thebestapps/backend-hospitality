const express = require("express");
const router = express.Router();
const jwtAuth = require("../../Services/jwtAuthorization");
const MissionView = require("./MissionView");
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

router.get("/", MissionView.getMission);

router.post("/", [jwtAuth.checkAuth, upload.array("image", 12)], MissionView.createMission);

router.put("/", [jwtAuth.checkAuth, upload.array("image", 12)], MissionView.editMission);

module.exports = router;
