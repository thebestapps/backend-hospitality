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
const RulesView = require("./RulesView");

router.post("/", [jwtAuth.checkAuth, upload.array("image", 12)], RulesView.AddRules);

router.get("/", RulesView.GetRules);

router.get("/:id", jwtAuth.checkAuth, RulesView.GetRuleById);

router.put("/:id", [jwtAuth.checkAuth, upload.array("image", 12)], RulesView.Edit);

router.delete("/:id", jwtAuth.checkAuth, RulesView.Delete);

module.exports = router;
