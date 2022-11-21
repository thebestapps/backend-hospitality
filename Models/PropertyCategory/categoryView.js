const { Category } = require("./Category");
const messages = require("../../messages.json");
const mongoose = require("mongoose");

async function AddCategory(req, res) {
  let { name } = req.body;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let category = await Category.findOne({ name: name });

  if (!category) {
    category = new Category(req.body);
    await category.save();

    return res
      .status(200)
      .send({ category: category, message: messages.en.categorySuccess });
  }

  return res.status(400).send({ message: messages.en.categoryExist });
}

async function GetCategories(req, res) {
  let categories = await Category.find({ deleted: false }).select(
    "_id name enabled"
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
  let categoryId = req.params.id;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  categoryId = mongoose.Types.ObjectId(categoryId);

  let category = await Category.findOneAndUpdate(
    { _id: categoryId, deleted: false },
    { $set: req.body },
    { new: true }
  );

  if (!category)
    return res.status(404).send({ message: messages.en.NoCategories });

  return res
    .status(200)
    .send({ category: category, message: messages.en.updateSucces });
}

async function Delete(req, res) {
  let categoryId = req.params.id;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  categoryId = mongoose.Types.ObjectId(categoryId);

  let category = await Category.findOneAndUpdate(
    { _id: categoryId, deleted: false },
    { $set: { deleted: true } },
    { new: true }
  );

  if (!category)
    return res.status(404).send({ message: messages.en.NoCategories });

  return res
    .status(200)
    .send({ category: category, message: messages.en.updateSucces });
}

module.exports = { AddCategory, GetCategories, Edit, Delete, GetCategoryById };
