const { Bath } = require("./Bathrooms");
const messages = require("../../messages.json");
const mongoose = require("mongoose");

async function AddBathType(req, res) {
  let { name } = req.body;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let bath = await Bath.findOne({ name: name, deleted: false });

  if (!bath) {
    bath = new Bath(req.body);
    await bath.save();

    return res
      .status(200)
      .send({ bath: bath, message: messages.en.addSuccess });
  }

  return res.status(200).send({ bath: bath, message: messages.en.exist });
}

async function GetBathTypes(req, res) {
  let bath = await Bath.find({ deleted: false }).select("_id name enabled");

  if (bath.length === 0)
    return res.status(200).send({ bath: [], messages: messages.en.noRecords });

  return res.status(200).send({ bath: bath, messages: messages.en.getSuccess });
}

async function GetBathTypesById(req, res) {
  let bathTypeId = req.params.id;
  bathTypeId = mongoose.Types.ObjectId(bathTypeId);

  let bath = await Bath.findOne({ _id: bathTypeId }).select("_id name enabled");

  if (!bath)
    return res.status(404).send({ bath: null, message: messages.en.noRecords });

  return res.status(200).send({ bath: bath, message: messages.en.getSuccess });
}

async function EditBathroom(req, res) {
  let bathTypeId = req.params.id;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  bathTypeId = mongoose.Types.ObjectId(bathTypeId);

  let bath = await Bath.findOneAndUpdate(
    { _id: bathTypeId },
    { $set: req.body },
    { new: true }
  );

  if (!bath)
    return res.status(404).send({ bath: null, message: messages.en.noRecords });

  return res
    .status(200)
    .send({ bath: bath, message: messages.en.updateSucces });
}

async function deleteBathroom(req, res) {
  let bathTypeId = req.params.id;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  bathTypeId = mongoose.Types.ObjectId(bathTypeId);

  let bath = await Bath.findOneAndUpdate(
    { _id: bathTypeId },
    { $set: { deleted: true } },
    { new: true }
  );

  if (!bath)
    return res.status(404).send({ bath: null, message: messages.en.noRecords });

  return res.status(200).send({ bath: bath, message: messages.en.deleted });
}

module.exports = {
  AddBathType,
  GetBathTypes,
  GetBathTypesById,
  EditBathroom,
  deleteBathroom,
};
