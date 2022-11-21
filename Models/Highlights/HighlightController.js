const express = require("express");
const router = express.Router();
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

const upload = multer({ dest: "image/", storage: storage });
const HighlightView = require("./HighlightView");

router.post("/", [jwtAuth.checkAuth, upload.array("image", 12)], HighlightView.AddHighlight);

router.get("/", HighlightView.GetHighlight);

router.get("/:id", jwtAuth.checkAuth, HighlightView.GetHighlightById);

router.put("/:id", [jwtAuth.checkAuth, upload.array("image", 12)], HighlightView.Edit);

router.delete("/:id", jwtAuth.checkAuth, HighlightView.Delete);

module.exports = router;
