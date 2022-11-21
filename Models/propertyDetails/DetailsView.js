const Details = require("./Details");
let Property = require("../Property/Property");
const messages = require("../../messages.json");
const CONF = require("../../constants");
const AWS = require("aws-sdk");
const fs = require("fs");

const url = (folder, id, picture) => {
  return `https://${CONF.AWS.BUCKET_NAME}.s3.amazonaws.com/${folder}/${id}/${picture}`;
};

async function addDetails(req, res) {
  let {
    propertyId,
    textDetails,
    instruction,
    locationUrl,
    wifiName,
    wifiPassword,
    parkingDetails,
    electricityDetails,
    grocertStores,
    resturants,
    nightSpots,
    entertainment,
    transportation,
  } = req.body;

  req.body.grocertStores = JSON.parse(grocertStores);
  req.body.resturants = JSON.parse(resturants);
  req.body.nightSpots = JSON.parse(nightSpots);
  req.body.entertainment = JSON.parse(entertainment);
  req.body.transportation = JSON.parse(transportation);

  req.body.location = {
    textDetails: textDetails,
    locationUrl: locationUrl,
    buildingPhoto: "",
  };

  req.body.keys = { instruction: instruction, videoUrl: "", photoUrl: "" };

  req.body.wifi = { name: wifiName, password: wifiPassword };

  req.body.parking = {
    details: parkingDetails,
    parkingPhoto: "",
  };

  req.body.electricity = {
    details: electricityDetails,
    elecPhoto: "",
  };

  req.body.property = propertyId;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let property = await Property.findOne({
    _id: propertyId,
  });

  if (!property)
    return res.status(404).send({
      property: null,
      message: messages.en.noRecords,
    });

  let details = await Details.findOne({ property: propertyId });

  if (!details) {
    let newDetails = new Details(req.body);

    AWS.config.setPromisesDependency();
    AWS.config.update({
      accessKeyId: CONF.AWS.ID,
      secretAccessKey: CONF.AWS.SECRET,
      region: CONF.AWS.REGION,
    });

    const s3 = new AWS.S3();

    if (req.files["keyVideo"]) {
      let params = {
        ACL: "public-read",
        Bucket: CONF.AWS.BUCKET_NAME,
        Body: fs.createReadStream(req.files["keyVideo"][0].path),
        Key: `Details/${propertyId}/${req.files["keyVideo"][0].filename}`,
      };

      newDetails.keys.videoUrl = url(
        "Details",
        propertyId,
        req.files["keyVideo"][0].filename
      );

      s3.upload(params, async (err, data) => {
        if (err) {
          console.log("Error occured while trying to upload to S3 bucket", err);
          return res.status(500).send({ err: err });
        }

        if (data) {
          fs.unlinkSync(req.files["keyVideo"][0].path); // Empty temp folder
          console.log(data);
        }
      });
    }

    if (req.files["keyImage"]) {
      let params = {
        ACL: "public-read",
        Bucket: CONF.AWS.BUCKET_NAME,
        Body: fs.createReadStream(req.files["keyImage"][0].path),
        Key: `Details/${propertyId}/${req.files["keyImage"][0].filename}`,
      };

      newDetails.keys.photoUrl = url(
        "Details",
        propertyId,
        req.files["keyImage"][0].filename
      );

      s3.upload(params, async (err, data) => {
        if (err) {
          console.log("Error occured while trying to upload to S3 bucket", err);
          return res.status(500).send({ err: err });
        }

        if (data) {
          fs.unlinkSync(req.files["keyImage"][0].path); // Empty temp folder
          console.log(data);
        }
      });
    }

    if (req.files["building"]) {
      let params = {
        ACL: "public-read",
        Bucket: CONF.AWS.BUCKET_NAME,
        Body: fs.createReadStream(req.files["building"][0].path),
        Key: `Details/${propertyId}/${req.files["building"][0].filename}`,
      };

      newDetails.location.buildingPhoto = url(
        "Details",
        propertyId,
        req.files["building"][0].filename
      );

      s3.upload(params, async (err, data) => {
        if (err) {
          console.log("Error occured while trying to upload to S3 bucket", err);
          return res.status(500).send({ err: err });
        }

        if (data) {
          fs.unlinkSync(req.files["building"][0].path); // Empty temp folder
          console.log(data);
        }
      });
    }

    if (req.files["parkingImage"]) {
      let params = {
        ACL: "public-read",
        Bucket: CONF.AWS.BUCKET_NAME,
        Body: fs.createReadStream(req.files["parkingImage"][0].path),
        Key: `Details/${propertyId}/${req.files["parkingImage"][0].filename}`,
      };

      newDetails.parking.parkingPhoto = url(
        "Details",
        propertyId,
        req.files["parkingImage"][0].filename
      );

      s3.upload(params, async (err, data) => {
        if (err) {
          console.log("Error occured while trying to upload to S3 bucket", err);
          return res.status(500).send({ err: err });
        }

        if (data) {
          fs.unlinkSync(req.files["parkingImage"][0].path); // Empty temp folder
          console.log(data);
        }
      });
    }

    if (req.files["elecImage"]) {
      let params = {
        ACL: "public-read",
        Bucket: CONF.AWS.BUCKET_NAME,
        Body: fs.createReadStream(req.files["elecImage"][0].path),
        Key: `Details/${propertyId}/${req.files["elecImage"][0].filename}`,
      };

      newDetails.electricity.elecPhoto = url(
        "Details",
        propertyId,
        req.files["elecImage"][0].filename
      );

      s3.upload(params, async (err, data) => {
        if (err) {
          console.log("Error occured while trying to upload to S3 bucket", err);
          return res.status(500).send({ err: err });
        }

        if (data) {
          fs.unlinkSync(req.files["elecImage"][0].path); // Empty temp folder
          console.log(data);
        }
      });
    }

    await newDetails.save();

    return res
      .status(200)
      .send({ details: newDetails, message: messages.en.addSuccess });
  }

  return res
    .status(303)
    .send({ details: details, message: "Record already exis you can edit" });
}

async function getAllDetails(req, res) {
  let details = await Details.find().populate("property", "_id name");

  return res
    .status(200)
    .send({ details: details, message: messages.en.getSuccess });
}

async function getDetailsById(req, res) {
  let details = await Details.findOne({ _id: req.params.id }).populate(
    "property",
    "_id name"
  );

  if (!details)
    return res
      .status(200)
      .send({ details: {}, message: messages.en.noRecords });

  return res
    .status(200)
    .send({ details: details, message: messages.en.getSuccess });
}

async function getDetailsByStayId(req, res) {
  let { stay } = req.query;
  let details = await Details.findOne({ property: stay }).populate(
    "property",
    "_id name"
  );

  if (!details)
    return res
      .status(200)
      .send({ details: {}, message: messages.en.noRecords });

  return res
    .status(200)
    .send({ details: details, message: messages.en.getSuccess });
}

async function editDetails(req, res) {
  let {
    propertyId,
    textDetails,
    instruction,
    locationUrl,
    wifiName,
    wifiPassword,
    parkingDetails,
    electricityDetails,
    grocertStores,
    resturants,
    nightSpots,
    entertainment,
    transportation,
  } = req.body;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let details = await Details.findOne({ property: propertyId });

  if (!details)
    return res
      .status(200)
      .send({ details: {}, message: messages.en.noRecords });

  req.body.location = {
    textDetails: textDetails,
    locationUrl: locationUrl,
    buildingPhoto: details.location.buildingPhoto,
  };

  req.body.keys = {
    instruction: instruction,
    videoUrl: details.keys.videoUrl,
    photoUrl: details.keys.photoUrl,
  };

  req.body.wifi = { name: wifiName, password: wifiPassword };

  req.body.parking = {
    details: parkingDetails,
    parkingPhoto: details.parking.parkingPhoto,
  };

  req.body.electricity = {
    details: electricityDetails,
    elecPhoto: details.electricity.elecPhoto,
  };

  req.body.grocertStores = JSON.parse(grocertStores);
  req.body.resturants = JSON.parse(resturants);
  req.body.nightSpots = JSON.parse(nightSpots);
  req.body.entertainment = JSON.parse(entertainment);
  req.body.transportation = JSON.parse(transportation);

  AWS.config.setPromisesDependency();
  AWS.config.update({
    accessKeyId: CONF.AWS.ID,
    secretAccessKey: CONF.AWS.SECRET,
    region: CONF.AWS.REGION,
  });

  const s3 = new AWS.S3();

  req.body.property = propertyId;

  if (req.files["keyVideo"]) {
    let params = {
      ACL: "public-read",
      Bucket: CONF.AWS.BUCKET_NAME,
      Body: fs.createReadStream(req.files["keyVideo"][0].path),
      Key: `Details/${propertyId}/${req.files["keyVideo"][0].filename}`,
    };

    req.body.keys.videoUrl = url(
      "Details",
      propertyId,
      req.files["keyVideo"][0].filename
    );

    s3.upload(params, async (err, data) => {
      if (err) {
        console.log("Error occured while trying to upload to S3 bucket", err);
        return res.status(500).send({ err: err });
      }

      if (data) {
        fs.unlinkSync(req.files["keyVideo"][0].path); // Empty temp folder
        console.log(data);
      }
    });
  }

  if (req.files["keyImage"]) {
    let params = {
      ACL: "public-read",
      Bucket: CONF.AWS.BUCKET_NAME,
      Body: fs.createReadStream(req.files["keyImage"][0].path),
      Key: `Details/${propertyId}/${req.files["keyImage"][0].filename}`,
    };

    req.body.keys.photoUrl = url(
      "Details",
      propertyId,
      req.files["keyImage"][0].filename
    );

    s3.upload(params, async (err, data) => {
      if (err) {
        console.log("Error occured while trying to upload to S3 bucket", err);
        return res.status(500).send({ err: err });
      }

      if (data) {
        fs.unlinkSync(req.files["keyImage"][0].path); // Empty temp folder
        console.log(data);
      }
    });
  }

  if (req.files["building"]) {
    let params = {
      ACL: "public-read",
      Bucket: CONF.AWS.BUCKET_NAME,
      Body: fs.createReadStream(req.files["building"][0].path),
      Key: `Details/${propertyId}/${req.files["building"][0].filename}`,
    };

    req.body.location.buildingPhoto = url(
      "Details",
      propertyId,
      req.files["building"][0].filename
    );

    s3.upload(params, async (err, data) => {
      if (err) {
        console.log("Error occured while trying to upload to S3 bucket", err);
        return res.status(500).send({ err: err });
      }

      if (data) {
        fs.unlinkSync(req.files["building"][0].path); // Empty temp folder
        console.log(data);
      }
    });
  }

  if (req.files["parkingImage"]) {
    let params = {
      ACL: "public-read",
      Bucket: CONF.AWS.BUCKET_NAME,
      Body: fs.createReadStream(req.files["parkingImage"][0].path),
      Key: `Details/${propertyId}/${req.files["parkingImage"][0].filename}`,
    };

    req.body.parking.parkingPhoto = url(
      "Details",
      propertyId,
      req.files["parkingImage"][0].filename
    );

    s3.upload(params, async (err, data) => {
      if (err) {
        console.log("Error occured while trying to upload to S3 bucket", err);
        return res.status(500).send({ err: err });
      }

      if (data) {
        fs.unlinkSync(req.files["parkingImage"][0].path); // Empty temp folder
        console.log(data);
      }
    });
  }

  if (req.files["elecImage"]) {
    let params = {
      ACL: "public-read",
      Bucket: CONF.AWS.BUCKET_NAME,
      Body: fs.createReadStream(req.files["elecImage"][0].path),
      Key: `Details/${propertyId}/${req.files["elecImage"][0].filename}`,
    };

    req.body.electricity.elecPhoto = url(
      "Details",
      propertyId,
      req.files["elecImage"][0].filename
    );

    s3.upload(params, async (err, data) => {
      if (err) {
        console.log("Error occured while trying to upload to S3 bucket", err);
        return res.status(500).send({ err: err });
      }

      if (data) {
        fs.unlinkSync(req.files["elecImage"][0].path); // Empty temp folder
        console.log(data);
      }
    });
  }

  let updated = await Details.findOneAndUpdate(
    { property: propertyId },
    { $set: req.body },
    { new: true }
  );

  return res.status(200).send({
    details: updated,
    message: messages.en.updateSucces,
  });
}

async function deleteDetails(req, res) {
  let { propertyId } = req.body;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let details = await Details.findOne({ property: propertyId });

  if (!details)
    return res
      .status(200)
      .send({ details: {}, message: messages.en.noRecords });

  let deleted = await Details.findOneAndDelete({ property: propertyId });

  return res.status(200).send({
    details: deleted,
    message: messages.en.deleted,
  });
}

module.exports = {
  addDetails,
  getAllDetails,
  getDetailsById,
  getDetailsByStayId,
  editDetails,
  deleteDetails,
};
