const messages = require("../../messages.json");
const mongoose = require("mongoose");
const { SearchHistory } = require("./Search");

async function getRecentSearchesForStays(req, res) {
  let userId = mongoose.Types.ObjectId(req.user._id);
  let data = [];

  let searchHistory = await SearchHistory.find({
    user: userId,
    tours: null,
    products: null,
  })
    .populate("area", "_id name")
    .select("area");

  if (searchHistory.length !== 0)
    searchHistory.forEach((item) => {
      data.push({
        name: item.area.name,
        _id: item.area._id,
      });
    });

  return res.status(200).send({
    searchHistory: data,
    message: messages.en.getSuccess,
  });
}

async function clearSearchHistory(req, res) {
  let userId = mongoose.Types.ObjectId(req.user._id);

  await SearchHistory.deleteMany({ user: userId });

  return res.status(200).send({ deleted: true, message: messages.en.deleted });
}

module.exports = { getRecentSearchesForStays, clearSearchHistory };
