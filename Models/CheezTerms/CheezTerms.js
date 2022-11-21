const mongoose = require("mongoose");

const CheezTermsSchema = new mongoose.Schema(
  {
    terms: { type: String, required: true },
    term_id: { type: String, required: true },
    image: { type: String, required: true },
  },
  { timestamps: true }
);

CheezTermsSchema.methods.setCheezTerms = function (cheezTerms) {
  this.section = cheezTerms.section;
  this.content = cheezTerms.content;
};

const CheezTerms = mongoose.model("cheezTerms", CheezTermsSchema, "cheezTerms");
module.exports = CheezTerms;
