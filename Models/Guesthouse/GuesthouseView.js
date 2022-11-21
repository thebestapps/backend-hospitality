const Guesthouse = require("./Guesthouse");
const Property = require("../Property/Property");
const Tour = require("../Tour/Tour");
const messages = require("../../messages.json");
const CONF = require("../../constants");
const AWS = require("aws-sdk");
const fs = require("fs");

const url = (folder, id, picture, event = false) => {
  if (!event)
    return `https://${CONF.AWS.BUCKET_NAME}.s3.amazonaws.com/${folder}/${id}/${picture}`;
  else
    return `https://${CONF.AWS.BUCKET_NAME}.s3.amazonaws.com/${folder}/${id}/events/${picture}`;
};

async function createGuesthouse(req, res) {
  let { highlights, amenities, eventTitles, stays, tours, events, name } =
    req.body;
  let titles;

  req.body.urlName = name.replace(/\s+/g, "-");

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  if (highlights) req.body.highlights = JSON.parse(highlights);
  if (amenities) req.body.amenities = JSON.parse(amenities);
  if (eventTitles) titles = JSON.parse(eventTitles);
  if (events) req.body.events = JSON.parse(events);

  let newGuesthouse = new Guesthouse(req.body);

  AWS.config.setPromisesDependency();
  AWS.config.update({
    accessKeyId: CONF.AWS.ID,
    secretAccessKey: CONF.AWS.SECRET,
    region: CONF.AWS.REGION,
  });

  const s3 = new AWS.S3();

  if (req.files["logo"]) {
    let params = {
      ACL: "public-read",
      Bucket: CONF.AWS.BUCKET_NAME,
      Body: fs.createReadStream(req.files["logo"][0].path),
      Key: `GuestHouse/${newGuesthouse._id}/${req.files["logo"][0].filename}`,
    };

    newGuesthouse.logo = url(
      "GuestHouse",
      newGuesthouse._id,
      req.files["logo"][0].filename
    );

    s3.upload(params, async (err, data) => {
      if (err) {
        console.log("Error occured while trying to upload to S3 bucket", err);
        return res.status(500).send({ err: err });
      }

      if (data) {
        fs.unlinkSync(req.files["logo"][0].path); // Empty temp folder
        console.log(data);
      }
    });
  }

  if (req.files["cover"]) {
    let params = {
      ACL: "public-read",
      Bucket: CONF.AWS.BUCKET_NAME,
      Body: fs.createReadStream(req.files["cover"][0].path),
      Key: `GuestHouse/${newGuesthouse._id}/${req.files["cover"][0].filename}`,
    };

    newGuesthouse.cover = url(
      "GuestHouse",
      newGuesthouse._id,
      req.files["cover"][0].filename
    );

    s3.upload(params, async (err, data) => {
      if (err) {
        console.log("Error occured while trying to upload to S3 bucket", err);
        return res.status(500).send({ err: err });
      }

      if (data) {
        fs.unlinkSync(req.files["cover"][0].path); // Empty temp folder
        console.log(data);
      }
    });
  }

  if (req.files["barImg"]) {
    let params = {
      ACL: "public-read",
      Bucket: CONF.AWS.BUCKET_NAME,
      Body: fs.createReadStream(req.files["barImg"][0].path),
      Key: `GuestHouse/${newGuesthouse._id}/${req.files["barImg"][0].filename}`,
    };

    newGuesthouse.barImg = url(
      "GuestHouse",
      newGuesthouse._id,
      req.files["barImg"][0].filename
    );

    s3.upload(params, async (err, data) => {
      if (err) {
        console.log("Error occured while trying to upload to S3 bucket", err);
        return res.status(500).send({ err: err });
      }

      if (data) {
        fs.unlinkSync(req.files["barImg"][0].path); // Empty temp folder
        console.log(data);
      }
    });
  }

  //if (req.files["eventImages"]) {
  //  let images = [];
  //
  //  req.files["eventImages"].forEach((file, i) => {
  //    let params = {
  //      ACL: "public-read",
  //      Bucket: CONF.AWS.BUCKET_NAME,
  //      Body: fs.createReadStream(file.path),
  //      Key: `GuestHouse/${newGuesthouse._id}/events/${file.filename}`,
  //    };
  //
  //    images.push({
  //      img: url("GuestHouse", newGuesthouse._id, file.filename, true),
  //      title: titles[i],
  //    });
  //
  //    s3.upload(params, async (err, data) => {
  //      if (err) {
  //        console.log("Error occured while trying to upload to S3 bucket", err);
  //        return res.status(500).send({ err: err });
  //      }
  //
  //      if (data) {
  //        fs.unlinkSync(file.path); // Empty temp folder
  //        console.log(data);
  //        console.log(file);
  //      }
  //    });
  //  });
  //
  //  newGuesthouse.events = images;
  //}

  await newGuesthouse.save();

  if (stays) {
    let staysIds = JSON.parse(req.body.stays);
    staysIds.forEach(async (stay) => {
      let property = await Property.findOneAndUpdate(
        { _id: stay },
        { $set: { guestHouse: newGuesthouse._id } },
        { new: true }
      );

      await property.save();
    });
  }

  if (tours) {
    let toursIds = JSON.parse(req.body.tours);
    toursIds.forEach(async (tour) => {
      let experince = await Tour.findOneAndUpdate(
        { _id: tour },
        { $set: { guestHouse: newGuesthouse._id } },
        { new: true }
      );

      await experince.save();
    });
  }

  return res
    .status(200)
    .send({ guestHouse: newGuesthouse, message: messages.en.addSuccess });
}

async function getGuesthouses(req, res) {
  const guesthouses = await Guesthouse.find({ deleted: false }).select(
    "_id name urlName logo"
  );

  return res
    .status(200)
    .send({ guestHouses: guesthouses, message: messages.en.getSuccess });
}

async function getGuesthouseById(req, res) {
  let staysData = [];
  let toursData = [];
  const daysNumbers = [0, 6]; //0 is sunday and 1 is saturday
  let conversion = req.conversion;
  let filter = {};

  if (req.params.id) filter = { _id: req.params.id };
  if (req.params.urlName) filter = { urlName: req.params.urlName };

  let guesthouse = await Guesthouse.findOne(filter)
    .populate("amenities", "_id name image deleted")
    .populate("highlights", "_id name image description deleted")
    .populate("events", "_id name image deleted");

  if (!guesthouse)
    return res
      .status(404)
      .send({ guestHouse: null, message: messages.en.noRecords });

  let stays = await Property.find({
    guestHouse: guesthouse._id,
    deleted: false,
  })
    .populate("price.currency", "_id name symbol")
    .populate("area", "_id name");

  stays.forEach((stay) => {
    let price = 0;

    if (daysNumbers.includes(new Date().getDay())) {
      price = stay.priceAccordingToWeekends.price;
    }

    //Prices if days are weekdays
    else {
      price = stay.priceAccordingToWeekDays.price;
    }

    //Check if date is in a range where price may be diffrent and change the price
    stay.priceAccordingToDate.forEach((ele) => {
      ele.dates.forEach((date) => {
        new Date(date).getTime() ===
        new Date(new Date().setUTCHours(0, 0, 0, 0)).getTime()
          ? (price = ele.price)
          : (price = price);
      });
    });

    staysData.push({
      _id: stay._id,
      name: stay.name,
      urlName: stay.urlName,
      image: stay.images[0],
      area: stay.area,
      price: !conversion
        ? `${price} ${stay.price.currency.symbol}`
        : `${price * conversion.rate} ${conversion.to.symbol}`,
    });
  });

  let tours = await Tour.find({
    guestHouse: guesthouse._id,
    deleted: false,
  }).populate("price.currency", "_id symbol");

  tours.forEach((tour) => {
    let price = 0;
    price = tour.price.amount.adults;

    toursData.push({
      _id: tour._id,
      title: tour.title,
      urlName: tour.urlName,
      image: tour.images[0],
      price: !conversion
        ? `${price} ${tour.price.currency.symbol}`
        : `${price * conversion.rate} ${conversion.to.symbol}`,
    });
  });

  let data = guesthouse.toObject();

  data.amenities = data.amenities.map((item) => {
    if (!item.deleted) return item;
  });

  data.highlights = data.highlights.map((item) => {
    if (!item.deleted) return item;
  });

  data.events = data.events.map((item) => {
    if (!item.deleted) return item;
  });

  return res.status(200).send({
    guestHouse: data,
    stays: staysData,
    tours: toursData,
    message: messages.en.getSuccess,
  });
}

async function editGuesthouse(req, res) {
  let { highlights, amenities, eventTitles, stays, tours, events, name } =
    req.body;
  let titles;

  if (name) req.body.urlName = name.replace(/\s+/g, "-");

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let guesthouse = await Guesthouse.findOne({ _id: req.params.id });

  if (!guesthouse)
    return res
      .status(404)
      .send({ guestHouse: null, message: messages.en.noRecords });

  if (highlights) req.body.highlights = JSON.parse(highlights);
  if (amenities) req.body.amenities = JSON.parse(amenities);
  if (eventTitles) titles = JSON.parse(eventTitles);
  if (events) req.body.events = JSON.parse(events);

  AWS.config.setPromisesDependency();
  AWS.config.update({
    accessKeyId: CONF.AWS.ID,
    secretAccessKey: CONF.AWS.SECRET,
    region: CONF.AWS.REGION,
  });

  const s3 = new AWS.S3();

  if (req.files["logo"]) {
    let params = {
      ACL: "public-read",
      Bucket: CONF.AWS.BUCKET_NAME,
      Body: fs.createReadStream(req.files["logo"][0].path),
      Key: `GuestHouse/${guesthouse._id}/${req.files["logo"][0].filename}`,
    };

    req.body.logo = url(
      "GuestHouse",
      guesthouse._id,
      req.files["logo"][0].filename
    );

    s3.upload(params, async (err, data) => {
      if (err) {
        console.log("Error occured while trying to upload to S3 bucket", err);
        return res.status(500).send({ err: err });
      }

      if (data) {
        fs.unlinkSync(req.files["logo"][0].path); // Empty temp folder
        console.log(data);
      }
    });
  }

  if (req.files["cover"]) {
    let params = {
      ACL: "public-read",
      Bucket: CONF.AWS.BUCKET_NAME,
      Body: fs.createReadStream(req.files["cover"][0].path),
      Key: `GuestHouse/${guesthouse._id}/${req.files["cover"][0].filename}`,
    };

    req.body.cover = url(
      "GuestHouse",
      guesthouse._id,
      req.files["cover"][0].filename
    );

    s3.upload(params, async (err, data) => {
      if (err) {
        console.log("Error occured while trying to upload to S3 bucket", err);
        return res.status(500).send({ err: err });
      }

      if (data) {
        fs.unlinkSync(req.files["cover"][0].path); // Empty temp folder
        console.log(data);
      }
    });
  }

  if (req.files["barImg"]) {
    let params = {
      ACL: "public-read",
      Bucket: CONF.AWS.BUCKET_NAME,
      Body: fs.createReadStream(req.files["barImg"][0].path),
      Key: `GuestHouse/${guesthouse._id}/${req.files["barImg"][0].filename}`,
    };

    req.body.barImg = url(
      "GuestHouse",
      guesthouse._id,
      req.files["barImg"][0].filename
    );

    s3.upload(params, async (err, data) => {
      if (err) {
        console.log("Error occured while trying to upload to S3 bucket", err);
        return res.status(500).send({ err: err });
      }

      if (data) {
        fs.unlinkSync(req.files["barImg"][0].path); // Empty temp folder
        console.log(data);
      }
    });
  }

  //if (req.files["eventImages"]) {
  //  let images = guesthouse.events;
  //
  //  req.files["eventImages"].forEach((file, i) => {
  //    let params = {
  //      ACL: "public-read",
  //      Bucket: CONF.AWS.BUCKET_NAME,
  //      Body: fs.createReadStream(file.path),
  //      Key: `GuestHouse/${guesthouse._id}/events/${file.filename}`,
  //    };
  //
  //    images.push({
  //      img: url("GuestHouse", guesthouse._id, file.filename, true),
  //      title: titles[i],
  //    });
  //
  //    s3.upload(params, async (err, data) => {
  //      if (err) {
  //        console.log("Error occured while trying to upload to S3 bucket", err);
  //        return res.status(500).send({ err: err });
  //      }
  //
  //      if (data) {
  //        fs.unlinkSync(file.path); // Empty temp folder
  //        console.log(data);
  //        console.log(file);
  //      }
  //    });
  //  });
  //
  //  req.body.events = images;
  //}

  let updated = await Guesthouse.findOneAndUpdate(
    { _id: req.params.id },
    { $set: req.body },
    { new: true }
  );

  if (stays) {
    let staysIds = JSON.parse(req.body.stays);
    staysIds.forEach(async (stay) => {
      let property = await Property.findOneAndUpdate(
        { _id: stay },
        { $set: { guestHouse: req.params.id } },
        { new: true }
      );

      await property.save();
    });
  }

  if (tours) {
    let toursIds = JSON.parse(req.body.tours);
    toursIds.forEach(async (tour) => {
      let experince = await Tour.findOneAndUpdate(
        { _id: tour },
        { $set: { guestHouse: req.params.id } },
        { new: true }
      );

      await experince.save();
    });
  }

  return res
    .status(200)
    .send({ guestHouse: updated, message: messages.en.updateSucces });
}

async function deleteEventImage(req, res) {
  let { imageId } = req.body;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let guesthouse = await Guesthouse.findOne({ _id: req.params.id });

  if (!guesthouse)
    return res
      .status(404)
      .send({ guestHouse: null, message: messages.en.noRecords });

  let image = guesthouse.events.id(imageId);

  guesthouse.events.pull(image);

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
      Key: image.img.split(".com/").pop(),
    },
    async (data, err) => {
      if (err) {
        console.log(err);
        return res.status(500).send({ err: err });
      }
      if (data) {
        console.log(data);
      }
    }
  );

  await guesthouse.save();

  return res
    .status(404)
    .send({ guestHouse: guesthouse, message: messages.en.deleted });
}

async function deleteGuesthouse(req, res) {
  let guesthouse = await Guesthouse.findOne({ _id: req.params.id });

  if (!guesthouse)
    return res
      .status(404)
      .send({ guestHouse: null, message: messages.en.noRecords });

  let updated = await Guesthouse.findOneAndUpdate(
    { _id: req.params.id },
    { $set: { deleted: true } },
    { new: true }
  );

  return res
    .status(200)
    .send({ guestHouse: updated, message: messages.en.deleted });
}

module.exports = {
  createGuesthouse,
  getGuesthouses,
  getGuesthouseById,
  editGuesthouse,
  deleteGuesthouse,
  deleteEventImage,
};
