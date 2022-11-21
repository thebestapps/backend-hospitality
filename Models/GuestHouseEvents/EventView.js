const { Events } = require("./Events");
const messages = require("../../messages.json");
const mongoose = require("mongoose");
const CONF = require("../../constants");
const AWS = require("aws-sdk");
const fs = require("fs");

const url = (folder, picture) => {
  return `https://${CONF.AWS.BUCKET_NAME}.s3.amazonaws.com/${folder}/${picture}`;
};

async function AddEvent(req, res) {
  let { name } = req.body;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let params = {
    ACL: "public-read",
    Bucket: CONF.AWS.BUCKET_NAME,
    Body: fs.createReadStream(req.files[0].path),
    Key: `Events/${req.files[0].filename}`,
  };

  AWS.config.setPromisesDependency();
  AWS.config.update({
    accessKeyId: CONF.AWS.ID,
    secretAccessKey: CONF.AWS.SECRET,
    region: CONF.AWS.REGION,
  });

  const s3 = new AWS.S3();

  let events = await Events.findOne({ name: name, deleted: false });

  if (!events) {
    s3.upload(params, async (err, data) => {
      if (err) {
        console.log("Error occured while trying to upload to S3 bucket", err);
        return res.status(500).send({ err: err });
      }

      if (data) {
        fs.unlinkSync(req.files[0].path); // Empty temp folder
        console.log(data);
        console.log(req.files[0]);
      }
    });

    req.body.image = url("Events", req.files[0].filename);
    let newEvent = new Events(req.body);
    await newEvent.save();

    return res
      .status(200)
      .send({ event: newEvent, message: messages.en.addSuccess });
  }

  return res.status(400).send({ message: messages.en.exists });
}
async function GetEvent(req, res) {
  let filter = { deleted: false };

  let events = await Events.find(filter).select("_id name image");

  if (events.length === 0)
    return res
      .status(200)
      .send({ events: events, message: messages.en.noRecords });

  return res
    .status(200)
    .send({ events: events, message: messages.en.getSuccess });
}

async function GetEventById(req, res) {
  let eventId = req.params.id;

  let event = await Events.findOne({
    _id: mongoose.Types.ObjectId(eventId),
  });
  if (!event) return res.status(404).send({ message: messages.en.noRecords });

  return res
    .status(200)
    .send({ event: event, message: messages.en.getSuccess });
}

async function Edit(req, res) {
  let eventId = mongoose.Types.ObjectId(req.params.id);
  let { enabled } = req.body;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let event = await Events.findOne({ _id: eventId });

  if (!event) return res.status(404).send({ message: messages.en.noRecords });

  if (enabled === "true") enabled = true;
  else enabled = false;

  if (req.files.length === 0) {
    let updated = await Events.findOneAndUpdate(
      { _id: eventId },
      { $set: req.body },
      { new: true }
    );

    return res
      .status(200)
      .send({ event: updated, message: messages.en.updateSucces });
  } else {
    let params = {
      ACL: "public-read",
      Bucket: CONF.AWS.BUCKET_NAME,
      Body: fs.createReadStream(req.files[0].path),
      Key: `Events/${req.files[0].filename}`,
    };

    AWS.config.setPromisesDependency();
    AWS.config.update({
      accessKeyId: CONF.AWS.ID,
      secretAccessKey: CONF.AWS.SECRET,
      region: CONF.AWS.REGION,
    });

    const s3 = new AWS.S3();

    if (event.image)
      s3.deleteObject(
        {
          Bucket: CONF.AWS.BUCKET_NAME,
          Key: amenities.image.split(".com/").pop(),
        },
        async (data, err) => {
          if (err) return res.status(500).send({ err: err });
          if (data) {
            console.log("deleted");
          }
        }
      );

    s3.upload(params, async (err, data) => {
      if (err) {
        console.log("Error occured while trying to upload to S3 bucket", err);
        return res.status(500).send({ err: err });
      }

      if (data) {
        fs.unlinkSync(req.files[0].path); // Empty temp folder
        console.log(data);
        console.log(req.files[0]);
      }
    });

    req.body.image = url("Events", req.files[0].filename);

    let updated = await Events.findOneAndUpdate(
      { _id: eventId },
      { $set: req.body },
      { new: true }
    );

    return res
      .status(200)
      .send({ event: updated, message: messages.en.updateSucces });
  }
}

async function Delete(req, res) {
  let eventId = mongoose.Types.ObjectId(req.params.id);

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let event = await Events.findOneAndUpdate(
    { _id: eventId },
    { $set: { deleted: true, enabled: false } },
    { new: true }
  );

  if (!event) return res.status(404).send({ message: messages.en.noRecords });

  return res.status(200).send({ event: event, message: messages.en.deleted });
}

module.exports = { AddEvent, GetEvent, GetEventById, Edit, Delete };
