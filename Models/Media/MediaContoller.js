const express = require("express");
const router = express.Router();
const multer = require("multer");
const MediaView = require("./MediaView");
const jwtAuth = require("../../Services/jwtAuthorization");
const resize = require("../../Services/imageResize");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./images");
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname.replace(/ /g, '_'));
    },
  });

const upload = multer({ dest: "images/", storage });

router.post("/", [jwtAuth.checkAuth, upload.array("images", 12), resize], MediaView.uploadImages);

router.get("/", jwtAuth.checkAuth, MediaView.getImages);

router.delete("/", jwtAuth.checkAuth, MediaView.deleteTmage);

router.put("/", jwtAuth.checkAuth, MediaView.editOrder);

router.put("/sort", jwtAuth.checkAuth, MediaView.sortImages);

router.post("/social-icons", [jwtAuth.checkAuth, upload.array("images", 12)], MediaView.addSocialIcons);

router.put("/social-icons/:id", [jwtAuth.checkAuth, upload.array("images", 12)], MediaView.editIcon);

router.delete("/social-icons/:id", jwtAuth.checkAuth, MediaView.deleteIcon);

router.get("/social-icons", MediaView.getSocialIcons);

router.get("/social-icons/:id", MediaView.getSocialIconsById);

router.get("/social-icons/app/icons", MediaView.getSocialIconsApp);

module.exports = router;
