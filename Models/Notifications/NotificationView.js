const Notification = require("./Notification");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const _ = require("lodash");
const { task } = require("../../dbConnection");
const messages = require("../../messages.json");
const Admin = require("../User/Admin");
const { sendNotification } = require("../../Services/generalServices");

async function getMyNotifications(req, res) {
  let userId = req.user._id;
  let data = [];
  let today = new Date();

  let notifications = await Notification.find({
    user: { $eq: userId },
    deleted: false,
  })
    .select("-user -sender -deleted -__v")
    .sort("-createdAt");

  notifications.forEach((item) => {
    let timmDiff = today.getTime() - new Date(item.createdAt).getTime();
    let numOfDaysBeforeCancelation = Math.round(
      timmDiff / (1000 * 60 * 60 * 24)
    );

    if (numOfDaysBeforeCancelation >= 5) return;
    else data.push(item);
  });

  return res
    .status(200)
    .send({ notifications: data, message: messages.en.getSuccess });
}

async function deleteNotification(req, res) {
  let userId = req.user._id;

  let notification = await Notification.findOne({
    _id: ObjectId(req.params.id),
    user: userId,
    deleted: false,
  });

  if (!notification)
    return res.status(404).send({
      deleted: false,
      message: messages.en.noRecords,
    });

  notification.deleted = true;
  await notification.save();

  return res.status(200).send({ deleted: true, message: messages.en.deleted });
}

async function sendNotificationMessageToAdmin(req, res) {
  let { lastMessage, receiver } = req.body;

  let users = await Admin.find().where("fcmToken").ne(null);
  let tokens = users.map((user) => user.fcmToken);

  let notification = {
    title: `${req.user.fullName.first} ${req.user.fullName.last}`,
    body: lastMessage,
    listingType: "",
    keyId: "",
  };

  await sendNotification(
    tokens,
    notification.title,
    notification.body,
    notification.listingType,
    notification.keyId
  );

  return res.status(200).send({ message: messages.en.addSuccess });
}

module.exports = {
  getMyNotifications,
  deleteNotification,
  sendNotificationMessageToAdmin,
};
