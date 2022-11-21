const express = require("express");
const router = express.Router();
const PropertyCategoryView = require("./categoryView");
const jwtAuth = require("../../Services/jwtAuthorization");

router.post("/", jwtAuth.checkAuth, PropertyCategoryView.AddCategory);

router.get("/", PropertyCategoryView.GetCategories);

router.put("/:id", jwtAuth.checkAuth, PropertyCategoryView.Edit);

router.delete("/:id", jwtAuth.checkAuth, PropertyCategoryView.Delete);

router.get("/:id", jwtAuth.checkAuth, PropertyCategoryView.GetCategoryById);

module.exports = router;
