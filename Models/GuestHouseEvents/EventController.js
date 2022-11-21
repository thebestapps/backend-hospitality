const express = require("express");
const router = express.Router();
const jwtAuth = require("../../Services/jwtAuthorization");
const multer = require("multer");
const EventView = require("./EventView");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./image");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname.replace(/ /g, '_'));
  },
});

const upload = multer({ dest: "image/", storage: storage });

router.post("/", [jwtAuth.checkAuth, upload.array("image", 12)], EventView.AddEvent);

router.get("/", EventView.GetEvent);

router.get("/:id", jwtAuth.checkAuth, EventView.GetEventById);

router.put("/:id", [jwtAuth.checkAuth, upload.array("image", 12)], EventView.Edit);

router.delete("/:id", jwtAuth.checkAuth, EventView.Delete);

module.exports = router;
