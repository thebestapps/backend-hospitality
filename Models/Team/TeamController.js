const express = require("express");
const router = express.Router();
const jwtAuth = require("../../Services/jwtAuthorization");
const XLSX = require("xlsx");
const TeamView = require("./TeamView");
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

router.get("/", TeamView.getTeam);

router.get("/:id", TeamView.getTeam);

router.post("/", [jwtAuth.checkAuth, upload.array("image", 12)], TeamView.createTeamMember);

router.put("/:id", [jwtAuth.checkAuth, upload.array("image", 12)], TeamView.editTeamMember);

router.delete("/:id", jwtAuth.checkAuth, TeamView.deleteTeamMember);

router.post("/order", jwtAuth.checkAuth, TeamView.orderTeam)

module.exports = router;
