const mongoose = require("mongoose");

const PrivacyPolicySchema = new mongoose.Schema(
  {
    policy: { type: String, required: true },
    policy_id: { type: String, required: true },
    image: { type: String, required: true },
  },
  { timestamps: true }
);

const CheezTerms = mongoose.model(
  "privacyPolicy",
  PrivacyPolicySchema,
  "privacyPolicy"
);
module.exports = CheezTerms;
