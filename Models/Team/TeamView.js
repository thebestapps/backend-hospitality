const Team = require("./Team");
const messages = require("../../messages.json");
const CONF = require("../../constants");
const AWS = require("aws-sdk");
const fs = require("fs");

const url = (folder, picture) => {
  return `https://${CONF.AWS.BUCKET_NAME}.s3.amazonaws.com/${folder}/${picture}`;
};

async function createTeamMember(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let params = {
    ACL: "public-read",
    Bucket: CONF.AWS.BUCKET_NAME,
    Body: fs.createReadStream(req.files[0].path),
    Key: `Team/${req.files[0].filename}`,
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

  req.body.image = url("Team", req.files[0].filename);
  let newTeam = new Team(req.body);

  await newTeam.save();

  let all = await Team.find({
    deleted: false,
    _id: { $ne: newTeam._id },
  });

  all.forEach(async (member) => {
    let updated = await Team.findOneAndUpdate(
      { _id: member._id },
      { $inc: { order: 1 } },
      { new: true }
    );

    await updated.save();
  });

  return res
    .status(200)
    .send({ newTeam: newTeam, message: messages.en.addSuccess });
}

async function getTeam(req, res) {
  let teamMember;
  let team;
  try {
    if (req.params.id) {
      let query = { _id: req.params.id, deleted: false };
      teamMember = await Team.findOne(query);

      if (!teamMember)
        return res
          .status(404)
          .send({ teamMember: null, message: messages.en.noRecords });

      return res
        .status(200)
        .send({ teamMember: teamMember, message: messages.en.getSuccess });
    }
    team = await Team.find({ deleted: false }).sort("order");
    return res.status(200).send({ team, message: messages.en.getSuccess });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
}

async function editTeamMember(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let teamMember = await Team.findOne({ _id: req.params.id, deleted: false });

  if (!teamMember)
    return res
      .status(404)
      .send({ teamMember: null, message: messages.en.noRecords });

  if (req.files.length === 0) {
    let updated = await Team.findOneAndUpdate(
      { _id: req.params.id, deleted: false },
      { $set: req.body },
      { new: true }
    );
    return res
      .status(200)
      .send({ teamMember: updated, message: messages.en.updateSucces });
  } else {
    let params = {
      ACL: "public-read",
      Bucket: CONF.AWS.BUCKET_NAME,
      Body: fs.createReadStream(req.files[0].path),
      Key: `Team/${req.files[0].filename}`,
    };

    AWS.config.setPromisesDependency();
    AWS.config.update({
      accessKeyId: CONF.AWS.ID,
      secretAccessKey: CONF.AWS.SECRET,
      region: CONF.AWS.REGION,
    });

    const s3 = new AWS.S3();

    if (teamMember.image)
      s3.deleteObject(
        {
          Bucket: CONF.AWS.BUCKET_NAME,
          Key: teamMember.image.split(".com/").pop(),
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

    req.body.image = url("Team", req.files[0].filename);

    let updated = await Team.findOneAndUpdate(
      { _id: req.params.id },
      { $set: req.body },
      { new: true }
    );

    return res
      .status(200)
      .send({ teamMember: updated, message: messages.en.updateSucces });
  }
}

async function deleteTeamMember(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let teamMember = await Team.findOne({ _id: req.params.id, deleted: false });

  if (!teamMember)
    return res
      .status(404)
      .send({ teamMember: null, message: messages.en.noRecords });

  AWS.config.setPromisesDependency();
  AWS.config.update({
    accessKeyId: CONF.AWS.ID,
    secretAccessKey: CONF.AWS.SECRET,
    region: CONF.AWS.REGION,
  });

  const s3 = new AWS.S3();

  s3.deleteObject(
    {
      Bucket: CONF.AWS.BUCKET_NAME,
      Key: teamMember.image.split(".com/").pop(),
    },
    async (data, err) => {
      if (err) return res.status(500).send({ err: err });
      if (data) {
      }
    }
  );

  let deleted = await Team.findOneAndDelete({
    _id: req.params.id,
  });

  return res
    .status(200)
    .send({ teamMember: deleted, message: messages.en.deleted });
}

async function orderTeam(req, res) {
  let { team } = req.body;

  team.forEach(async (member) => {
    let updated = await Team.findOneAndUpdate(
      { _id: member._id },
      { $set: { order: member.order } },
      { new: true }
    );

    await updated.save();
  });

  let result = await Team.find({ deleted: false }).sort("order");

  return res
    .status(200)
    .send({ team: result, message: messages.en.updateSucces });
}

module.exports = {
  createTeamMember,
  getTeam,
  editTeamMember,
  deleteTeamMember,
  orderTeam,
};
