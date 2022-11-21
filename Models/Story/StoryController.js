const express = require("express");
const router = express.Router();
const Story = require("./Story");
const jwtAuth = require("../../Services/jwtAuthorization");
const XLSX = require("xlsx");
const StoryView = require("./StoryView");
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

router.get("/", StoryView.getStory);

router.post("/", [jwtAuth.checkAuth, upload.array("image", 12)], StoryView.createStory);

router.put("/", [jwtAuth.checkAuth, upload.array("image", 12)], StoryView.editStory);

module.exports = router;
