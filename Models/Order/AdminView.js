const Order = require("./Order");
const OrderItem = require("../OrderItem/OrderItem");
const Product = require("../Product/Product");
const OrderItems = require("../OrderItem/OrderItem");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const _ = require("lodash");
const { task } = require("../../dbConnection");
const messages = require("../../messages.json");
const CONF = require("../../constants");
const { sendByMailGun } = require("../../Services/generalServices");

async function getOrders(req, res) {
  let data = [];

  let orders = await Order.find()
    .populate("user", "_id fullName email phoneNumber otherPhoneNumbers")
    .populate("currency", "_id name symbol")
    .populate("address", "_id regionAndRoad buildingAndFloor");

  if (orders.length !== 0)
    orders.forEach(async (item) => {
      let user = item.user.toObject();

      !user.phoneNumber
        ? (user.phoneNumber = "")
        : (user.phoneNumber = user.phoneNumber);

      data.push({
        _id: item._id,
        confirmationCode: item.confirmationCode,
        user: user,
        address: item.address,
        totalPrice: item.totalPrice,
        currency: item.currency,
        orderStatus: item.orderStatus,
        isConfirmed: item.isConfirmed,
      });
    });

  return res
    .status(200)
    .send({ orders: data, message: messages.en.getSuccess });
}

async function getOrderItems(req, res) {
  let orderId = mongoose.Types.ObjectId(req.params.id);
  let data = [];

  let items = await OrderItem.find({ order: orderId })
    .populate("product", "_id title sizes")
    .populate("order")
    .populate({
      path: "order",
      populate: {
        path: "address",
        select: "_id city",
        populate: {
          path: "city",
          select: "_id name country",
          populate: {
            path: "country",
            select: "_id name",
          },
        },
      },
    });

  console.log(items);

  if (items.length !== 0)
    items.forEach((ele) => {
      let size = ele.product.sizes.find((size) => size._id.equals(ele.size));
      data.push({
        _id: ele.product._id,
        title: ele.product.title,
        size: size,
        quantity: ele.quantity,
        address: ele.order.address,
      });
    });

  return res.status(200).send({ items: data, message: messages.en.getSuccess });
}

async function setToDelivered(req, res) {
  let { orderId } = req.body;

  let order = await Order.findOneAndUpdate(
    {
      _id: mongoose.Types.ObjectId(orderId),
    },
    { $set: { orderStatus: 1 } },
    { new: true }
  );

  if (!order)
    return res
      .status(404)
      .send({ order: null, message: messages.en.noRecords });

  return res
    .status(200)
    .send({ order: order, message: messages.en.updateSucces });
}

async function manualConfirmOrder(req, res) {
  let { orderId } = req.body;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let order = await Order.findOne({
    _id: mongoose.Types.ObjectId(orderId),
  }).populate("user");

  if (!order)
    return res
      .status(404)
      .send({ order: null, message: messages.en.noRecords });

  order.isConfirmed = true;
  order.confirmationCode = `o#${Math.floor(
    10000000 + Math.random() * 9000000
  )}`;
  await order.save();

  sendByMailGun(
    [order.user.email, CONF.EMAIL],
    "Order is confirmed",
    "Order",
    null,
    `Your Cheez-Hospitality Order has been confirmed successfuly
  Confirmation Code: ${order.confirmationCode}`
  );

  return res.status(200).send({
    isConfirmed: true,
    confirmationCode: order.confirmationCode,
    message: messages.en.updateSucces,
  });
}

module.exports = {
  getOrders,
  getOrderItems,
  setToDelivered,
  manualConfirmOrder,
};
