const PrivacyPolicy = require("./Privacypolicy");
const messages = require("../../messages.json");
const mongoose = require("mongoose");
const CONF = require("../../constants");
const AWS = require("aws-sdk");
const fs = require("fs");

const url = (folder, picture) => {
  return `https://${CONF.AWS.BUCKET_NAME}.s3.amazonaws.com/${folder}/${picture}`;
};

async function createCheezTerms(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let params = {
    ACL: "public-read",
    Bucket: CONF.AWS.BUCKET_NAME,
    Body: fs.createReadStream(req.files[0].path),
    Key: `policy/${req.files[0].filename}`,
  };

  AWS.config.setPromisesDependency();
  AWS.config.update({
    accessKeyId: CONF.AWS.ID,
    secretAccessKey: CONF.AWS.SECRET,
    region: CONF.AWS.REGION,
  });

  const s3 = new AWS.S3();

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

  req.body.image = url("policy", req.files[0].filename);

  const newPrivcyPolicy = new PrivacyPolicy(req.body);
  await newPrivcyPolicy.save();

  return res
    .status(200)
    .send({ newPrivcyPolicy: req.body, message: messages.en.addSuccess });
}

async function getPrivacyPolicy(req, res) {
  let privacyPolicy;

  privacyPolicy = await PrivacyPolicy.findOne({ policy_id: "1" });
  return res
    .status(200)
    .send({ privacyPolicy: privacyPolicy, message: messages.en.getSuccess });
}

async function editPrivacyPolicy(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let policy = await PrivacyPolicy.findOne({ policy_id: "1" });

  if (!policy)
    return res
      .status(404)
      .send({ policy: null, message: messages.en.noRecords });

  if (req.files.length === 0) {
    let updated = await PrivacyPolicy.findOneAndUpdate(
      { policy_id: "1" },
      { $set: req.body },
      { new: true }
    );
    return res
      .status(200)
      .send({ policy: updated, message: messages.en.updateSucces });
  } else {
    let params = {
      ACL: "public-read",
      Bucket: CONF.AWS.BUCKET_NAME,
      Body: fs.createReadStream(req.files[0].path),
      Key: `policy/${req.files[0].filename}`,
    };

    AWS.config.setPromisesDependency();
    AWS.config.update({
      accessKeyId: CONF.AWS.ID,
      secretAccessKey: CONF.AWS.SECRET,
      region: CONF.AWS.REGION,
    });

    const s3 = new AWS.S3();

    if (policy.image)
      s3.deleteObject(
        {
          Bucket: CONF.AWS.BUCKET_NAME,
          Key: policy.image.split(".com/").pop(),
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
        req.body.image = data.Location;
      }
    });

    req.body.image = url("policy", req.files[0].filename);

    let updated = await PrivacyPolicy.findOneAndUpdate(
      { policy_id: "1" },
      { $set: req.body },
      { new: true }
    );
    return res
      .status(200)
      .send({ policy: updated, message: messages.en.updateSucces });
  }
}

module.exports = {
  createCheezTerms,
  getPrivacyPolicy,
  editPrivacyPolicy,
};
