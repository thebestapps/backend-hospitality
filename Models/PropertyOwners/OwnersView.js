const Owner = require("./Owner");
const messages = require("../../messages.json");

async function createOwner(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let newOwner = new Owner(req.body);

  await newOwner.save();
  return res
    .status(200)
    .send({ owner: newOwner, message: messages.en.addSuccess });
}

async function getOwners(req, res) {
  let owners = await Owner.find();

  return res
    .status(200)
    .send({ owners: owners, message: messages.en.getSuccess });
}

async function getOwnerById(req, res) {
  let owner = await Owner.findOne({ _id: req.params.id });

  if (!owner)
    return res
      .status(404)
      .send({ owner: null, message: messages.en.noRecords });

  return res
    .status(200)
    .send({ owner: owner, message: messages.en.getSuccess });
}

async function editOwner(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let owner = await Owner.findOne({ _id: req.params.id });

  if (!owner)
    return res
      .status(404)
      .send({ owner: null, message: messages.en.noRecords });

  let updated = await Owner.findOneAndUpdate(
    { _id: req.params.id },
    { $set: req.body },
    { new: true }
  );

  return res
    .status(200)
    .send({ owner: updated, message: messages.en.updateSucces });
}

async function deleteOwner(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let owner = await Owner.findOne({ _id: req.params.id });

  if (!owner)
    return res
      .status(404)
      .send({ owner: null, message: messages.en.noRecords });

  let deleted = await Owner.findOneAndDelete({ _id: req.params.id });

  return res.status(200).send({ owner: deleted, message: messages.en.deleted });
}

module.exports = {
  createOwner,
  getOwners,
  getOwnerById,
  editOwner,
  deleteOwner,
};
