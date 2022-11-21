const Notification = require("./Notification");
const User = require("../User/User");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const _ = require("lodash");
const { task } = require("../../dbConnection");
const messages = require("../../messages.json");
const { sendNotification } = require("../../Services/generalServices");

async function getUsers(req, res) {
  let users = await User.find({}).select("_id fullName email");

  return res
    .status(200)
    .send({ users: users, message: messages.en.getSuccess });
}

async function send(req, res) {
  let { title, body, type, user, property, tour, product } = req.body;
  let keyId = null;
  let listingType = "";

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  req.body.sender = req.user._id;

  if (type === 0) {
    if (property) {
      listingType = "property";
      keyId = mongoose.Types.ObjectId(property);
    }

    if (tour) {
      listingType = "tour";
      keyId = mongoose.Types.ObjectId(tour);
    }

    if (product) {
      listingType = "product";
      keyId = mongoose.Types.ObjectId(product);
    }

    req.body.listingKey = {
      key: listingType,
      id: keyId,
    };
  }

  await Notification.create(req.body).then(async (data) => {
    if (data.length !== 0)
      await User.find(
        {
          _id: { $in: user },
          fcmToken: { $exists: true, $not: { $eq: null } },
        },
        { fcmToken: 1 }
      ).then(async (tokens) => {
        if (tokens && tokens.length > 0) {
          let tokensToSend = tokens.map((a) => a.fcmToken);

          await sendNotification(tokensToSend, title, body, listingType, keyId);
          return res.status(200).send({
            Notification: data,
            message: messages.en.getSuccess,
          });
        }
      });
    else
      return res.status(409).send({
        Notification: null,
        message: messages.en.generalError,
      });
  });
}

async function sendNotificationMessageToUser(req, res) {
  let { lastMessage, receiver } = req.body;

  let user = await User.findOne({ _id: receiver });

  let notification = {
    title: "New Message",
    body: lastMessage,
    listingType: "",
    keyId: "",
  };

  await sendNotification(
    [user.fcmToken],
    notification.title,
    notification.body,
    notification.listingType,
    notification.keyId
  );

  return res.status(200).send({ message: messages.en.addSuccess });
}

module.exports = { send, getUsers, sendNotificationMessageToUser };
