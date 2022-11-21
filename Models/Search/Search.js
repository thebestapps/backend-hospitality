const mongoose = require("mongoose");

const searchHistory = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: "users" },
    area: { type: mongoose.Types.ObjectId, ref: "areas", default: null },
  },
  { timestamps: true }
);

const SearchHistory = mongoose.model(
  "searchHistory",
  searchHistory,
  "searchHistory"
);

exports.SearchHistory = SearchHistory;
