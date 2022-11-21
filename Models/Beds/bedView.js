const { Beds } = require("./Beds");
const messages = require("../../messages.json");
const mongoose = require("mongoose");

async function AddBedType(req, res) {
  let { name } = req.body;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let bed = await Beds.findOne({ name: name, deleted: false });

  if (!bed) {
    bed = new Beds(req.body);
    await bed.save();

    return res.status(200).send({ bed: bed, message: messages.en.addSuccess });
  }

  return res.status(200).send({ bed: bed, message: messages.en.exist });
}

async function GetBedsTypes(req, res) {
  let beds = await Beds.find({ deleted: false }).select("_id name enabled");

  if (beds.length === 0)
    return res.status(200).send({ beds: [], messages: messages.en.noRecords });

  return res.status(200).send({ beds: beds, messages: messages.en.getSuccess });
}

async function GetBedsTypesById(req, res) {
  let bedTypeId = req.params.id;
  bedTypeId = mongoose.Types.ObjectId(bedTypeId);

  let bed = await Beds.findOne({ _id: bedTypeId }).select("_id name enabled");

  if (!bed)
    return res.status(404).send({ bed: null, message: messages.en.noRecords });

  return res.status(200).send({ bed: bed, message: messages.en.getSuccess });
}

async function EditBeds(req, res) {
  let bedTypeId = req.params.id;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  bedTypeId = mongoose.Types.ObjectId(bedTypeId);

  let bed = await Beds.findOneAndUpdate(
    { _id: bedTypeId },
    { $set: req.body },
    { new: true }
  );

  if (!bed)
    return res.status(404).send({ bed: null, message: messages.en.noRecords });

  return res.status(200).send({ bed: bed, message: messages.en.updateSucces });
}

async function deleteBed(req, res) {
  let bedTypeId = req.params.id;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  bedTypeId = mongoose.Types.ObjectId(bedTypeId);

  let bed = await Beds.findOneAndUpdate(
    { _id: bedTypeId },
    { $set: { deleted: true } },
    { new: true }
  );

  if (!bed)
    return res.status(404).send({ bed: null, message: messages.en.noRecords });

  return res.status(200).send({ bed: bed, message: messages.en.deleted });
}

module.exports = {
  AddBedType,
  GetBedsTypes,
  GetBedsTypesById,
  EditBeds,
  deleteBed,
};
