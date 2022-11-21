const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema(
  {
    name: { type: String },
    image: { type: String },
    desc: { type: String },
    dialog: { type: String },
  },
  { timestamps: true }
);

const Company = mongoose.model("company", CompanySchema, "company");
module.exports = Company;
