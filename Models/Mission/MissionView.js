const Mission = require("./Mission");
const messages = require("../../messages.json");
const CONF = require("../../constants");
const AWS = require("aws-sdk");
const fs = require("fs");

const url = (folder, picture) => {
  return `https://${CONF.AWS.BUCKET_NAME}.s3.amazonaws.com/${folder}/${picture}`;
};

async function createMission(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let params = {
    ACL: "public-read",
    Bucket: CONF.AWS.BUCKET_NAME,
    Body: fs.createReadStream(req.files[0].path),
    Key: `mission/${req.files[0].filename}`,
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

  req.body.image = url("mission", req.files[0].filename);
  req.body.mission_id = "1";

  const newMission = new Mission(req.body);
  await newMission.save();

  console.log("Mission successfully created");
  return res
    .status(200)
    .send({ newMission: newMission, message: messages.en.addSuccess });
}

async function getMission(req, res) {
  let mission;
  try {
    let query = { mission_id: "1" };
    mission = await Mission.findOne(query);

    if (mission)
      return res
        .status(200)
        .send({ mission: mission, message: messages.en.getSuccess });
    else return res.status(200).send({ mission: null, message: "No mission" });
  } catch (error) {
    return res.status(500).send({ mission: null, message: error.message });
  }
}

async function editMission(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let mission = await Mission.findOne({ mission_id: "1" });

  if (!mission)
    return res
      .status(404)
      .send({ mission: null, message: messages.en.noRecords });

  if (req.files.length === 0) {
    let updated = await Mission.findOneAndUpdate(
      { mission_id: "1" },
      { $set: req.body },
      { new: true }
    );
    return res
      .status(200)
      .send({ mission: updated, message: messages.en.updateSucces });
  } else {
    let params = {
      ACL: "public-read",
      Bucket: CONF.AWS.BUCKET_NAME,
      Body: fs.createReadStream(req.files[0].path),
      Key: `mission/${req.files[0].filename}`,
    };

    AWS.config.setPromisesDependency();
    AWS.config.update({
      accessKeyId: CONF.AWS.ID,
      secretAccessKey: CONF.AWS.SECRET,
      region: CONF.AWS.REGION,
    });

    const s3 = new AWS.S3();

    if (mission.image)
      s3.deleteObject(
        {
          Bucket: CONF.AWS.BUCKET_NAME,
          Key: mission.image.split(".com/").pop(),
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

    req.body.image = url("mission", req.files[0].filename);

    let updated = await Mission.findOneAndUpdate(
      { mission_id: "1" },
      { $set: req.body },
      { new: true }
    );
    return res
      .status(200)
      .send({ mission: updated, message: messages.en.updateSucces });
  }
}

module.exports = {
  createMission,
  getMission,
  editMission,
};
