const Career = require("./Career");
const mongoose = require("mongoose");
const messages = require("../../messages.json");

async function createCareer(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  const newCareer = new Career(req.body);
  await newCareer.save();

  console.log("Career successfully created");
  return res
    .status(200)
    .send({ newCareer: newCareer, message: messages.en.addSuccess });
}

async function getCareers(req, res) {
  let careers;
  let career;
  try {
    if (req.params.id) {
      career = await Career.findOne({
        _id: mongoose.Types.ObjectId(req.params.id),
      }).populate({
        path: "city",
        populate: {
          path: "country",
        },
      });

      if (!career)
        return res
          .status(404)
          .send({ career: null, message: messages.en.noRecords });

      return res
        .status(200)
        .send({ career: career, message: messages.en.getSuccess });
    } else {
      careers = await Career.find({}).populate({
        path: "city",
        select: "_id name country",
        populate: {
          path: "country",
          select: "_id name",
        },
      });
      return res
        .status(200)
        .send({ careers: careers, message: messages.en.getSuccess });
    }
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
}

async function editCareer(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let career = await Career.findOne({ _id: req.params.id });
  if (!career) {
    console.log("ERROR -- Career not found");

    return res
      .status(404)
      .send({ career: null, message: messages.en.noRecords });
  }

  let updated = await Career.findOneAndUpdate(
    { _id: req.params.id },
    { $set: req.body },
    { new: true }
  );

  return res
    .status(200)
    .send({ career: updated, message: messages.en.updateSucces });
}

async function deleteCareer(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let career = await Career.findOne({ _id: req.params.id });
  if (!career) {
    return res
      .status(404)
      .send({ career: null, message: messages.en.noRecords });
  }

  let deleted = await Career.findOneAndDelete({ _id: req.params.id });
  return res
    .status(200)
    .send({ career: deleted, message: messages.en.deleted });
}

module.exports = { createCareer, getCareers, editCareer, deleteCareer };
