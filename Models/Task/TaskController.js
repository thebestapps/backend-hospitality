const express = require("express");
const router = express.Router();
const jwtAuth = require("../../Services/jwtAuthorization");
const TaskView = require("./TaskView");

router.post("/", jwtAuth.checkAuth, TaskView.createTask);

router.get("/", jwtAuth.checkAuth, TaskView.getTasks);

router.get("/:id", jwtAuth.checkAuth, TaskView.getTaskById);

router.put("/:id", jwtAuth.checkAuth, TaskView.editTask);

router.delete("/:id", jwtAuth.checkAuth, TaskView.deleteTask);

module.exports = router;
