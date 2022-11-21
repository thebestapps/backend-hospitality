const { Amenities } = require("./Amenities");
const messages = require("../../messages.json");
const mongoose = require("mongoose");
const CONF = require("../../constants");
const AWS = require("aws-sdk");
const fs = require("fs");

const url = (folder, picture) => {
  return `https://${CONF.AWS.BUCKET_NAME}.s3.amazonaws.com/${folder}/${picture}`;
};

async function AddAmenities(req, res) {
  let { name, isFeatured } = req.body;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let params = {
    ACL: "public-read",
    Bucket: CONF.AWS.BUCKET_NAME,
    Body: fs.createReadStream(req.files[0].path),
    Key: `Amenities/${req.files[0].filename}`,
  };

  AWS.config.setPromisesDependency();
  AWS.config.update({
    accessKeyId: CONF.AWS.ID,
    secretAccessKey: CONF.AWS.SECRET,
    region: CONF.AWS.REGION,
  });

  const s3 = new AWS.S3();

  let amenities = await Amenities.findOne({ name: name });

  if (!amenities || amenities.deleted) {
    if (isFeatured === "true") isFeatured = true;
    else isFeatured = false;

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

    req.body.image = url("Amenities", req.files[0].filename);
    let newAmenities = new Amenities(req.body);
    await newAmenities.save();

    return res
      .status(200)
      .send({ amenities: newAmenities, message: messages.en.addSuccess });
  }

  return res
    .status(200)
    .send({ amenities: amenities, message: messages.en.exist });
}
async function GetAmenities(req, res) {
  let filter = { deleted: false };

  if (req.url === "/featured") filter.isFeatured = true;
  if (req.url === "/nonefeatured") filter.isFeatured = false;

  let amenities = await Amenities.find(filter).select(
    "_id name isFeatured image"
  );

  if (amenities.length === 0)
    return res
      .status(200)
      .send({ amenities: amenities, message: messages.en.noRecords });

  return res
    .status(200)
    .send({ amenities: amenities, message: messages.en.getSuccess });
}

async function GetAmenitiesById(req, res) {
  let amenitiesId = req.params.id;

  let amenities = await Amenities.findOne({
    _id: mongoose.Types.ObjectId(amenitiesId),
  });
  if (!amenities)
    return res.status(404).send({ message: messages.en.noRecords });

  return res
    .status(200)
    .send({ amenities: amenities, message: messages.en.getSuccess });
}

async function Edit(req, res) {
  let amenitiesId = mongoose.Types.ObjectId(req.params.id);
  let { enabled, isFeatured } = req.body;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let amenities = await Amenities.findOne({ _id: amenitiesId });

  if (!amenities)
    return res.status(404).send({ message: messages.en.noRecords });

  if (isFeatured === "true") isFeatured = true;
  else isFeatured = false;

  if (enabled === "true") enabled = true;
  else enabled = false;

  if (!req.files || req.files.length === 0) {
    let updated = await Amenities.findOneAndUpdate(
      { _id: amenitiesId },
      { $set: req.body },
      { new: true }
    );

    return res
      .status(200)
      .send({ amenities: updated, message: messages.en.updateSucces });
  } else {
    let params = {
      ACL: "public-read",
      Bucket: CONF.AWS.BUCKET_NAME,
      Body: fs.createReadStream(req.files[0].path),
      Key: `Amenities/${req.files[0].filename}`,
    };

    AWS.config.setPromisesDependency();
    AWS.config.update({
      accessKeyId: CONF.AWS.ID,
      secretAccessKey: CONF.AWS.SECRET,
      region: CONF.AWS.REGION,
    });

    const s3 = new AWS.S3();

    if (amenities.image)
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

    req.body.image = url("Amenities", req.files[0].filename);

    let updated = await Amenities.findOneAndUpdate(
      { _id: amenitiesId },
      { $set: req.body },
      { new: true }
    );

    return res
      .status(200)
      .send({ amenities: updated, message: messages.en.updateSucces });
  }
}

async function Delete(req, res) {
  let amenitiesId = mongoose.Types.ObjectId(req.params.id);

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let amenities = await Amenities.findOneAndUpdate(
    { _id: amenitiesId },
    { $set: { deleted: true, enabled: false } },
    { new: true }
  );

  if (!amenities)
    return res.status(404).send({ message: messages.en.noRecords });

  return res
    .status(200)
    .send({ amenities: amenities, message: messages.en.deleted });
}

module.exports = { AddAmenities, GetAmenities, GetAmenitiesById, Edit, Delete };
