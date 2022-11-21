const messages = require("../../messages.json");
const CONF = require("../../constants");
const AWS = require("aws-sdk");
const fs = require("fs");
const Property = require("../Property/Property");
const Tour = require("../Tour/Tour");
const Product = require("../Product/Product");
const { City } = require("../City/City");
const Mission = require("../Mission/Mission");
const Vision = require("../Vision/Vision");
const Story = require("../Story/Story");
const Team = require("../Team/Team");
const Media = require("./Media");

const url = (folder, picture) => {
  return `https://${CONF.AWS.BUCKET_NAME}.s3.amazonaws.com/${folder}/${picture}`;
};

async function uploadImages(req, res) {
  let { type, typeId } = req.body;
  let images = [];
  let stopFlag = false;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  AWS.config.setPromisesDependency();
  AWS.config.update({
    accessKeyId: CONF.AWS.ID,
    secretAccessKey: CONF.AWS.SECRET,
    region: CONF.AWS.REGION,
  });

  const s3 = new AWS.S3();

  if (type === "stays") {
    let property = await Property.findOne({ _id: typeId });

    if (!property)
      return res
        .status(404)
        .send({ property: null, message: "Property Not found" });

    images = property.images;

    req.files.forEach((file, index) => {
      let params = {
        ACL: "public-read",
        Bucket: CONF.AWS.BUCKET_NAME,
        Body: fs.createReadStream(file.path),
        Key: `${type}/${typeId}/${file.filename}`,
      };

      //add photos
      s3.upload(params, async (err, data) => {
        if (err) {
          console.log("Error occured while trying to upload to S3 bucket", err);
          return res.status(500).send({ err: err });
        }

        if (data) {
          fs.unlinkSync(file.path); // Empty temp folder
          console.log(data);
          console.log(file.path);
          images.push(data.Location);
        }

        //if (stopFlag || req.files.length === 1) {
        console.log(images);
        property.images = images;
        await property.save();
        // }

        // if (index === req.files.length - 1) {
        //   stopFlag = true;
        // }
      });
    });

    return res
      .status(200)
      .send({ images: images, message: messages.en.addSuccess });
  }

  if (type === "tours") {
    let tour = await Tour.findOne({ _id: typeId });

    if (!tour)
      return res.status(404).send({ tour: null, message: "Tour Not found" });

    images = tour.images;

    req.files.forEach((file, index) => {
      let params = {
        ACL: "public-read",
        Bucket: CONF.AWS.BUCKET_NAME,
        Body: fs.createReadStream(file.path),
        Key: `${type}/${typeId}/${file.filename}`,
      };

      //add photos
      s3.upload(params, async (err, data) => {
        if (err) {
          console.log("Error occured while trying to upload to S3 bucket", err);
          return res.status(500).send({ err: err });
        }

        if (data) {
          fs.unlinkSync(file.path); // Empty temp folder
          console.log(data);
          images.push(data.Location);
        }

        //if (stopFlag || req.files.length === 1) {
        console.log(images);
        tour.images = images;
        await tour.save();
        //}

        //if (index === req.files.length - 1) {
        //  stopFlag = true;
        //}
      });
    });

    return res
      .status(200)
      .send({ images: tour.images, message: messages.en.addSuccess });
  }

  if (type === "products") {
    let product = await Product.findOne({ _id: typeId });

    if (!product)
      return res
        .status(404)
        .send({ product: null, message: "Product Not found" });

    images = product.images;

    req.files.forEach((file, index) => {
      let params = {
        ACL: "public-read",
        Bucket: CONF.AWS.BUCKET_NAME,
        Body: fs.createReadStream(file.path),
        Key: `${type}/${typeId}/${file.filename}`,
      };

      //add photos
      s3.upload(params, async (err, data) => {
        if (err) {
          console.log("Error occured while trying to upload to S3 bucket", err);
          return res.status(500).send({ err: err });
        }

        if (data) {
          fs.unlinkSync(file.path); // Empty temp folder
          console.log(data);
          images.push(data.Location);
        }

        //if (stopFlag || req.files.length === 1) {
        console.log(images);
        product.images = images;
        await product.save();
        //}

        // if (index === req.files.length - 1) {
        //   stopFlag = true;
        // }
      });
    });

    return res
      .status(200)
      .send({ images: product.images, message: messages.en.addSuccess });
  }

  if (type === "cities") {
    let city = await City.findOne({ _id: typeId });

    if (!city)
      return res
        .status(404)
        .send({ city: null, message: messages.en.noRecords });

    let params = {
      ACL: "public-read",
      Bucket: CONF.AWS.BUCKET_NAME,
      Body: fs.createReadStream(req.files[0].path),
      Key: `${type}/${req.files[0].filename}`,
    };

    s3.upload(params, async (err, data) => {
      if (err) {
        console.log("Error occured while trying to upload to S3 bucket", err);
        return res.status(500).send({ err: err });
      }

      if (data) {
        fs.unlinkSync(req.files[0].path); // Empty temp folder
        console.log(data);
        console.log(req.files[0]);
        city.image = data.Location;
        await city.save();
      }
    });

    return res
      .status(200)
      .send({ image: city.image, message: messages.en.addSuccess });
  }

  if (type === "mission") {
    let mission = await Mission.findOne({ _id: typeId });

    if (!mission)
      return res
        .status(404)
        .send({ mission: null, message: messages.en.noRecords });

    let params = {
      ACL: "public-read",
      Bucket: CONF.AWS.BUCKET_NAME,
      Body: fs.createReadStream(req.files[0].path),
      Key: `${type}/${req.files[0].filename}`,
    };

    s3.upload(params, async (err, data) => {
      if (err) {
        console.log("Error occured while trying to upload to S3 bucket", err);
        return res.status(500).send({ err: err });
      }

      if (data) {
        fs.unlinkSync(req.files[0].path); // Empty temp folder
        console.log(data);
        console.log(req.files[0]);
        mission.image = data.Location;
        await mission.save();
      }
    });

    return res
      .status(200)
      .send({ image: mission.image, message: messages.en.addSuccess });
  }

  if (type === "vision") {
    let vision = await Vision.findOne({ _id: typeId });

    if (!vision)
      return res
        .status(404)
        .send({ vision: null, message: messages.en.noRecords });

    let params = {
      ACL: "public-read",
      Bucket: CONF.AWS.BUCKET_NAME,
      Body: fs.createReadStream(req.files[0].path),
      Key: `${type}/${req.files[0].filename}`,
    };

    s3.upload(params, async (err, data) => {
      if (err) {
        console.log("Error occured while trying to upload to S3 bucket", err);
        return res.status(500).send({ err: err });
      }

      if (data) {
        fs.unlinkSync(req.files[0]); // Empty temp folder
        console.log(data);
        console.log(req.files[0].path);
        vision.image = data.Location;
        await vision.save();
      }
    });

    return res
      .status(200)
      .send({ image: vision.image, message: messages.en.addSuccess });
  }

  if (type === "story") {
    let story = await Story.findOne({ _id: typeId });

    if (!story)
      return res
        .status(404)
        .send({ story: null, message: messages.en.noRecords });

    let params = {
      ACL: "public-read",
      Bucket: CONF.AWS.BUCKET_NAME,
      Body: fs.createReadStream(req.files[0].path),
      Key: `${type}/${req.files[0].filename}`,
    };

    s3.upload(params, async (err, data) => {
      if (err) {
        console.log("Error occured while trying to upload to S3 bucket", err);
        return res.status(500).send({ err: err });
      }

      if (data) {
        fs.unlinkSync(req.files[0]); // Empty temp folder
        console.log(data);
        console.log(req.files[0].path);
        story.image = data.Location;
        await story.save();
      }
    });

    return res
      .status(200)
      .send({ image: story.image, message: messages.en.addSuccess });
  }

  if (type === "team") {
    let team = await Team.findOne({ _id: typeId });

    if (!team)
      return res
        .status(404)
        .send({ story: null, message: messages.en.noRecords });

    let params = {
      ACL: "public-read",
      Bucket: CONF.AWS.BUCKET_NAME,
      Body: fs.createReadStream(req.files[0].path),
      Key: `${type}/${req.files[0].filename}`,
    };

    s3.upload(params, async (err, data) => {
      if (err) {
        console.log("Error occured while trying to upload to S3 bucket", err);
        return res.status(500).send({ err: err });
      }

      if (data) {
        fs.unlinkSync(req.files[0]); // Empty temp folder
        console.log(data);
        console.log(req.files[0].path);
        team.image = data.Location;
        await team.save();
      }
    });

    return res
      .status(200)
      .send({ image: team.image, message: messages.en.addSuccess });
  }

  //
  else return res.status(400).send({ images: [], message: "Wrong type" });
}

async function getImages(req, res) {
  let { type, typeId } = req.query;

  if (type === "stays") {
    let property = await Property.findOne({ _id: typeId });

    if (!property)
      return res.status(404).send({
        property: null,
        message: messages.en.noRecords,
      });

    return res
      .status(200)
      .send({ images: property.images, message: messages.en.getSuccess });
  }

  if (type === "tours") {
    let tour = await Tour.findOne({ _id: typeId });

    if (!tour)
      return res.status(404).send({
        tour: null,
        message: messages.en.noRecords,
      });

    return res
      .status(200)
      .send({ images: tour.images, message: messages.en.getSuccess });
  }

  if (type === "products") {
    let product = await Product.findOne({ _id: typeId });

    if (!product)
      return res.status(404).send({
        product: null,
        message: messages.en.noRecords,
      });

    return res
      .status(200)
      .send({ images: product.images, message: messages.en.getSuccess });
  } else return res.status(400).send({ images: [], message: "Wrong type" });
}

async function deleteTmage(req, res) {
  let { type, typeId, img } = req.body;

  //if (req.user.role === 0)
  //  return res
  //    .status(401)
  //    .send({ unAutherized: true, message: messages.en.forbidden });

  AWS.config.setPromisesDependency();
  AWS.config.update({
    accessKeyId: CONF.AWS.ID,
    secretAccessKey: CONF.AWS.SECRET,
    region: CONF.AWS.REGION,
  });

  const s3 = new AWS.S3();

  if (type === "stays") {
    let property = await Property.findOne({ _id: typeId });

    if (!property)
      return res.status(404).send({
        property: null,
        message: messages.en.noRecords,
      });

    property.images.pull(img);

    s3.deleteObject(
      {
        Bucket: CONF.AWS.BUCKET_NAME,
        Key: img.split(".com/").pop(),
      },
      async (data, err) => {
        if (err) console.log(err);
        if (data) {
        }
      }
    );

    await property.save();

    return res
      .status(200)
      .send({ images: property.images, message: messages.en.deleted });
  }

  if (type === "tours") {
    let tour = await Tour.findOne({ _id: typeId });

    if (!tour)
      return res.status(404).send({
        tour: null,
        message: messages.en.noRecords,
      });

    tour.images.pull(img);

    s3.deleteObject(
      {
        Bucket: CONF.AWS.BUCKET_NAME,
        Key: img.split(".com/").pop(),
      },
      async (data, err) => {
        if (err) console.log(err);
        if (data) {
        }
      }
    );
    await tour.save();

    return res
      .status(200)
      .send({ images: tour.images, message: messages.en.deleted });
  }

  if (type === "products") {
    let product = await Product.findOne({ _id: typeId });

    if (!product)
      return res.status(404).send({
        product: null,
        message: messages.en.noRecords,
      });

    product.images.pull(img);

    s3.deleteObject(
      {
        Bucket: CONF.AWS.BUCKET_NAME,
        Key: img.split(".com/").pop(),
      },
      async (data, err) => {
        if (err) console.log(err);
        if (data) {
        }
      }
    );

    await product.save();

    return res
      .status(200)
      .send({ images: product.images, message: messages.en.deleted });
  } else return res.status(400).send({ images: [], message: "Wrong type" });
}

async function editOrder(req, res) {
  let { type, typeId, order } = req.body;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let hasDuplicate = order.some((val, i) => order.indexOf(val) !== i);

  if (hasDuplicate)
    return res
      .status(400)
      .send({ message: "Two items has the same order valus" });

  if (type === "stays") {
    let property = await Property.findOne({ _id: typeId });

    if (!property)
      return res.status(404).send({
        property: null,
        message: messages.en.noRecords,
      });

    if (property.images.length !== order.length)
      return res
        .status(400)
        .send({ message: " Order values are more than the images" });

    const sorted = property.images.map(
      (item, index, arr) => arr[order[index] - 1]
    );

    property.images = sorted;

    await property.save();

    return res
      .status(200)
      .send({ images: property.images, message: messages.en.deleted });
  }

  if (type === "tours") {
    let tour = await Tour.findOne({ _id: typeId });

    if (!tour)
      return res.status(404).send({
        tour: null,
        message: messages.en.noRecords,
      });

    if (tour.images.length !== order.length)
      return res
        .status(400)
        .send({ message: " Order values are more than the images" });

    const sorted = tour.images.map((item, index, arr) => arr[order[index] - 1]);

    tour.images = sorted;

    await tour.save();

    return res
      .status(200)
      .send({ images: tour.images, message: messages.en.deleted });
  }

  if (type === "products") {
    let product = await Product.findOne({ _id: typeId });

    if (!product)
      return res.status(404).send({
        product: null,
        message: messages.en.noRecords,
      });

    if (product.images.length !== order.length)
      return res
        .status(400)
        .send({ message: " Order values are more than the images" });

    const sorted = product.images.map(
      (item, index, arr) => arr[order[index] - 1]
    );

    product.images = sorted;

    await product.save();

    return res
      .status(200)
      .send({ images: product.images, message: messages.en.deleted });
  } else return res.status(400).send({ images: [], message: "Wrong type" });
}

async function addSocialIcons(req, res) {
  let {} = req.body;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  AWS.config.setPromisesDependency();
  AWS.config.update({
    accessKeyId: CONF.AWS.ID,
    secretAccessKey: CONF.AWS.SECRET,
    region: CONF.AWS.REGION,
  });

  const s3 = new AWS.S3();

  let params = {
    ACL: "public-read",
    Bucket: CONF.AWS.BUCKET_NAME,
    Body: fs.createReadStream(req.files[0].path),
    Key: `social-icons/${req.files[0].filename}`,
  };

  req.body.image = url("social-icons", req.files[0].filename);

  let newIcon = new Media(req.body);

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

  await newIcon.save();

  return res
    .status(200)
    .send({ icon: newIcon, message: messages.en.addSuccess });
}

async function getSocialIcons(req, res) {
  let icons = await Media.find();

  return res
    .status(200)
    .send({ icons: icons, message: messages.en.addSuccess });
}

async function getSocialIconsById(req, res) {
  let icon = await Media.findOne({ _id: req.params.id });

  if (!icon)
    return res.status(404).send({ icon: null, message: messages.en.noRecords });

  return res.status(200).send({ icon: icon, message: messages.en.addSuccess });
}

async function getSocialIconsApp(req, res) {
  let icons = await Media.find({ enabled: true });

  return res
    .status(200)
    .send({ icons: icons, message: messages.en.addSuccess });
}

async function editIcon(req, res) {
  let { enabled } = req.body;
  let updated;

  if (enabled === "false") enabled = false;
  if (enabled === "true") enabled = true;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let icon = await Media.findOne({ _id: req.params.id });

  if (!icon)
    return res.status(404).send({ icon: null, message: messages.en.noRecords });

  if (req.files.length === 0) {
    updated = await Media.findOneAndUpdate(
      { _id: req.params.id },
      { $set: req.body },
      { new: true }
    );

    return res
      .status(200)
      .send({ icon: updated, message: messages.en.updateSucces });
  } else {
    AWS.config.setPromisesDependency();
    AWS.config.update({
      accessKeyId: CONF.AWS.ID,
      secretAccessKey: CONF.AWS.SECRET,
      region: CONF.AWS.REGION,
    });

    const s3 = new AWS.S3();

    let params = {
      ACL: "public-read",
      Bucket: CONF.AWS.BUCKET_NAME,
      Body: fs.createReadStream(req.files[0].path),
      Key: `social-icons/${req.files[0].filename}`,
    };

    req.body.image = url("social-icons", req.files[0].filename);

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

    updated = await Media.findOneAndUpdate(
      { _id: req.params.id },
      { $set: req.body },
      { new: true }
    );

    return res
      .status(200)
      .send({ icon: updated, message: messages.en.addSuccess });
  }
}

async function deleteIcon(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let icon = await Media.findOne({ _id: req.params.id });

  if (!icon)
    return res.status(404).send({ icon: null, message: messages.en.noRecords });

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
      Key: icon.image.split(".com/").pop(),
    },
    async (data, err) => {
      if (err) console.log(err);
      if (data) {
      }
    }
  );

  let deleted = await Media.findOneAndDelete({ _id: req.params.id });

  return res.status(200).send({ icon: deleted, message: messages.en.deleted });
}

async function sortImages(req, res) {
  let { type, typeId, images } = req.body;

  if (type === "stays") {
    let stay = await Property.findOne({ _id: typeId });

    if (!stay)
      return res
        .status(404)
        .send({ property: null, message: messages.en.noRecords });

    stay.images = images;
    await stay.save();

    return res
      .status(200)
      .send({ images: images, message: messages.en.updateSucces });
  }
  if (type === "tours") {
    let tour = await Tour.findOne({ _id: typeId });

    if (!tour)
      return res
        .status(404)
        .send({ tour: null, message: messages.en.noRecords });

    tour.images = images;
    await tour.save();

    return res
      .status(200)
      .send({ images: images, message: messages.en.updateSucces });
  }

  if (type === "products") {
    let product = await Product.findOne({ _id: typeId });

    if (!product)
      return res
        .status(404)
        .send({ product: null, message: messages.en.noRecords });

    product.images = images;
    await product.save();

    return res
      .status(200)
      .send({ images: images, message: messages.en.updateSucces });
  } else return res.status(400).send({ images: [], message: "Wrong type" });
}

module.exports = {
  uploadImages,
  getImages,
  deleteTmage,
  editOrder,
  addSocialIcons,
  getSocialIcons,
  getSocialIconsApp,
  editIcon,
  deleteIcon,
  getSocialIconsById,
  sortImages,
};
