const Version = require("./Version");
const messages = require("../../messages.json");
const { response } = require("express");

async function addVersionIos(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let version = await Version.findOne({ id: "1" });

  if (!version) {
    let newVersion = new Version({
      id: "1",
      version: req.body.version,
      urgent: req.body.urgent,
      platform: "ios",
      downloadLink: req.body.downloadLink,
    });

    await newVersion.save();

    return res
      .status(200)
      .send({ version: newVersion, message: messages.en.addSuccess });
  }
  return res.status(200).send({
    version: version,
    message: "You can only edit the version after it's benn added",
  });
}

async function addVersionAndroid(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let version = await Version.findOne({ id: "2" });

  if (!version) {
    let newVersion = new Version({
      id: "2",
      version: req.body.version,
      urgent: req.body.urgent,
      platform: "android",
      downloadLink: req.body.downloadLink,
    });

    await newVersion.save();

    return res
      .status(200)
      .send({ version: newVersion, message: messages.en.addSuccess });
  }
  return res.status(200).send({
    version: version,
    message: "You can only edit the version after it's benn added",
  });
}

async function getVersionIos(req, res) {
  let version = await Version.findOne({ id: "1" });

  if (!version)
    return res.status(404).send({
      version: null,
      message: messages.en.noRecords,
    });

  return res
    .status(200)
    .send({ version: version, message: messages.en.addSuccess });
}

async function getVersionAndroid(req, res) {
  let version = await Version.findOne({ id: "2" });

  if (!version)
    return res.status(404).send({
      version: null,
      message: messages.en.noRecords,
    });

  return res
    .status(200)
    .send({ version: version, message: messages.en.addSuccess });
}

async function getVersion(req, res) {
  let response = { ios: null, android: null };

  let ios = await Version.findOne({ id: "1" });

  if (ios) response.ios = ios;

  let android = await Version.findOne({ id: "2" });

  if (android) response.android = android;

  return res
    .status(200)
    .send({ version: response, message: messages.en.getSuccess });
}

async function editVersionIos(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let version = await Version.findOne({ id: "1" });

  if (!version)
    return res.status(404).send({
      version: null,
      message: messages.en.noRecords,
    });

  let updated = await Version.findOneAndUpdate(
    { id: "1" },
    { $set: req.body },
    { new: true }
  );

  return res
    .status(200)
    .send({ version: updated, message: messages.en.updateSucces });
}

async function editVersionAndroid(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let version = await Version.findOne({ id: "2" });

  if (!version)
    return res.status(404).send({
      version: null,
      message: messages.en.noRecords,
    });

  let updated = await Version.findOneAndUpdate(
    { id: "2" },
    { $set: req.body },
    { new: true }
  );

  return res
    .status(200)
    .send({ version: updated, message: messages.en.updateSucces });
}

module.exports = {
  addVersionIos,
  addVersionAndroid,
  getVersion,
  getVersionIos,
  getVersionAndroid,
  editVersionIos,
  editVersionAndroid,
};
