const Vision = require("./Vision");
const messages = require("../../messages.json");
const CONF = require("../../constants");
const AWS = require("aws-sdk");
const fs = require("fs");

const url = (folder, picture) => {
  return `https://${CONF.AWS.BUCKET_NAME}.s3.amazonaws.com/${folder}/${picture}`;
};

async function createVision(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let params = {
    ACL: "public-read",
    Bucket: CONF.AWS.BUCKET_NAME,
    Body: fs.createReadStream(req.files[0].path),
    Key: `vision/${req.files[0].filename}`,
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

  console.log("Vision successfully created");
  req.body.image = url("vision", req.files[0].filename);
  req.body.vision_id = "1";

  const newVision = new Vision(req.body);
  await newVision.save();

  return res
    .status(200)
    .send({ newVision: newVision, message: messages.en.addSuccess });
}

async function getVision(req, res) {
  let vision;
  try {
    let query = { vision_id: "1" };
    vision = await Vision.findOne(query);

    if (vision)
      return res
        .status(200)
        .send({ vision: vision, message: messages.en.getSuccess });
    else return res.status(200).send({ vision: null, message: "No Vision" });
  } catch (error) {
    return res.status(500).send({ vision: null, message: error.message });
  }
}

async function editVision(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let vision = await Vision.findOne({ vision_id: "1" });

  if (!vision)
    return res
      .status(404)
      .send({ vision: null, message: messages.en.noRecords });

  if (req.files.length === 0) {
    let updated = await Vision.findOneAndUpdate(
      { vision_id: "1" },
      { $set: req.body },
      { new: true }
    );

    return res
      .status(200)
      .send({ vision: updated, message: messages.en.updateSucces });
  } else {
    let params = {
      ACL: "public-read",
      Bucket: CONF.AWS.BUCKET_NAME,
      Body: fs.createReadStream(req.files[0].path),
      Key: `vision/${req.files[0].filename}`,
    };

    AWS.config.setPromisesDependency();
    AWS.config.update({
      accessKeyId: CONF.AWS.ID,
      secretAccessKey: CONF.AWS.SECRET,
      region: CONF.AWS.REGION,
    });

    const s3 = new AWS.S3();

    if (vision.image)
      s3.deleteObject(
        {
          Bucket: CONF.AWS.BUCKET_NAME,
          Key: vision.image.split(".com/").pop(),
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

    req.body.image = url("vision", req.files[0].filename);

    let updated = await Vision.findOneAndUpdate(
      { vision_id: "1" },
      { $set: req.body },
      { new: true }
    );
    return res
      .status(200)
      .send({ vision: updated, message: messages.en.updateSucces });
  }
}

module.exports = {
  createVision,
  getVision,
  editVision,
};
