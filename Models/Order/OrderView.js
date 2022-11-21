const Order = require("./Order");
const OrderItem = require("../OrderItem/OrderItem");
const Cart = require("../Cart/Cart");
const CartItem = require("../CartItem/CartItem");
const Product = require("../Product/Product");
const OrderItems = require("../OrderItem/OrderItem");
const mongoose = require("mongoose");
const ShippingCost = require("../ShippingCost/ShippingCost");
const ObjectId = mongoose.Types.ObjectId;
const CONF = require("../../constants");
const _ = require("lodash");
const { task } = require("../../dbConnection");
const { sendByMailGun } = require("../../Services/generalServices");
const messages = require("../../messages.json");

async function createOrder(req, res) {
  let { cartId, addressId, itemsIds, isDelivery } = req.body;

  let cart = await Cart.findOne({ _id: ObjectId(cartId), cartStatus: "open" });

  if (!cart)
    return res.status(404).send({ cart: null, message: messages.en.noRecords });

  let order = await Order.findOne({
    cart: ObjectId(cartId),
    user: ObjectId(req.user._id),
  });

  if (!order) {
    let newOrder = new Order();

    task.save(newOrder);

    let updatedNewOrder = newOrder.toObject();

    if (isDelivery) {
      let shippingCost = await ShippingCost.findOne({ id: "1" });

      if (shippingCost) {
        updatedNewOrder.shippingCost = shippingCost.cost;
        updatedNewOrder.totalPrice += shippingCost.cost;
      }
    }

    let cartItems = await CartItem.find({ cart: ObjectId(cartId) })
      .where("product")
      .in(itemsIds)
      .populate({
        path: "product",
        populate: {
          path: "sizes.price.currency",
          select: "_id name symbol",
        },
      });

    if (cartItems.length === 0)
      return res.status(404).send({ items: [], message: "No items in cart" });

    //Get cart Items and push them to order items
    cartItems.forEach(async (item) => {
      let discountAmount = 0;
      let size = item.product.sizes.find((size) => size._id.equals(item.size));

      if (item.quantity > size.quantity)
        return res
          .status(400)
          .send({ isOrderCreated: false, message: messages.en.outOfStock });

      let orderItem = {
        user: req.user._id,
        order: newOrder._id,
        product: item.product._id,
        size: ObjectId(size._id),
        quantity: item.quantity,
        total: item.quantity * size.price.amount,
        currency: size.price.currency._id,
        product: item.product._id,
        createdAt: new Date(),
      };

      if (item.product.sale.onSale) {
        discountAmount = item.product.sale.salePercent * orderItem.total;

        orderItem.total -= discountAmount;
      }

      updatedNewOrder.user = req.user._id;
      updatedNewOrder.address = ObjectId(addressId);
      updatedNewOrder.cart = ObjectId(cartId);
      updatedNewOrder.totalPrice += orderItem.total;
      updatedNewOrder.currency = size.price.currency._id;
      updatedNewOrder.createdAt = new Date();

      let newOrderItem = new OrderItem(orderItem);
      task.save(newOrderItem);

      //update products quantity after adding order items
      let product = await Product.findOne({ _id: item.product._id });
      let updatedProduct = product.toObject();

      size.quantity -= item.quantity;
      let sizeQuantityIndex = product.sizes.findIndex((ele) =>
        ele._id.equals(size._id)
      );
      updatedProduct.sizes[sizeQuantityIndex] = size;
      updatedProduct.popularityCounter++;

      task.update(product, updatedProduct).options({ viaSave: true });
    });

    //update cart status to closed
    let updatedCart = cart.toObject();
    updatedCart.cartStatus = "closed";
    updatedCart.closeDate = new Date();
    updatedCart.updatedAt = new Date();

    task.update(cart, updatedCart).options({ viaSave: true });

    task.update(newOrder, updatedNewOrder).options({ viaSave: true });

    task.run({ useMongoose: true });

    return res.status(200).send({
      isOrderCreated: true,
      order: updatedNewOrder,
      message: messages.en.addSuccess,
    });
  } else {
    return res
      .status(400)
      .send({ isOrderCreated: false, message: "Order Exist" });
  }
}
async function buyNow(req, res) {
  let { productId, sizeId, quantity, addressId, isDelivery } = req.body;
  let discountAmount = 0;

  let product = await Product.findOne({
    _id: ObjectId(productId),
    deleted: false,
    enabled: true,
  });

  if (!product)
    return res
      .status(404)
      .send({ product: null, message: messages.en.noRecords });

  let size = product.sizes.find((elemnt) => elemnt._id.equals(sizeId));

  if (!size)
    return res
      .status(400)
      .send({ isOrderCreated: false, message: "size not found" });

  if (quantity > size.quantity)
    return res.status(400).send({
      isOrderCreated: false,
      productQuantity: size,
      message: messages.en.outOfStock,
    });

  req.body.user = req.user._id;
  req.body.size = size._id;
  req.body.address = addressId;
  req.body.product = product._id;
  req.body.totalPrice = size.price.amount * quantity;
  req.body.total = size.price.amount * quantity;
  req.body.currency = size.price.currency;
  req.body.isBuyNow = true;

  if (product.sale.onSale) {
    discountAmount = product.sale.salePercent * req.body.totalPrice;

    req.body.totalPrice -= discountAmount;
  }

  if (isDelivery) {
    let shippingCost = await ShippingCost.findOne({ id: "1" });

    if (shippingCost) {
      req.body.shippingCost = shippingCost.cost;
      req.body.totalPrice += shippingCost.cost;
    }
  }

  //Create Order
  let order = new Order(req.body);
  task.save(order);

  req.body.total = size.price.amount * quantity;
  req.body.order = order._id;

  //Create order item
  let orderItem = new OrderItem(req.body);
  task.save(orderItem);

  //Update quantity for choosen sizes
  let updatedProduct = product.toObject();

  size.quantity -= quantity;
  let sizeQuantityIndex = product.sizes.findIndex((ele) =>
    ele._id.equals(size._id)
  );
  updatedProduct.sizes[sizeQuantityIndex] = size;
  updatedProduct.popularityCounter++;

  task.update(product, updatedProduct).options({ viaSave: true });

  task.run({ useMongoose: true });

  return res.status(200).send({
    isOrderCreated: true,
    _id: order._id,
    message: messages.en.addSuccess,
  });
}

async function getOrderById(req, res) {
  let orderId = ObjectId(req.params.id);
  let response = {};
  let items = [];

  let order = await Order.findOne({ _id: orderId, isCancelled: false });

  if (!order)
    return res
      .status(404)
      .send({ order: null, message: messages.en.noRecords });

  let orderItems = await OrderItems.find({ order: orderId })
    .populate({
      path: "product",
      populate: {
        path: "sizes.price.currency",
        select: "_id name symbol",
      },
    })
    .populate("currency", "_id symbol");

  if (orderItems.length !== 0)
    orderItems.forEach((ele) => {
      //Get size information
      let size = ele.product.sizes.find((size) => size._id.equals(ele.size));

      if (!size)
        return res
          .status(404)
          .send({ size: null, message: messages.en.generalError });

      items.push({
        _id: ele._id,
        title: ele.product.title,
        image: ele.product.images[0],
        size: _.pick(size, ["_id", "quantity", "size", "price"]),
        total: ele.total,
        currency: ele.currency,
        quantity: ele.quantity,
      });
    });

  response._id = order._id;
  response.items = items;

  return res
    .status(200)
    .send({ order: response, message: messages.en.getSuccess });
}

async function getOrders(req, res) {
  let conversion = req.conversion;
  let userId = ObjectId(req.user._id);
  let onGoingOrders = [];
  let delieverdOrders = [];

  let ordersItems = await OrderItems.find({
    user: userId,
  })
    .populate("order")
    .populate("currency", "_id symbol")
    .populate({
      path: "product",
      populate: {
        path: "sizes.price.currency",
        select: "_id name symbol",
      },
    });

  if (ordersItems.length !== 0)
    ordersItems.forEach((item) => {
      //skip cancelled
      if (item.order.isCancelled) return;
      if (!item.order.confirmationCode) return;

      //Get Ongoing
      if (item.order.orderStatus === 0) {
        let size = item.product.sizes.find((size) =>
          size._id.equals(item.size)
        );

        if (!size)
          return res
            .status(404)
            .send({ size: null, message: messages.en.generalError });

        onGoingOrders.push({
          _id: item._id,
          order: item.order._id,
          title: item.product.title,
          image: item.product.images[0],
          product: item.product._id,
          createdAt: item.createdAt,
          quantity: item.quantity,
          pricePerItem: !conversion
            ? `${size.price.amount} ${item.currency.symbol}`
            : `${size.price.amount * conversion.rate} ${conversion.to.symbol}`,
          totalPrice: !conversion
            ? `${size.price.amount * item.quantity} ${item.currency.symbol}`
            : `${size.price.amount * item.quantity * conversion.rate} ${
                conversion.to.symbol
              }`,
          confirmationCode: item.order.confirmationCode,
        });
      }

      //Get Deleiverd
      if (item.order.orderStatus === 1) {
        let size = product.sizes.find((size) => size._id.equals(item.size));

        if (!size)
          return res
            .status(404)
            .send({ size: null, message: messages.en.generalError });

        onGoingOrders.push({
          _id: item._id,
          order: item.order._id,
          title: item.product.title,
          image: item.product.images[0],
          product: item.product._id,
          createdAt: item.createdAt,
          quantity: item.quantity,
          pricePerItem: !conversion
            ? `${size.price.amount} ${item.currency.symbol}`
            : `${size.price.amount * conversion.rate} ${conversion.to.symbol}`,
          totalPrice: !conversion
            ? `${size.price.amount * item.quantity} ${item.currency.symbol}`
            : `${size.price.amount * item.quantity * conversion.rate} ${
                conversion.to.symbol
              }`,
          confirmationCode: item.order.confirmationCode,
        });
      }
    });

  return res.status(200).send({
    onGoingOrders: onGoingOrders,
    delieverdOrders: delieverdOrders,
    messages: messages.en.getSuccess,
  });
}

async function addProduct(req, res) {
  var order = req.body.order;
  var product = req.body.product;
  Order.findOneAndUpdate(
    { _id: order },
    { $push: { products: product } },
    function (err, order) {
      if (err) throw err;
      else {
        res.status(200).send({ order });
      }
    }
  );
}

async function removeProduct(req, res) {
  var order = req.body.order;
  var product = req.body.product;
  Order.findOneAndUpdate(
    { _id: order },
    { $pull: { products: product } },
    function (err, order) {
      if (err) throw err;
      else {
        res.status(200).send({ order });
      }
    }
  );
}

async function confirmOrder(req, res) {
  try {
    let { orderId } = req.body;

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
      [req.user.email, CONF.EMAIL],
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
  } catch (err) {
    return res.status(500).send({ message: messages.en.generalError });
  }
}

module.exports = {
  createOrder,
  buyNow,
  getOrderById,
  getOrders,
  addProduct,
  removeProduct,
  confirmOrder,
};
