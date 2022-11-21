const Product = require("./Product");
const mongoose = require("mongoose");
const messages = require("../../messages.json");
const { policis } = require("../CancellationPolicy/CancelPolicy");

async function GetProducts(req, res) {
  let conversion = req.conversion;
  let {
    sort,
    productType,
    minPrice,
    maxPrice,
    todayDeals,
    supplier,
    pageSize,
    pageNumber,
  } = req.query;
  let data = [];
  let filter = { deleted: false, enabled: true };

  if (productType) {
    typeof productType === "string"
      ? (filter.category = productType.split(","))
      : (filter.category = productType);
  }

  if (supplier) {
    typeof supplier === "string"
      ? (filter.supplier = supplier.split(","))
      : (filter.supplier = supplier);
  }

  if (maxPrice && minPrice)
    filter["sizes.price.amount"] = { $gte: minPrice, $lte: maxPrice };

  if (todayDeals === "true") filter["sale.onSale"] = true;
  else filter = filter;

  if (pageSize) pageSize = parseInt(pageSize);
  else pageSize = 10;
  if (pageNumber) pageNumber = parseInt(pageNumber);
  else pageNumber = 1;

  if (req.url === "/new") filter.new = true;

  const products = await Product.find(filter)
    .populate("supplier", "_id name")
    .populate({
      path: "sizes",
      populate: {
        path: "price.currency",
        model: "currencies",
      },
    })
    //.populate("sizes.price.currency", "_id symbol")
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize);

  let totalCount = await await Product.count({ deleted: false, enabled: true });

  if (products.length !== 0)
    products.forEach((item) => {
      data.push({
        _id: item._id,
        title: item.title,
        urlName: item.urlName,
        images: item.images,
        supplier: !item.supplier ? "" : item.supplier.name,
        price: !conversion
          ? `${item.sizes[0].price.amount} ${item.sizes[0].price.currency.symbol}`
          : `${item.sizes[0].price.amount * conversion.rate} ${
              conversion.to.symbol
            }`,
        onSale: item.sale.onSale,
        saleAmount: `${item.sale.salePercent * 100}%`,
        popularityCounter: item.popularityCounter,
      });
    });

  //Sorting results
  if (sort === "price") {
    data.sort((a, b) => {
      return parseInt(a.price) - parseInt(b.price);
    });
  }

  if (sort === "popularity") {
    data.sort((a, b) => {
      return b.popularityCounter - a.popularityCounter;
    });
  }

  return res
    .status(200)
    .send({ products: data, totalCount, message: messages.en.getSuccess });
}

async function GetFeaturedProducts(req, res) {
  let conversion = req.conversion;
  let query = { deleted: false, enabled: true };
  let data = [];

  const products = await Product.find(query)
    .populate("supplier", "_id name")
    .populate("sizes.price.currency", "_id symbol")
    .limit(10);

  let totalCount = await await Product.count({ deleted: false, enabled: true });

  if (products.length !== 0)
    products.forEach((item) => {
      data.push({
        _id: item._id,
        title: item.title,
        urlName: item.urlName,
        images: item.images,
        supplier: !item.supplier ? "" : item.supplier.name,
        price: !conversion
          ? `${item.sizes[0].price.amount} ${item.sizes[0].price.currency.symbol}`
          : `${item.sizes[0].price.amount * conversion.rate} ${
              conversion.to.symbol
            }`,
        onSale: item.sale.onSale,
        saleAmount: `${item.sale.salePercent * 100}%`,
      });
    });

  return res
    .status(200)
    .send({ products: data, totalCount, message: messages.en.getSuccess });
}

async function GetRelatedProducts(req, res) {
  let conversion = req.conversion;
  let query = { deleted: false, enabled: true };
  let { productId } = req.query;
  let data = [];

  const product = await Product.findOne({
    _id: mongoose.Types.ObjectId(productId),
  });

  if (product) query.supplier = product.supplier._id;

  const products = await Product.find(query)
    .populate("supplier", "_id name")
    .populate("sizes.price.currency", "_id symbol")
    .limit(10);

  let totalCount = await await Product.count({ deleted: false, enabled: true });

  if (products.length !== 0)
    products.forEach((item) => {
      data.push({
        _id: item._id,
        title: item.title,
        urlName: item.urlName,
        images: item.images,
        supplier: !item.supplier ? "" : item.supplier.name,
        price: !conversion
          ? `${item.sizes[0].price.amount} ${item.sizes[0].price.currency.symbol}`
          : `${item.sizes[0].price.amount * conversion.rate} ${
              conversion.to.symbol
            }`,
        onSale: item.sale.onSale,
        saleAmount: `${item.sale.salePercent * 100}%`,
      });
    });

  return res
    .status(200)
    .send({ products: data, totalCount, message: messages.en.getSuccess });
}

async function GetProductById(req, res) {
  let conversion = req.conversion;
  let productId = mongoose.Types.ObjectId(req.params.id);
  let data = {};
  let query = {
    // _id: productId,
    deleted: false,
    enabled: true,
  };

  if (req.params.id) query = { _id: productId };
  if (req.params.urlName) query = { urlName: req.params.urlName };

  let product = await Product.findOne(query).populate(
    "sizes.price.currency",
    "_id symbol"
  );
  if (product) {
    data = {
      _id: product._id,
      title: product.title,
      images: product.images,
      sizes: !conversion
        ? product.sizes
        : product.sizes.map((ele) => {
            return {
              price: {
                amount: ele.price.amount * conversion.rate,
                currency: conversion.to,
              },
              size: ele.size,
              quantity: ele.quantity,
              _id: ele._id,
            };
          }),
      story: product.story,
      usage: product.usage,
      ingredients: product.ingredients,
      price: !conversion
        ? `${product.sizes[0].price.amount} ${product.sizes[0].price.currency.symbol}`
        : `${product.sizes[0].price.amount * conversion.rate} ${
            conversion.to.symbol
          }`,
      cancelationPolicy: policis.find((item) =>
        item._id.equals(product.cancelationPolicy)
      ),
      rules: product.rules,
    };

    return res
      .status(200)
      .send({ product: data, message: messages.en.getSuccess });
  }

  return res
    .status(400)
    .send({ product: null, message: messages.en.noRecords });
}

async function addOrRemoveFromFavorites(req, res) {
  let { productId } = req.body;
  let user = req.user;

  let product = await Product.findOne({
    _id: mongoose.Types.ObjectId(productId),
  });

  if (!product)
    return res
      .status(404)
      .send({ product: null, message: messages.en.noRecords });

  let exist = user.favoriteProducts
    .map((item) => item.toString())
    .includes(productId);

  if (exist) {
    user.favoriteProducts.pull(productId);
    await user.save();

    return res.status(200).send({
      addedToFavorite: false,
      favoriteProducts: user.favoriteProducts,
      message: messages.en.exist,
    });
  }

  user.favoriteProducts.push(productId);
  await user.save();

  return res.status(200).send({
    addedToFavorite: true,
    favoriteProducts: user.favoriteProducts,
    message: messages.en.addSuccess,
  });
}

async function search(req, res) {
  let conversion = req.conversion;
  let { categoryId, minPrice, maxPrice } = req.query;
  let filter = { deleted: false, enabled: true };
  let data = [];

  if (categoryId) {
    typeof categoryId === "string"
      ? (filter.category = categoryId.split(",:"))
      : (filter.category = categoryId);
  }

  if (maxPrice && minPrice)
    filter["price.amount.medium"] = { $gte: minPrice, $lte: maxPrice };

  const products = await Product.find(filter)
    .populate("supplier", "_id name")
    .populate("sizes.price.currency", "_id symbol");

  let totalCount = await Product.count({ deleted: false, enabled: true });

  if (products.length !== 0)
    products.forEach((item) => {
      data.push({
        _id: item._id,
        title: item.title,
        urlName: item.urlName,
        images: item.images,
        supplier: item.supplier.name,
        price: !conversion
          ? `${item.sizes[0].price.amount} ${item.sizes[0].price.currency.symbol}`
          : `${item.sizes[0].price.amount * conversion.rate} ${
              conversion.to.symbol
            }`,
      });
    });

  return res
    .status(200)
    .send({ products: data, totalCount, message: messages.en.getSuccess });
}

module.exports = {
  GetProducts,
  GetFeaturedProducts,
  GetRelatedProducts,
  GetProductById,
  addOrRemoveFromFavorites,
  search,
};
