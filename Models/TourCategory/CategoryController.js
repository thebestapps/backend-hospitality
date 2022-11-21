const express = require("express");
const router = express.Router();
const PropertyCategoryView = require("./categoryView");
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
const jwtAuth = require("../../Services/jwtAuthorization");

router.post("/", [jwtAuth.checkAuth, upload.array("image", 12)], PropertyCategoryView.AddCategory);

router.get("/", PropertyCategoryView.GetCategories);

router.get("/all/admin", PropertyCategoryView.GetCategoriesAdmin);

router.put("/:id", [jwtAuth.checkAuth, upload.array("image", 12)], PropertyCategoryView.Edit);

router.delete("/:id", jwtAuth.checkAuth, PropertyCategoryView.Delete);

router.get("/:id", jwtAuth.checkAuth, PropertyCategoryView.GetCategoryById);

module.exports = router;
