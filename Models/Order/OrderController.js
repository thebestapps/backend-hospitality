const express = require("express");
const router = express.Router();
var XLSX = require("xlsx");
const jwtAuth = require("../../Services/jwtAuthorization");
const OrderView = require("./OrderView");
const AdminView = require("./AdminView");

/********************************** Admin **********************************/
router.get("/admin", jwtAuth.checkAuth, AdminView.getOrders);

router.get("/admin/:id", jwtAuth.checkAuth, AdminView.getOrderItems);

router.put('/admin/confirm-order', jwtAuth.checkAuth, AdminView.manualConfirmOrder);

router.put("/admin/change-to-delivered", jwtAuth.checkAuth, AdminView.setToDelivered)

/********************************** User **********************************/
router.get("/", jwtAuth.checkUser, OrderView.getOrders);

router.get("/:id", jwtAuth.checkUser, OrderView.getOrderById);

router.post("/", jwtAuth.checkUser, OrderView.createOrder);

router.post("/buy-now", jwtAuth.checkUser, OrderView.buyNow);

router.post("/user/confirm-order", jwtAuth.checkUser, OrderView.confirmOrder);

//router.put("/add", OrderView.addProduct);

//router.put("/remove", OrderView.removeProduct);

module.exports = router;
