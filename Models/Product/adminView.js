var Product = require("./Product");
const messages = require("../../messages.json");

async function createProduct(req, res) {
  let { title } = req.body;
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  req.body.urlName = title.replace(/\s+/g, "-");

  var newProduct = new Product(req.body);
  console.log("req.body", req.body);
  //newProduct.setProduct(req.body);
  await newProduct.save();
  console.log("Product successfully created");
  res.status(200).send(newProduct);
}

async function getProducts(req, res) {
  var products;
  try {
    if (req.params.id) {
      if (req.params.id !== "new") {
        var query = { _id: req.params.id, deleted: false };
        products = await Product.findOne(query)
          .populate("sizes.price.currency", "_id name symbol")
          .populate("supplier", "_id name")
          .populate("category", "_id name");
      }
    } else {
      products = await Product.find({ deleted: false })
        .populate("sizes.price.currency", "_id name symbol")
        .populate("supplier", "_id name")
        .populate("category", "_id name");
    }
    if (products) res.status(200).send({ products: products });
    else res.status(200).send({ products: null, message: "No product" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
}

async function editProduct(req, res) {
  let { title } = req.body;
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  if (title) req.body.urlName = title.replace(/\s+/g, "-");

  let product = await Product.findOne({ _id: req.params.id, deleted: false });

  if (!product)
    return res
      .status(404)
      .send({ product: null, message: messages.en.noRecords });

  let updated = await Product.findOneAndUpdate(
    { _id: req.params.id },
    { $set: req.body },
    { new: true }
  );

  return res
    .status(200)
    .send({ tour: updated, message: messages.en.updateSucces });
}

async function deleteProduct(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let product = await Product.findOne({ _id: req.params.id, deleted: false });

  if (!product)
    return res
      .status(404)
      .send({ product: null, message: messages.en.noRecords });

  let deleted = await Product.findOneAndUpdate(
    { _id: req.params.id },
    { $set: { deleted: true, enabled: false } },
    { new: true }
  );

  return res
    .status(200)
    .send({ product: deleted, message: messages.en.updateSucces });
}

async function deleteAllImages(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let product = await Product.findOne({ _id: req.params.id });

  if (!product)
    return res
      .status(404)
      .send({ product: null, message: messages.en.noRecords });

  AWS.config.setPromisesDependency();
  AWS.config.update({
    accessKeyId: CONF.AWS.ID,
    secretAccessKey: CONF.AWS.SECRET,
    region: CONF.AWS.REGION,
  });

  const s3 = new AWS.S3();

  let images = product.images;

  product.images = [];

  images.forEach((image) => {
    s3.deleteObject(
      {
        Bucket: CONF.AWS.BUCKET_NAME,
        Key: image.split(".com/").pop(),
      },
      async (data, err) => {
        if (err) {
          console.log(err);
          return res.status(500).send({ err: err });
        }
        if (data) {
          console.log(data);
        }
      }
    );
  });

  await product.save();

  return res.status(200).send({ message: messages.en.deleted });
}

module.exports = {
  createProduct,
  getProducts,
  editProduct,
  deleteProduct,
  deleteAllImages,
};
