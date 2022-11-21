const express = require("express");
const router = express.Router();
const Product = require("./Product");
const XLSX = require("xlsx");
const AdminView = require("./adminView");
const ProductView = require("./ProductView");
const jwtAuth = require("../../Services/jwtAuthorization");

/********************************** Admin **********************************/
router.get("/admin", AdminView.getProducts);

router.get("/admin/:id", AdminView.getProducts);

router.post("/", jwtAuth.checkAuth, AdminView.createProduct);

router.put("/:id", jwtAuth.checkAuth, AdminView.editProduct);

router.delete("/:id", jwtAuth.checkAuth, AdminView.deleteProduct);

router.delete("images/:id", jwtAuth.checkAuth, AdminView.deleteAllImages);

/********************************** User **********************************/
router.get("/", jwtAuth.changeCurrency, ProductView.GetProducts);

router.get("/new", jwtAuth.changeCurrency, ProductView.GetProducts);

router.get("/featured", jwtAuth.changeCurrency, ProductView.GetFeaturedProducts);

router.get("/related", jwtAuth.checkUser, ProductView.GetRelatedProducts);

router.get("/:id", jwtAuth.changeCurrency, ProductView.GetProductById);

router.get("/slug/:urlName", jwtAuth.changeCurrency, ProductView.GetProductById);

router.post('/add-remove-favorites', jwtAuth.checkUser, ProductView.addOrRemoveFromFavorites);

router.get("/user/search", jwtAuth.changeCurrency, ProductView.search);

module.exports = router;
