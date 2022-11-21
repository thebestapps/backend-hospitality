const { Rules } = require("./Rules");
const messages = require("../../messages.json");
const mongoose = require("mongoose");
const CONF = require("../../constants");
const AWS = require("aws-sdk");
const fs = require("fs");

const url = (folder, picture) => {
  return `https://${CONF.AWS.BUCKET_NAME}.s3.amazonaws.com/${folder}/${picture}`;
};

async function AddRules(req, res) {
  let { name } = req.body;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let params = {
    ACL: "public-read",
    Bucket: CONF.AWS.BUCKET_NAME,
    Body: fs.createReadStream(req.files[0].path),
    Key: `Rules/${req.files[0].filename}`,
  };

  AWS.config.setPromisesDependency();
  AWS.config.update({
    accessKeyId: CONF.AWS.ID,
    secretAccessKey: CONF.AWS.SECRET,
    region: CONF.AWS.REGION,
  });

  const s3 = new AWS.S3();

  let rules = await Rules.findOne({ name: name, deleted: false });

  if (!rules) {
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

    req.body.image = url("Rules", req.files[0].filename);
    let newRules = new Rules(req.body);
    await newRules.save();

    return res
      .status(200)
      .send({ rules: newRules, message: messages.en.addSuccess });
  }

  return res.status(400).send({ message: messages.en.exists });
}

async function GetRules(req, res) {
  let filter = { deleted: false };

  let rules = await Rules.find(filter).select("_id name image");

  if (rules.length === 0)
    return res
      .status(200)
      .send({ rules: rules, message: messages.en.noRecords });

  return res
    .status(200)
    .send({ rules: rules, message: messages.en.getSuccess });
}

async function GetRuleById(req, res) {
  let ruleId = req.params.id;

  let rules = await Rules.findOne({
    _id: mongoose.Types.ObjectId(ruleId),
  });
  if (!rules) return res.status(404).send({ message: messages.en.noRecords });

  return res
    .status(200)
    .send({ rules: rules, message: messages.en.getSuccess });
}

async function Edit(req, res) {
  let rulesId = mongoose.Types.ObjectId(req.params.id);
  let { enabled } = req.body;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let rules = await Rules.findOne({ _id: rulesId });

  if (!rules) return res.status(404).send({ message: messages.en.noRecords });

  if (enabled === "true") enabled = true;
  else enabled = false;

  if (req.files.length === 0) {
    let updated = await Rules.findOneAndUpdate(
      { _id: rulesId },
      { $set: req.body },
      { new: true }
    );

    return res
      .status(200)
      .send({ rules: updated, message: messages.en.updateSucces });
  } else {
    let params = {
      ACL: "public-read",
      Bucket: CONF.AWS.BUCKET_NAME,
      Body: fs.createReadStream(req.files[0].path),
      Key: `Rules/${req.files[0].filename}`,
    };

    AWS.config.setPromisesDependency();
    AWS.config.update({
      accessKeyId: CONF.AWS.ID,
      secretAccessKey: CONF.AWS.SECRET,
      region: CONF.AWS.REGION,
    });

    const s3 = new AWS.S3();

    if (rules.image)
      s3.deleteObject(
        {
          Bucket: CONF.AWS.BUCKET_NAME,
          Key: rules.image.split(".com/").pop(),
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

    req.body.image = url("Rules", req.files[0].filename);

    let updated = await Rules.findOneAndUpdate(
      { _id: rulesId },
      { $set: req.body },
      { new: true }
    );

    return res
      .status(200)
      .send({ rules: updated, message: messages.en.updateSucces });
  }
}

async function Delete(req, res) {
  let rulesId = mongoose.Types.ObjectId(req.params.id);

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let rules = await Rules.findOneAndUpdate(
    { _id: rulesId },
    { $set: { deleted: true, enabled: false } },
    { new: true }
  );

  if (!rules) return res.status(404).send({ message: messages.en.noRecords });

  return res.status(200).send({ rules: rules, message: messages.en.deleted });
}

module.exports = { AddRules, GetRules, GetRuleById, Edit, Delete };
