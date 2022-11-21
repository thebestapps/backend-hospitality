const Property = require("./Property");
const HoldEvent = require("../Calendar/HoldEvent");
const messages = require("../../messages.json");
const mongoose = require("mongoose");
const { Currency } = require("../Currency/Currency");
const _ = require("lodash");
const CONF = require("../../constants");
const AWS = require("aws-sdk");
const fs = require("fs");

async function getAllWithDates(req, res) {
  let data = [];

  let properties = await Property.find({
    deleted: false,
  })
    .populate("category", "_id name enabled")
    .populate("city", "_id name")
    .populate("area", "_id name description")
    .populate("bedrooms.beds", "_id name enabled")
    .populate("bathrooms.bathType", "_id name enabled")
    .populate("price.currency", "_id name symbol")
    .populate("amenities", "_id name image deleted")
    .populate("rules", "_id name image deleted")
    .populate("highlights", "_id name deleted");

  let dates = await HoldEvent.find({ stay: { $ne: null } }).populate(
    "stayBooking"
  );

  properties.forEach((property) => {
    let blockedDates = [];
    let checkInDates = [];
    let checkOutDates = [];

    dates.forEach((item) => {
      if (property._id.equals(item.stay)) {
        item.holdDates.forEach((date, index) => {
          if (index === item.holdDates.length - 1) return;
          if (index === 0) return;

          blockedDates.push(formatDate(date));
        });

        item.blockedDates.forEach((date) => {
          blockedDates.push(formatDate(date));
        });

        if (item.stayBooking) {
          checkOutDates.push(formatDate(item.stayBooking.checkOutDate));

          checkInDates.push(formatDate(item.stayBooking.checkInDate));
        }
      }
    });

    data.push({
      property: property,
      checkOutDates,
      checkInDates,
      blockedDates,
    });
  });

  return res
    .status(200)
    .send({ properties: data, message: messages.en.getSuccess });
}

async function getProperties(req, res) {
  let properties;
  let blockedDates = [];
  let checkInDates = [];
  let checkOutDates = [];

  try {
    if (req.params.urlName) {
      var query = {
        urlName: req.params.urlName,
        deleted: false,
      };
      properties = await Property.findOne(query);
    }
    if (req.params.id) {
      properties = await Property.find({
        _id: req.params.id,
        deleted: false,
      })
        .populate("category", "_id name enabled")
        .populate("city", "_id name")
        .populate("area", "_id name description")
        .populate("bedrooms.beds", "_id name enabled")
        .populate("bathrooms.bathType", "_id name enabled")
        .populate("price.currency", "_id name symbol")
        .populate("amenities", "_id name image deleted")
        .populate("rules", "_id name image deleted")
        .populate("highlights", "_id name deleted");

      let dates = await HoldEvent.find({
        stay: req.params.id,
      }).populate("stayBooking");

      if (dates.length !== 0) {
        dates.forEach((item) => {
          item.holdDates.forEach((date, index) => {
            if (index === item.holdDates.length - 1) return;
            if (index === 0) return;

            blockedDates.push(formatDate(date));
          });

          item.blockedDates.forEach((date) => {
            blockedDates.push(formatDate(date));
          });
        });

        dates.forEach((item) => {
          if (item.stayBooking) {
            checkOutDates.push(formatDate(item.stayBooking.checkOutDate));

            checkInDates.push(formatDate(item.stayBooking.checkInDate));
          }
        });
      }
    } else {
      properties = await Property.find({ deleted: false })
        .select(
          "_id name images price priceAccordingToWeekDays priceAccordingToWeekends city enabled deleted"
        )
        .populate("category", "_id name")
        .populate("city", "_id name")
        .populate("price.currency", "_id name symbol");
    }

    if (properties.length === 0)
      return res.status(200).send({ properties: [], message: "No properties" });

    return res.status(200).send({
      properties: properties,
      checkInDates: checkInDates,
      checkOutDates: checkOutDates,
      blockedDates: blockedDates,
      message: messages.en.getSuccess,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
}

async function createProperty(req, res) {
  let { name } = req.body;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  req.body.urlName = name.replace(/\s+/g, "-");
  req.body.stayers = `${
    req.body.numberOfGuests.adults +
    req.body.numberOfGuests.childrens +
    req.body.numberOfGuests.infants
  }`;
  var newProperty = new Property(req.body);
  //newProperty.setProperty(req.body);
  await newProperty.save();
  console.log("New property created", newProperty);
  return res.status(200).send(newProperty);
}

async function duplicateProperty(req, res) {
  let propertyId = mongoose.Types.ObjectId(req.params.id);

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let property = await Property.findById(propertyId);

  if (!property)
    return res.status(404).send({ message: messages.en.noRecords });

  let duplicate = new Property(property);
  duplicate._id = mongoose.Types.ObjectId();
  duplicate.enabled = false;
  duplicate.isNew = true;
  await duplicate.save();

  return res
    .status(200)
    .send({ property: duplicate, message: messages.en.addSuccess });
}

async function editProperty(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let property = await Property.findOne({
    _id: req.params.id,
    deleted: false,
  });

  if (!property)
    return res
      .status(404)
      .send({ property: null, message: messages.en.noRecords });

  if (req.body.name) req.body.urlName = req.body.name.replace(/\s+/g, "-");

  let updated = await Property.findOneAndUpdate(
    { _id: req.params.id, deleted: false },
    { $set: req.body },
    { new: true }
  );

  return res
    .status(200)
    .send({ property: updated, message: messages.en.updateSucces });
}

async function deleteProperty(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let property = await Property.findOne({ _id: req.params.id });
  if (!property)
    return res
      .status(404)
      .send({ property: null, message: messages.en.noRecords });

  let deleted = await Property.findOneAndUpdate(
    { _id: req.params.id },
    { $set: { deleted: true } },
    { new: true }
  );
  return res
    .status(200)
    .send({ property: deleted, message: messages.en.deleted });
}

async function SetRateByDateRanges(req, res) {
  let propertyId = mongoose.Types.ObjectId(req.params.id);

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let property = await Property.findOneAndUpdate(
    { _id: propertyId },
    { $push: { rateAccordingToDate: req.body } },
    { new: true }
  );

  if (!property)
    return res.status(404).send({ message: messages.en.noRecords });

  return res
    .status(200)
    .send({ property: property, message: messages.en.updateSucces });
}

async function SetRateByWeekDays(req, res) {
  let propertyId = mongoose.Types.ObjectId(req.params.id);
  let { rate, dates } = req.body;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let days = [];
  const WeekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const daysNumbers = [1, 2, 3, 4, 5];

  dates.forEach((date) => {
    let convertedDate = new Date(date);
    if (daysNumbers.includes(convertedDate.getDay())) {
      if (days.includes(WeekDays[convertedDate.getDay() - 1])) return;
      days.push(WeekDays[convertedDate.getDay() - 1]);
    }
  });

  let property = await Property.findOneAndUpdate(
    { _id: propertyId },
    { $set: { rateAccordingToWeekDays: { rate: rate, days: days } } },
    { new: true }
  );

  if (!property)
    return res
      .status(404)
      .send({ property: [], message: messages.en.noRecords });

  return res.status(200).send({
    property: _.pick(property, ["_id", "name", "rateAccordingToWeekDays"]),
    message: messages.en.updateSucces,
  });
}

async function SetRateByWeekends(req, res) {
  let propertyId = mongoose.Types.ObjectId(req.params.id);
  let { rate, dates } = req.body;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let days = [];
  const Weekends = ["Sunday", "Saturday"];
  const daysNumbers = [0, 6];

  dates.forEach((date) => {
    let convertedDate = new Date(date);
    if (daysNumbers.includes(convertedDate.getDay())) {
      if (days.includes(Weekends[daysNumbers.indexOf(convertedDate.getDay())]))
        return;
      //Push day with the same index of the day number
      days.push(Weekends[daysNumbers.indexOf(convertedDate.getDay())]);
    }
  });

  let property = await Property.findOneAndUpdate(
    { _id: propertyId },
    { $set: { rateAccordingToWeekends: { rate: rate, days: days } } },
    { new: true }
  );

  if (!property)
    return res
      .status(404)
      .send({ property: [], message: messages.en.noRecords });

  return res.status(200).send({
    property: _.pick(property, ["_id", "name", "rateAccordingToWeekends"]),
    message: messages.en.updateSucces,
  });
}

async function setBlockedDates(req, res) {
  let propertyId = mongoose.Types.ObjectId(req.params.id);
  let { blockedDates } = req.body;
  let data = [];

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  blockedDates.forEach((item) => {
    data.push(new Date(item));
  });

  let property = await Property.findOneAndUpdate(
    { _id: propertyId },
    { $push: { blockedDates: data } },
    { new: true }
  );

  if (!property)
    return res.status(404).send({ message: messages.en.noRecords });

  return res.status(200).send({
    property: _.pick(property, ["_id", "name", "blockedDates"]),
    message: messages.en.updateSucces,
  });
}

async function deleteAllImages(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let property = await Property.findOne({ _id: req.params.id });

  if (!property)
    return res
      .status(404)
      .send({ property: null, message: messages.en.noRecords });

  AWS.config.setPromisesDependency();
  AWS.config.update({
    accessKeyId: CONF.AWS.ID,
    secretAccessKey: CONF.AWS.SECRET,
    region: CONF.AWS.REGION,
  });

  const s3 = new AWS.S3();

  let images = property.images;

  property.images = [];

  images.forEach((image) => {
    s3.deleteObject(
      {
        Bucket: CONF.AWS.BUCKET_NAME,
        Key: image.split(".com/").pop(),
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
  });

  await property.save();

  return res.status(200).send({ message: messages.en.deleted });
}

async function getPropertiesForCalendar(req, res) {
  var properties;
  try {
    properties = await Property.find({}).select(
      "_id name price weekendPrice category blockedDates"
    );

    res.status(200).send(properties);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
}

module.exports = {
  getAllWithDates,
  getProperties,
  createProperty,
  duplicateProperty,
  editProperty,
  deleteProperty,
  SetRateByDateRanges,
  SetRateByWeekDays,
  SetRateByWeekends,
  setBlockedDates,
  deleteAllImages,
  getPropertiesForCalendar,
};
