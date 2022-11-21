const Story = require("./Story");
const messages = require("../../messages.json");
const CONF = require("../../constants");
const AWS = require("aws-sdk");
const fs = require("fs");

const url = (folder, picture) => {
  return `https://${CONF.AWS.BUCKET_NAME}.s3.amazonaws.com/${folder}/${picture}`;
};

async function createStory(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let params = {
    ACL: "public-read",
    Bucket: CONF.AWS.BUCKET_NAME,
    Body: fs.createReadStream(req.files[0].path),
    Key: `story/${req.files[0].filename}`,
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

  req.body.image = url("story", req.files[0].filename);
  req.body.story_id = "1";

  const newStory = new Story(req.body);
  await newStory.save();

  console.log("Story successfully created");
  return res
    .status(200)
    .send({ newStory: req.body, message: messages.en.addSuccess });
}

async function getStory(req, res) {
  let story;
  try {
    let query = { story_id: "1" };
    story = await Story.findOne(query);

    if (story)
      return res
        .status(200)
        .send({ story: story, message: messages.en.getSuccess });
    else return res.status(200).send({ story: null, message: "No story" });
  } catch (error) {
    return res.status(500).send({ story: null, message: error.message });
  }
}

async function editStory(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let story = await Story.findOne({ story_id: "1" });

  if (!story)
    return res
      .status(404)
      .send({ story: null, message: messages.en.noRecords });

  if (req.files.length === 0) {
    let updated = await Story.findOneAndUpdate(
      { story_id: "1" },
      { $set: req.body },
      { new: true }
    );
    return res
      .status(200)
      .send({ story: updated, message: messages.en.updateSucces });
  } else {
    let params = {
      ACL: "public-read",
      Bucket: CONF.AWS.BUCKET_NAME,
      Body: fs.createReadStream(req.files[0].path),
      Key: `story/${req.files[0].filename}`,
    };

    AWS.config.setPromisesDependency();
    AWS.config.update({
      accessKeyId: CONF.AWS.ID,
      secretAccessKey: CONF.AWS.SECRET,
      region: CONF.AWS.REGION,
    });

    const s3 = new AWS.S3();

    if (story.image)
      s3.deleteObject(
        {
          Bucket: CONF.AWS.BUCKET_NAME,
          Key: story.image.split(".com/").pop(),
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

    req.body.image = url("story", req.files[0].filename);

    let updated = await Story.findOneAndUpdate(
      { story_id: "1" },
      { $set: req.body },
      { new: true }
    );
    return res
      .status(200)
      .send({ story: updated, message: messages.en.updateSucces });
  }
}

module.exports = { createStory, getStory, editStory };
