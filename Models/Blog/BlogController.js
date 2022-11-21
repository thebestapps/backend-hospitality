const express = require("express");
const router = express.Router();
const Blog = require("./Blog");
const XLSX = require("xlsx");
const BlogView = require("./BlogView");
const multer = require("multer");
const jwtAuth = require("../../Services/jwtAuthorization");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./images");
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname.replace(/ /g, '_'));
    },
  });

const upload = multer({ dest: "images/", storage });

router.get("/", BlogView.getBlogs);

router.get("/:id", BlogView.getBlogById);

router.post("/", [jwtAuth.checkAuth, upload.array("photos", 12)], BlogView.createBlog);

router.put("/:id", [jwtAuth.checkAuth, upload.array("photos", 12)], BlogView.editBlog);

router.delete("/:id", jwtAuth.checkAuth, BlogView.deleteBlog);

router.put("/image/:id", [jwtAuth.checkAuth, upload.array("photo", 1)], BlogView.editImageForBlog);

router.delete("/image/:id", jwtAuth.checkAuth, BlogView.DeleteBlogImage);

module.exports = router;
