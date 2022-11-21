const CheezTerms = require("./CheezTerms");
const messages = require("../../messages.json");
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

  let terms = await CheezTerms.findOne({ term_id: "1" });

  if (terms)
    return res
      .status(200)
      .send({ cheezTerms: terms, message: "Terms exist you can edit it" });

  let params = {
    ACL: "public-read",
    Bucket: CONF.AWS.BUCKET_NAME,
    Body: fs.createReadStream(req.files[0].path),
    Key: `terms/${req.files[0].filename}`,
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

  req.body.image = url("terms", req.files[0].filename);
  req.body.term_id = "1";

  let newCheezTerms = new CheezTerms(req.body);
  await newCheezTerms.save();

  return res
    .status(200)
    .send({ cheezTerms: newCheezTerms, message: messages.en.addSuccess });
}

async function getCheezTerms(req, res) {
  let cheezTerms = await CheezTerms.findOne({ term_id: "1" });

  if (!cheezTerms)
    return res
      .status(404)
      .send({ cheezTerms: null, message: messages.en.noRecords });

  return res
    .status(200)
    .send({ cheezTerms: cheezTerms, message: messages.en.getSuccess });
}

async function editCheezTerms(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let terms = await CheezTerms.findOne({ term_id: "1" });

  if (!terms)
    return res
      .status(404)
      .send({ terms: null, message: messages.en.noRecords });

  if (!req.files || req.files.length === 0) {
    let cheezTerms = await CheezTerms.findOneAndUpdate(
      { term_id: "1" },
      { $set: req.body },
      { new: true }
    );

    return res
      .status(200)
      .send({ cheezTerms: cheezTerms, message: messages.en.updateSucces });
  } else {
    let params = {
      ACL: "public-read",
      Bucket: CONF.AWS.BUCKET_NAME,
      Body: fs.createReadStream(req.files[0].path),
      Key: `terms/${req.files[0].filename}`,
    };

    AWS.config.setPromisesDependency();
    AWS.config.update({
      accessKeyId: CONF.AWS.ID,
      secretAccessKey: CONF.AWS.SECRET,
      region: CONF.AWS.REGION,
    });

    const s3 = new AWS.S3();

    if (terms.image)
      s3.deleteObject(
        {
          Bucket: CONF.AWS.BUCKET_NAME,
          Key: terms.image.split(".com/").pop(),
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

    req.body.image = url("terms", req.files[0].filename);

    let updated = await CheezTerms.findOneAndUpdate(
      { term_id: "1" },
      { $set: req.body },
      { new: true }
    );
    return res
      .status(200)
      .send({ terms: updated, message: messages.en.updateSucces });
  }
}

module.exports = { createCheezTerms, getCheezTerms, editCheezTerms };
