const express = require("express");
const router = express.Router();
const ProductCategoryView = require("./categoryView");
const jwtAuth = require("../../Services/jwtAuthorization");

router.post("/", jwtAuth.checkAuth, ProductCategoryView.AddCategory);

router.get("/", ProductCategoryView.GetCategories);

router.put("/:id", jwtAuth.checkAuth, ProductCategoryView.Edit);

router.delete("/:id", jwtAuth.checkAuth, ProductCategoryView.Delete);

router.get("/:id", jwtAuth.checkAuth, ProductCategoryView.GetCategoryById);

module.exports = router;
