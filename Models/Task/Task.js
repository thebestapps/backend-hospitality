const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  taskName: { type: String, required: true },
  taskList: [{ type: String }],
  dueDate: { type: Date, required: true },
  dueTime: { type: String, required: true },
  isFinished: { type: Boolean, default: false, required: true },
  notes: { type: String, default: null },
  assignedTo: { type: mongoose.Types.ObjectId, ref: "admins", required: true },
  property: { type: mongoose.Types.ObjectId, ref: "properties", default: null },
  deleted: { type: Boolean, default: false, required: true },
});

const Task = mongoose.model("tasks", TaskSchema, "tasks");
module.exports = Task;
