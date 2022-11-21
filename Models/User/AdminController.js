const express = require("express");
const router = express.Router();
const AdminView = require("./AdminView");
const jwtAuth = require("../../Services/jwtAuthorization");

router.post("/", jwtAuth.checkAuth, AdminView.createUser);

router.post("/login", AdminView.logIn);

router.post("/signup", AdminView.signUpAdmin);

router.get("/profile", jwtAuth.checkAuth, AdminView.getProfile);

router.get("/:id", jwtAuth.checkAuth, AdminView.getAdminById);

router.get("/", jwtAuth.checkAuth, AdminView.getAdmins);

router.put("/:id", jwtAuth.checkAuth, AdminView.editAdmin);

router.delete("/:id", jwtAuth.checkAuth, AdminView.deleteAdmin);

module.exports = router;
