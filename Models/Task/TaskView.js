const Task = require("./Task");
const mongoose = require("mongoose");
const messages = require("../../messages.json");

async function createTask(req, res) {
  let {} = req.body;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  const newTask = new Task(req.body);
  await newTask.save();

  return res
    .status(200)
    .send({ newTask: newTask, message: messages.en.addSuccess });
}

async function getTasks(req, res) {
  let { teamMember, dueDate, isFinished, stay } = req.query;
  let filter = { deleted: false };

  if (teamMember) filter.assignedTo = mongoose.Types.ObjectId(teamMember);
  if (dueDate) filter.dueDate = new Date(dueDate);
  if (stay) filter.property = mongoose.Types.ObjectId(stay);
  if (isFinished) {
    if (isFinished === "true") filter.isFinished = true;
    if (isFinished === "false") filter.isFinished = false;
  }

  let tasks = await Task.find(filter);

  return res
    .status(200)
    .send({ tasks: tasks, message: messages.en.getSuccess });
}

async function getTaskById(req, res) {
  let taskId = mongoose.Types.ObjectId(req.params.id);

  let task = await Task.findOne({ _id: taskId, deleted: false });
  if (!task)
    return res.status(404).send({ task: null, message: messages.en.noRecords });

  return res.status(200).send({ task: task, message: messages.en.getSuccess });
}

async function editTask(req, res) {
  let taskId = mongoose.Types.ObjectId(req.params.id);

  let task = await Task.findOne({ _id: taskId });
  if (!task)
    return res.status(404).send({ task: null, message: messages.en.noRecords });

  let updated = await Task.findOneAndUpdate(
    { _id: taskId },
    { $set: req.body },
    { new: true }
  );

  return res
    .status(200)
    .send({ task: updated, message: messages.en.updateSucces });
}

async function deleteTask(req, res) {
  let taskId = mongoose.Types.ObjectId(req.params.id);

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let task = await Task.findOne({ _id: taskId });
  if (!task)
    return res.status(404).send({ task: null, message: messages.en.noRecords });

  let deleted = await Task.findOneAndUpdate(
    { _id: taskId },
    { $set: { deleted: true } },
    { new: true }
  );

  return res.status(200).send({ task: deleted, message: messages.en.deleted });
}

module.exports = { createTask, getTasks, getTaskById, editTask, deleteTask };
