const TourInquiry = require("./TourInquiry");
const { City } = require("../City/City");
const mongoose = require("mongoose");
const messages = require("../../messages.json");
const { sendByMailGun } = require("../../Services/generalServices");
const { sendCreateJournyEmail } = require("../../Services/Emails");
const CONF = require("../../constants");

async function createTourInquiry(req, res) {
  let {
    destinations,
    type,
    numberOfGuests,
    budget,
    description,
    startDate,
    accomodation,
    accomodationType,
    numberOfBedrooms,
    endDate,
    isCustomized,
    vehicle,
    driver,
    status,
  } = req.body;

  let cities = await City.find({ _id: { $in: destinations } });

  if (cities.length === 0)
    return res.status(200).send({ cities: [], message: messages.en.noRecords });

  let tourInquiry = new TourInquiry(req.body);

  sendByMailGun(
    CONF.EMAIL,
    "New Journy Inquery",
    "Inquery",
    null,
    sendCreateJournyEmail(req.body, cities)
  );

  await tourInquiry.save();

  return res
    .status(200)
    .send({ tourInquiry: tourInquiry, message: messages.en.addSuccess });
}

async function getTourInquiries(req, res) {
  if (req.params.id) {
    let tourInquiry = await TourInquiry.findOne({
      _id: mongoose.Types.ObjectId(req.params.id),
    }).populate("destinations", "_id name");

    if (!tourInquiry)
      return res
        .status(404)
        .send({ tourInquiry: null, message: messages.en.noRecords });

    return res
      .status(200)
      .send({ tourInquiry: tourInquiry, message: messages.en.getSuccess });
  } else {
    let tourInquiries = await TourInquiry.find();

    return res
      .status(200)
      .send({ tourInquiries: tourInquiries, message: messages.en.getSuccess });
  }
}

async function updateTourInquiry(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let tourInquiry = await TourInquiry.findOne({
    _id: mongoose.Types.ObjectId(req.params.id),
  });

  if (!tourInquiry)
    return res.status(404).send({
      tourInquiry: tourInquiry,
      message: messages.en.noRecords,
    });

  let updated = await TourInquiry.findOneAndUpdate(
    {
      _id: mongoose.Types.ObjectId(req.params.id),
    },
    { $set: req.body },
    { new: true }
  );

  return res
    .status(200)
    .send({ tourInquiry: updated, message: messages.en.updateSucces });
}

async function deleteTourInquiry(req, res) {
  let tourInquiry = await TourInquiry.findOne({
    _id: mongoose.Types.ObjectId(req.params.id),
  });

  if (!tourInquiry)
    return res.status(404).send({
      tourInquiry: tourInquiry,
      message: messages.en.noRecords,
    });

  let deleted = await TourInquiry.findOneAndDelete({
    _id: mongoose.Types.ObjectId(req.params.id),
  });

  return res
    .status(200)
    .send({ tourInquiry: deleted, message: messages.en.deleted });
}

module.exports = {
  createTourInquiry,
  getTourInquiries,
  updateTourInquiry,
  deleteTourInquiry,
};
//var express = require('express');
//var router = express.Router();
//var TourInquiry = require('./TourInquiry');
//const nodemailer = require("nodemailer");
//var path = require('path')
//var Handlebars = require('handlebars');
//var fs = require('fs');
//var Tour = require('../Tour/Tour')
//const Utils = require('../../Utils');
//
//var tourTransporter = nodemailer.createTransport({
//    service: 'gmail',
//    secure: false,
//    port: 25,
//    auth: {
//        user: 'replyn85@gmail.com',
//        pass: 'fadeljoe'
//    },
//    tls: {
//        rejectUnauthorized: false
//    }
//});
//
//sendMail = async (fullName,email,phoneNumber,tour,date,numberOfGuests,target) => {
//    var source = await fs.readFileSync(path.join(__dirname, '../../Email/tour-booking-template.html'), 'utf8');
//    var template = await Handlebars.compile(source);
//    var options = {
//        from: 'replyn85@gmail.com',
//        to: 'info@cheezhospitality.com',
//        subject: 'Cheez Tour Inquiry',
//        html: template({
//           fullName: fullName,
//           email: email,
//           phoneNumber:phoneNumber,
//           tour:tour,
//           date:date,
//           numberOfGuests: numberOfGuests,
//           target: target
//        }) // Process template with locals - {passwordResetAddress}
//    }
//    tourTransporter.sendMail(options, function (error, response) {
//        if (error) {
//            console.log(error);
//            callback(error);
//        }
//    })
//}
//
//async function createTourInquiry(req, res) {
//    var newTourInquiry = new TourInquiry();
//    req.body.status = "New"
//    newTourInquiry.setTourInquiry(req.body);
//    await newTourInquiry.save();
//    var createdTourInquiry = await TourInquiry.findOne({ _id: newTourInquiry._id }).populate('tour');
//    target = "https://admin.cheezhospitality.com/#/tours/inquiries/"+ createdTourInquiry._id
//    var email = await sendMail(createdTourInquiry.fullName,createdTourInquiry.email,createdTourInquiry.phoneNumber,createdTourInquiry.tour.title ,createdTourInquiry.date,createdTourInquiry.numberOfGuests, target)
//
//    console.log("Tour Inquiry successfully created");
//    res.status(200).send(newTourInquiry);
//}
//
//
//async function getTourInquiries(req, res) {
//    var tourInquiries;
//    try {
//        if (req.params.id) {
//            var query = { _id: req.params.id };
//            tourInquiries = await TourInquiry.findOne(query).populate('tour');
//        }
//        else {
//            tourInquiries = await TourInquiry.find({}).populate('tour').sort({createdAt: -1})
//        }
//        if (tourInquiries)
//            res.status(200).send(tourInquiries);
//        else
//            res.status(200).send({ "message": "No tour bookings" });
//    }
//    catch (error) {
//        res.status(500).send({ "message": error.message });
//    }
//};
//
//async function updateTourInquiry(req, res) {
//    var inquiry = await TourInquiry.findOne({_id:req.params.id});
//    if (inquiry == undefined || inquiry == null) {
//        console.log("ERROR -- inquiry not found");
//        status = 422;
//        response.message = msg;
//        return res.status(status).send(response);
//    } else {
//        var updated = await TourInquiry.update({_id:req.params.id}, req.body)
//        var blockedDates = Utils.getDates(inquiry.checkInDate,inquiry.checkOutDate)
//        if(req.body.status === "Booked"){
//            await Tour.findOneAndUpdate({ _id: inquiry.stay },
//            { $push: { blockedDates: blockedDates } })
//        }
//        else if(req.body.status === "Canceled"){
//            await Tour.findOneAndUpdate({ _id: inquiry.stay },
//            { $pullAll: { blockedDates: blockedDates } })
//        }
//        return res.status(200).send(updated)
//    }
//};
//
//
//async function getInquiriesForCalendar(req,res){
//
//    var tourInquiries;
//    try {
//        tourInquiries = await TourInquiry.find({"status" : "Booked"}).populate('tour','name').select('_id fullName tour date vehicle').sort({createdAt: -1});
//        res.status(200).send(tourInquiries);
//    }
//    catch (error) {
//        res.status(500).send({ "message": error.message });
//    }
//}
//
//async function holdDatesForTour(req,res){
//    try {
//        const datesArray = req.body.datesArray;
//
//        var updatedTour= await Tour.findOneAndUpdate({ _id: req.body.id },
//            { $push: { blockedDates: datesArray } })
//
//        res.status(200).send(updatedTour);
//    }
//    catch (error) {
//        res.status(500).send({ "message": error.message });
//    }
//}
//
//async function unholdDatesForTour(req,res){
//    try {
//        const datesArray = req.body.datesArray
//        var updatedTour= await Tour.findOneAndUpdate({ _id: req.body.id },
//            { $pullAll: { blockedDates: datesArray } })
//
//        res.status(200).send(updatedTour);
//    }
//    catch (error) {
//        res.status(500).send({ "message": error.message });
//    }
//}
//
//async function deleteTourInquiry(req,res){
//    var inquiry = await TourInquiry.findOne({_id:req.params.id});
//    if (inquiry == undefined || inquiry == null) {
//        console.log("ERROR -- Inquiry not found");
//        status = 422;
//        return res.status(status).send({"error":"error deleting inquiry"});
//    } else {
//        var deleted = await TourInquiry.deleteOne({_id:req.params.id})
//        return res.status(200).send(deleted)
//    }
//}
//module.exports = { createTourInquiry, getTourInquiries, updateTourInquiry, getInquiriesForCalendar,holdDatesForTour, unholdDatesForTour, deleteTourInquiry }
