const { Category } = require("./Category");
const messages = require("../../messages.json");
const mongoose = require("mongoose");
const CONF = require("../../constants");
const AWS = require("aws-sdk");
const fs = require("fs");

const url = (folder, picture) => {
  return `https://${CONF.AWS.BUCKET_NAME}.s3.amazonaws.com/${folder}/${picture}`;
};

async function AddCategory(req, res) {
  let { name } = req.body;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let params = {
    ACL: "public-read",
    Bucket: CONF.AWS.BUCKET_NAME,
    Body: fs.createReadStream(req.files[0].path),
    Key: `Tour-Category/${req.files[0].filename}`,
  };

  AWS.config.setPromisesDependency();
  AWS.config.update({
    accessKeyId: CONF.AWS.ID,
    secretAccessKey: CONF.AWS.SECRET,
    region: CONF.AWS.REGION,
  });

  const s3 = new AWS.S3();

  let category = await Category.findOne({ name: name });

  if (!category) {
    s3.upload(params, async (err, data) => {
      if (err) {
        console.log("Error occured while trying to upload to S3 bucket", err);
        return res.status(500).send({ err: err });
      }

      if (data) {
        fs.unlinkSync(req.files[0].path); // Empty temp folder
        console.log(data);
        console.log(req.files[0]);
      }
    });

    req.body.image = url("Tour-Category", req.files[0].filename);

    const newCategory = new Category(req.body);
    await newCategory.save();

    return res
      .status(200)
      .send({ category: newCategory, message: messages.en.categorySuccess });
  }

  return res.status(400).send({ message: messages.en.categoryExist });
}

async function GetCategories(req, res) {
  let categories = await Category.find({
    deleted: false,
    enabled: true,
  }).select("_id name image enabled");

  if (categories.length === 0)
    return res
      .status(200)
      .send({ categories: categories, messages: messages.en.NoCategories });

  return res
    .status(200)
    .send({ categories: categories, messages: messages.en.getSuccess });
}

async function GetCategoriesAdmin(req, res) {
  let categories = await Category.find({ deleted: false }).select(
    "_id name image enabled"
  );

  if (categories.length === 0)
    return res
      .status(200)
      .send({ categories: categories, messages: messages.en.NoCategories });

  return res
    .status(200)
    .send({ categories: categories, messages: messages.en.getSuccess });
}

async function GetCategoryById(req, res) {
  let categoryId = req.params.id;
  categoryId = mongoose.Types.ObjectId(categoryId);

  let category = await Category.findOne({
    _id: categoryId,
    deleted: false,
  }).select("_id name enabled");

  if (!category)
    return res.status(404).send({ message: messages.en.NoCategories });

  return res
    .status(200)
    .send({ category: category, message: messages.en.getSuccess });
}

async function Edit(req, res) {
  let categoryId = mongoose.Types.ObjectId(req.params.id);
  let { enabled } = req.body;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let category = await Category.findOne({ _id: categoryId });

  if (!category)
    return res.status(404).send({ message: messages.en.NoCategories });

  if (enabled === "true") enabled = true;
  else enabled = false;

  if (req.files.length === 0) {
    let updated = await Category.findOneAndUpdate(
      { _id: categoryId, deleted: false },
      { $set: req.body },
      { new: true }
    );

    return res
      .status(200)
      .send({ category: updated, message: messages.en.updateSucces });
  } else {
    let params = {
      ACL: "public-read",
      Bucket: CONF.AWS.BUCKET_NAME,
      Body: fs.createReadStream(req.files[0].path),
      Key: `Tour-Category/${req.files[0].filename}`,
    };

    AWS.config.setPromisesDependency();
    AWS.config.update({
      accessKeyId: CONF.AWS.ID,
      secretAccessKey: CONF.AWS.SECRET,
      region: CONF.AWS.REGION,
    });

    const s3 = new AWS.S3();

    if (category.image)
      s3.deleteObject(
        {
          Bucket: CONF.AWS.BUCKET_NAME,
          Key: category.image.split(".com/").pop(),
        },
        async (data, err) => {
          if (err) return res.status(500).send({ err: err });
          if (data) {
            console.log("deleted");
          }
        }
      );

    s3.upload(params, async (err, data) => {
      if (err) {
        console.log("Error occured while trying to upload to S3 bucket", err);
        return res.status(500).send({ err: err });
      }

      if (data) {
        fs.unlinkSync(req.files[0].path); // Empty temp folder
        console.log(data);
        console.log(req.files[0]);
      }
    });

    req.body.image = url("Tour-Category", req.files[0].filename);
    let updated = await Category.findOneAndUpdate(
      { _id: categoryId },
      { $set: req.body },
      { new: true }
    );

    return res
      .status(200)
      .send({ category: updated, message: messages.en.updateSucces });
  }
}

async function Delete(req, res) {
  let categoryId = mongoose.Types.ObjectId(req.params.id);

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let category = await Category.findOneAndUpdate(
    { _id: categoryId, deleted: false },
    { $set: { deleted: true } },
    { new: true }
  );

  if (!category)
    return res.status(404).send({ message: messages.en.NoCategories });

  return res
    .status(200)
    .send({ category: category, message: messages.en.deleted });
}

module.exports = {
  AddCategory,
  GetCategories,
  GetCategoriesAdmin,
  Edit,
  Delete,
  GetCategoryById,
};
