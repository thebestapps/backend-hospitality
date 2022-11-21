const mongoose = require("mongoose");

const rulesSchema = new mongoose.Schema(
  {
    name: { type: String, requierd: true },
    image: { type: String, default: null, requierd: true },
    enabled: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Rules = mongoose.model("rules", rulesSchema, "rules");
exports.Rules = Rules;
