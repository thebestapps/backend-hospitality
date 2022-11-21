const express = require("express");
const router = express.Router();
var XLSX = require("xlsx");
const jwtAuth = require("../../Services/jwtAuthorization");
const NotificationView = require("./NotificationView");
const AdminView = require("./AdminView");

router.post("/", jwtAuth.checkAuth, AdminView.send);

router.post("/message", jwtAuth.checkAuth, AdminView.sendNotificationMessageToUser);

router.post("/message/user", jwtAuth.checkUser, NotificationView.sendNotificationMessageToAdmin);

router.get("/users", jwtAuth.checkAuth, AdminView.getUsers);

router.get("/", jwtAuth.checkUser, NotificationView.getMyNotifications);

router.delete("/:id", jwtAuth.checkUser, NotificationView.deleteNotification);

module.exports = router;
