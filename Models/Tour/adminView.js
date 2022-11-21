const Tour = require("./Tour");
const TourDates = require("../../Models/TourDates/TourDates");
const messages = require("../../messages.json");
const mongoose = require("mongoose");
const { Currency } = require("../Currency/Currency");
const CONF = require("../../constants");
const AWS = require("aws-sdk");
const fs = require("fs");

async function createTour(req, res) {
  try {
    let { title } = req.body;

    if (req.user.role === 0)
      return res
        .status(401)
        .send({ unAutherized: true, message: messages.en.forbidden });

    req.body.urlName = title.replace(/\s+/g, "-");
    const newTour = new Tour(req.body);
    //newTour.setTour(req.body);
    await newTour.save();
    console.log("Tour successfully created");
    res.status(200).send({ tour: newTour });
  } catch (err) {
    return res.status(400).send({ message: err });
  }
}

async function createTourDates(req, res) {
  let { tourId, dates, info } = req.body;
  let data = [];

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let tour = await Tour.findOne({ _id: mongoose.Types.ObjectId(tourId) });
  if (!tour)
    return res.status(404).send({ tour: null, message: messages.en.noRecords });

  if (dates || dates.length !== 0)
    dates.forEach((item) => {
      data.push({
        tour: tourId,
        day: new Date(new Date(item).toJSON().slice(0, 10) + "T00:00:00.000Z"),
        numberOfGuests: !info.numberOfGuests
          ? tour.numberOfGuests
          : info.numberOfGuests,
        price: !info.price ? tour.price : info.price,
        departureTime: info.departureTime,
        returnTime: info.returnTime,
      });
    });

  let tourDates = await TourDates.create(data);

  return res
    .status(200)
    .send({ tourDates: tourDates, message: messages.en.addSuccess });
}

async function getTours(req, res) {
  var tours;
  try {
    if (req.params.urlName) {
      var query = {
        urlName: req.params.urlName,
        deleted: false,
      };
      tours = await Tour.findOne(query)
        .populate("price.currency", "_id name symbol")
        .populate("category", "_id name")
        .populate("highlights", "_id name")
        .populate("included", "_id name")
        .populate("area", "_id name")
        .populate("city", "_id name")
        .populate("country", "_id name");
    } else {
      tours = await Tour.find({ deleted: false })
        .populate("price.currency", "_id name symbol")
        .populate("category", "_id name")
        .populate("highlights", "_id name")
        .populate("included", "_id name")
        .populate("area", "_id name")
        .populate("city", "_id name")
        .populate("country", "_id name");
    }
    if (tours) res.status(200).send(tours);
    else res.status(200).send({ message: "No tours" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
}

async function getTourById(req, res) {
  let tourId = mongoose.Types.ObjectId(req.params.id);
  let today = new Date();
  let tourDatesData = [];
  let data;

  let tour = await Tour.findOne({ _id: tourId });

  if (!tour) return res.status(404).send({ message: messages.en.noRecords });

  let tourDates = await TourDates.find({ tour: tour._id, deleted: false });

  if (tourDates.length !== 0)
    tourDates.forEach((item) => {
      if (new Date(item.day).setHours(0, 0, 0, 0) <= today.setHours(0, 0, 0, 0))
        return;
      else tourDatesData.push(item);
    });

  data = tour.toObject();
  data.tourDates = tourDatesData;

  return res.status(200).send({
    tour: data,
    message: messages.en.getSuccess,
  });
}

async function editTour(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  var tour = await Tour.findOne({
    _id: req.params.id,
    deleted: false,
  });

  if (!tour)
    return res.status(404).send({ tour: null, message: messages.en.noRecords });

  let updated = await Tour.findOneAndUpdate(
    { _id: req.params.id },
    { $set: req.body },
    { new: true }
  );

  return res
    .status(200)
    .send({ tour: updated, message: messages.en.updateSucces });
}

async function deleteTour(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  var tour = await Tour.findOne({
    _id: req.params.id,
    deleted: false,
    enabled: true,
  });

  if (!tour)
    return res.status(404).send({ tour: null, message: messages.en.noRecords });

  let updated = await Tour.findOneAndUpdate(
    { _id: req.params.id },
    { $set: { deleted: true, enabled: false } },
    { new: true }
  );
  return res.status(200).send({ tour: updated, message: messages.en.deleted });
}

async function editTourDate(req, res) {
  let { tourDateId } = req.body;

  let tourDate = await TourDates.findOne({ _id: tourDateId });

  if (!tourDate)
    return res
      .status(404)
      .send({ tourDate: null, message: messages.en.noRecords });

  let updated = await TourDates.findOneAndUpdate(
    { _id: tourDateId },
    { $set: req.body },
    { new: true }
  );

  return res
    .status(200)
    .send({ tourDate: updated, message: messages.en.updateSucces });
}

async function deleteDate(req, res) {
  let { tourDateId } = req.body;

  let tourDate = await TourDates.findOne({ _id: tourDateId });

  if (!tourDate)
    return res
      .status(404)
      .send({ tourDate: null, message: messages.en.noRecords });

  let deleted = await TourDates.findOneAndUpdate(
    { _id: tourDateId },
    { $set: { deleted: true } },
    { new: true }
  );

  return res
    .status(200)
    .send({ tourDate: deleted, message: messages.en.deleted });
}

async function ConvertCurrency(req, res) {
  let { currencyId } = req.query;
  let tourId = req.params.id;
  let { rate } = req.body;

  tourId = mongoose.Types.ObjectId(tourId);
  currencyId = mongoose.Types.ObjectId(currencyId);

  let currency = await Currency.findOne({ _id: currencyId });
  if (!currency)
    return res.status(404).send({ message: messages.en.noRecords });

  let tour = await Tour.findOne({ _id: tourId, deleted: false, enabled: true });
  if (!tour) return res.status(404).send({ message: messages.en.noRecords });

  let priceInLBP = tour.price.amount.adults * rate;

  return res
    .status(200)
    .send({ priceInLBP: `${priceInLBP} ${currency.symbol}` });
}

async function getToursForCalendar(req, res) {
  var tours;
  try {
    tours = await Tour.find({ deleted: false, enabled: true }).select(
      "_id title price weekendPrice category blockedDates"
    );

    res.status(200).send(tours);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
}

async function deleteAllImages(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let tour = await Tour.findOne({ _id: req.params.id });

  if (!tour)
    return res.status(404).send({ tour: null, message: messages.en.noRecords });

  AWS.config.setPromisesDependency();
  AWS.config.update({
    accessKeyId: CONF.AWS.ID,
    secretAccessKey: CONF.AWS.SECRET,
    region: CONF.AWS.REGION,
  });

  const s3 = new AWS.S3();

  let images = tour.images;

  tour.images = [];

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

  await tour.save();

  return res.status(200).send({ message: messages.en.deleted });
}

module.exports = {
  createTour,
  createTourDates,
  getTours,
  editTour,
  deleteTour,
  getToursForCalendar,
  ConvertCurrency,
  getTourById,
  deleteAllImages,
  editTourDate,
  deleteDate,
};
