const Details = require("./ContactDetails");
const messages = require("../../messages.json");

async function createDetails(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  const details = await Details.findOne({ id: "1" });

  if (details)
    return res
      .status(201)
      .send({ details: details, message: messages.en.exist });

  req.body.id = "1";
  const newDetails = new Details(req.body);
  await newDetails.save();

  return res
    .status(200)
    .send({ details: newDetails, message: messages.en.addSuccess });
}

async function getDetails(req, res) {
  const details = await Details.findOne({ id: "1" });

  if (!details)
    return res
      .status(200)
      .send({ details: null, message: messages.en.noRecords });

  return res
    .status(200)
    .send({ details: details, message: messages.en.noRecords });
}

async function ediDetails(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  const details = await Details.findOne({ id: "1" });

  if (!details)
    return res
      .status(404)
      .send({ details: null, message: messages.en.noRecords });

  let updated = await Details.findOneAndUpdate(
    { id: "1" },
    { $set: req.body },
    { new: true }
  );

  return res
    .status(200)
    .send({ details: updated, message: messages.en.updated });
}

async function deleteDetials(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  const details = await Details.findOne({ id: "1" });

  if (!details)
    return res
      .status(404)
      .send({ details: null, message: messages.en.noRecords });

  let deleted = await Details.findOneAndDelete({ id: "1" });

  return res
    .status(200)
    .send({ details: deleted, message: messages.en.deleted });
}

module.exports = { createDetails, getDetails, ediDetails, deleteDetials };
