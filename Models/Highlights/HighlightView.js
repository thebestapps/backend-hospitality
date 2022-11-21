const { Highlight } = require("./Highlight");
const messages = require("../../messages.json");
const mongoose = require("mongoose");
const CONF = require("../../constants");
const AWS = require("aws-sdk");
const fs = require("fs");

const url = (folder, picture) => {
  return `https://${CONF.AWS.BUCKET_NAME}.s3.amazonaws.com/${folder}/${picture}`;
};

async function AddHighlight(req, res) {
  let { name } = req.body;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let highlight = await Highlight.findOne({ name: name });

  let params = {
    ACL: "public-read",
    Bucket: CONF.AWS.BUCKET_NAME,
    Body: fs.createReadStream(req.files[0].path),
    Key: `highlight/${req.files[0].filename}`,
  };

  AWS.config.setPromisesDependency();
  AWS.config.update({
    accessKeyId: CONF.AWS.ID,
    secretAccessKey: CONF.AWS.SECRET,
    region: CONF.AWS.REGION,
  });

  const s3 = new AWS.S3();

  if (!highlight || highlight.deleted) {
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

    req.body.image = url("highlight", req.files[0].filename);

    highlight = new Highlight(req.body);
    await highlight.save();

    return res
      .status(200)
      .send({ highlight: highlight, message: messages.en.addSuccess });
  }

  return res.status(400).send({ message: messages.en.exists });
}

async function GetHighlight(req, res) {
  let highlight = await Highlight.find({ deleted: false });

  if (highlight.length === 0)
    return res
      .status(200)
      .send({ highlight: highlight, message: messages.en.noRecords });

  return res
    .status(200)
    .send({ highlight: highlight, message: messages.en.getSuccess });
}

async function GetHighlightById(req, res) {
  let highlightId = req.params.id;

  let highlight = await Highlight.findOne({
    _id: mongoose.Types.ObjectId(highlightId),
  });
  if (!highlight)
    return res.status(404).send({ message: messages.en.noRecords });

  return res
    .status(200)
    .send({ highlight: highlight, message: messages.en.getSuccess });
}

async function Edit(req, res) {
  let highlightId = req.params.id;
  let { enabled } = req.body;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  highlightId = mongoose.Types.ObjectId(highlightId);

  let highlight = await Highlight.findOne({ _id: highlightId });

  if (!highlight)
    return res.status(404).send({ message: messages.en.noRecords });

  if (!req.files || req.files.length === 0) {
    let updated = await Highlight.findOneAndUpdate(
      { _id: highlightId },
      { $set: req.body },
      { new: true }
    );
  } else {
    let params = {
      ACL: "public-read",
      Bucket: CONF.AWS.BUCKET_NAME,
      Body: fs.createReadStream(req.files[0].path),
      Key: `highlight/${req.files[0].filename}`,
    };

    AWS.config.setPromisesDependency();
    AWS.config.update({
      accessKeyId: CONF.AWS.ID,
      secretAccessKey: CONF.AWS.SECRET,
      region: CONF.AWS.REGION,
    });

    const s3 = new AWS.S3();

    if (highlight.image)
      s3.deleteObject(
        {
          Bucket: CONF.AWS.BUCKET_NAME,
          Key: highlight.image.split(".com/").pop(),
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

    req.body.image = url("highlight", req.files[0].filename);

    let updated = await Highlight.findOneAndUpdate(
      { _id: highlightId },
      { $set: req.body },
      { new: true }
    );

    return res
      .status(200)
      .send({ highlight: updated, message: messages.en.updateSucces });
  }
}

async function Delete(req, res) {
  let highlightId = req.params.id;

  highlightId = mongoose.Types.ObjectId(highlightId);

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let highlight = await Highlight.findOneAndUpdate(
    { _id: highlightId },
    { $set: { deleted: true, enabled: false } },
    { new: true }
  );

  if (!highlight)
    return res.status(404).send({ message: messages.en.noRecords });

  return res
    .status(200)
    .send({ highlight: highlight, message: messages.en.deleted });
}

module.exports = {
  AddHighlight,
  GetHighlight,
  GetHighlightById,
  Edit,
  Delete,
};
