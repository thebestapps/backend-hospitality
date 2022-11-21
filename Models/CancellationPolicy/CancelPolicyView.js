const { policis } = require("./CancelPolicy");
const messages = require("../../messages.json");

async function GetPolicis(req, res) {
  return res
    .status(200)
    .send({ policis: policis, message: messages.en.getSuccess });
}

async function GetPolicyById(req, res) {
  let policyId = req.params.id;

  let policy = policis.find((item) => item._id.equals(policyId));

  if (!policy)
    return res
      .status(404)
      .send({ policy: null, message: messages.en.noRecords });

  return res
    .status(404)
    .send({ policy: policy, message: messages.en.getSuccess });
}

module.exports = {
  GetPolicis,
  GetPolicyById,
};
