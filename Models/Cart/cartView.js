const Cart = require("./Cart");
const CartItem = require("../CartItem/CartItem");
const Product = require("../Product/Product");
const Address = require("../Address/Address");
const mongoose = require("mongoose");
const _ = require("lodash");
const messages = require("../../messages.json");
const { Currency } = require("../Currency/Currency");
const ObjectId = mongoose.Types.ObjectId;

async function addToCart(req, res) {
  let { productId, quantity, sizeId } = req.body;
  let newCartItem = {};
  let newCart = {};
  let cartItems;

  let product = await Product.findOne({
    _id: mongoose.Types.ObjectId(productId),
    deleted: false,
    enabled: true,
  });

  if (!product)
    return res
      .status(404)
      .send({ product: null, message: messages.en.noRecords });

  //Get product quantity according to size
  let productQuantity = product.sizes.find((element) =>
    element._id.equals(sizeId)
  );

  if (!productQuantity)
    return res
      .status(400)
      .send({ addedToCart: false, message: "size not found" });

  if (quantity > productQuantity.quantity)
    return res.status(400).send({
      addedToCart: false,
      productQuantity: productQuantity,
      message: messages.en.outOfStock,
    });

  let cart = await Cart.findOne({
    user: mongoose.Types.ObjectId(req.user._id),
    cartStatus: "open",
  });

  req.body.user = req.user._id;
  req.body.cartStatus = "open";
  req.body.product = productId;
  req.body.size = sizeId;

  //create new cart
  if (!cart) {
    newCart = new Cart(req.body);
    req.body.cart = newCart._id;
    newCartItem = new CartItem(req.body);

    await newCart.save();
    await newCartItem.save();
  }
  //add item to cart if cart exist
  else {
    let existItem = await CartItem.findOne({
      cart: mongoose.Types.ObjectId(cart._id),
      product: mongoose.Types.ObjectId(product._id),
    });

    //Do not add item if it alredy exist
    if (existItem)
      return res
        .status(400)
        .send({ addedToCart: false, message: messages.en.exist });

    req.body.cart = cart._id;
    newCartItem = new CartItem(req.body);

    await newCartItem.save();
  }

  cartItems = await CartItem.find({ cart: req.body.cart }).select("product");

  return res.status(200).send({
    addedToCart: true,
    cartItems: cartItems,
    newCartItem: newCartItem,
    message: messages.en.addSuccess,
  });
}

async function getCart(req, res) {
  let conversion = req.conversion;
  //let cartId = mongoose.Types.ObjectId(req.params.id);
  let userId = mongoose.Types.ObjectId(req.user._id);
  let response = {};
  let items = [];

  let currency = await Currency.findOne({
    isWebSiteDefault: true,
  }).select("_id name symbol");

  let cart = await Cart.findOne({
    user: userId,
    cartStatus: "open",
  }).select("_id  cartStatus");

  if (!cart)
    return res.status(200).send({ cart: null, message: messages.en.noRecords });

  let cartItems = await CartItem.find({
    cart: mongoose.Types.ObjectId(cart._id),
  })
    .populate("cart")
    .populate({
      path: "product",
      populate: {
        path: "sizes.price.currency",
        select: "_id name symbol",
      },
    });

  if (cartItems.length !== 0)
    cartItems.forEach((ele) => {
      //Get size information
      let size = ele.product.sizes.find((size) => size._id.equals(ele.size));

      if (!size)
        return res
          .status(404)
          .send({ size: null, message: messages.en.generalError });

      !conversion ? (size = size) : (size.price.currency = conversion.to);
      !conversion
        ? (size = size)
        : (size.price.amount = size.price.amount * conversion.rate);

      items.push({
        _id: ele._id,
        product: ele.product._id,
        title: ele.product.title,
        image: ele.product.images[0],
        size: _.pick(size, ["_id", "quantity", "size", "price"]),
        total: ele.quantity * size.price.amount,

        quantity: ele.quantity,
      });
    });

  response._id = cart._id;
  response.cartStatus = cart.cartStatus;
  response.items = items;
  response.currency = !conversion ? currency : conversion.to;

  return res
    .status(200)
    .send({ cart: response, message: messages.en.getSuccess });
}

async function editItemQuantity(req, res) {
  let itemId = mongoose.Types.ObjectId(req.params.id);
  let { quantity } = req.body;

  let cart = await Cart.findOne({ user: req.user._id, cartStatus: "open" });

  let cartItem = await CartItem.findOne({ cart: cart._id, product: itemId });

  if (!cartItem)
    return res.status(404).send({ item: null, message: messages.en.noRecords });

  cartItem.quantity = quantity;
  await cartItem.save();

  return res.status(200).send({
    item: cartItem,
    isUpdated: true,
    message: messages.en.updateSucces,
  });
}

async function removeItemFromCart(req, res) {
  let itemId = mongoose.Types.ObjectId(req.params.id);

  let cart = await Cart.findOne({ user: req.user._id, cartStatus: "open" });

  let cartItem = await CartItem.findOne({ cart: cart._id, product: itemId });

  if (!cartItem)
    return res.status(404).send({ item: null, message: messages.en.noRecords });

  let deletedItem = await CartItem.findOneAndRemove({
    cart: cart._id,
    product: itemId,
  });

  let cartItems = await CartItem.find({ cart: cart._id }).select("product");

  if (deletedItem) {
    return res.status(200).send({
      itemRemoved: true,
      cartItems: cartItems,
      message: messages.en.deleted,
    });
  } else {
    return res.status(400).send({
      itemRemoved: false,
      cartItems: cartItems,
      message: messages.en.generalError,
    });
  }
}

module.exports = { addToCart, getCart, editItemQuantity, removeItemFromCart };
