const Company = require("./Company");
const messages = require("../../messages.json");
const CONF = require("../../constants");
const AWS = require("aws-sdk");
const fs = require("fs");

const url = (folder, picture) => {
  return `https://${CONF.AWS.BUCKET_NAME}.s3.amazonaws.com/${folder}/${picture}`;
};

async function createCompany(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let params = {
    ACL: "public-read",
    Bucket: CONF.AWS.BUCKET_NAME,
    Body: fs.createReadStream(req.files[0].path),
    Key: `companies/${req.files[0].filename}`,
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

  req.body.image = url("companies", req.files[0].filename);

  const newCompany = new Company(req.body);

  await newCompany.save();

  console.log("Company successfully created");

  return res
    .status(200)
    .send({ newCompany: newCompany, message: messages.en.addSuccess });
}

async function getCompany(req, res) {
  let company;
  let companies;

  try {
    if (req.params.id) {
      let query = { _id: req.params.id };
      company = await Company.findOne(query);
      if (!company)
        return res
          .status(404)
          .send({ company: null, message: messages.en.noRecords });

      return res
        .status(200)
        .send({ company: company, message: messages.en.getSuccess });
    } else {
      companies = await Company.find({});

      return res
        .status(200)
        .send({ companies: companies, message: messages.en.getSuccess });
    }
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
}

async function editCompany(req, res) {
  let company = await Company.findOne({ _id: req.params.id });

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  if (!company)
    return res
      .status(404)
      .send({ company: null, message: messages.en.noRecords });

  if (req.files.length === 0) {
    let updated = await Company.findOneAndUpdate(
      { _id: req.params.id },
      { $set: req.body },
      { new: true }
    );

    return res
      .status(200)
      .send({ company: updated, message: messages.en.updateSucces });
  } else {
    let params = {
      ACL: "public-read",
      Bucket: CONF.AWS.BUCKET_NAME,
      Body: fs.createReadStream(req.files[0].path),
      Key: `companies/${req.files[0].filename}`,
    };

    AWS.config.setPromisesDependency();
    AWS.config.update({
      accessKeyId: CONF.AWS.ID,
      secretAccessKey: CONF.AWS.SECRET,
      region: CONF.AWS.REGION,
    });

    const s3 = new AWS.S3();

    if (company.image)
      s3.deleteObject(
        {
          Bucket: CONF.AWS.BUCKET_NAME,
          Key: company.image.split(".com/").pop(),
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

    req.body.image = url("companies", req.files[0].filename);

    let updated = await Company.findOneAndUpdate(
      { _id: req.params.id },
      { $set: req.body },
      { new: true }
    );

    return res
      .status(200)
      .send({ company: updated, message: messages.en.updateSucces });
  }
}

async function deleteCompany(req, res) {
  let company = await Company.findOne({ _id: req.params.id });

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  if (!company)
    return res
      .status(404)
      .send({ company: null, message: messages.en.noRecords });

  //s3.deleteObject(
  //  {
  //    Bucket: CONF.AWS.BUCKET_NAME,
  //    Key: company.image.split(".com/").pop(),
  //  },
  //  async (data, err) => {
  //    if (err) return res.status(500).send({ err: err });
  //    if (data) {
  //      console.log("deleted");
  //    }
  //  }
  //);

  let deleted = await Company.findOneAndDelete({ _id: req.params.id });
  return res
    .status(200)
    .send({ company: deleted, message: messages.en.deleted });
}

module.exports = { createCompany, getCompany, editCompany, deleteCompany };
