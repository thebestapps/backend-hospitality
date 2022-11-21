const PropertyInquiry = require("./PropertyInquiry");
const messages = require("../../messages.json");

async function createPropertyInquiry(req, res) {
  const newInquiry = new PropertyInquiry(req.body);

  await newInquiry.save();

  return res
    .status(200)
    .send({ inquiry: newInquiry, message: messages.en.addSuccess });
}

async function getInquiries(req, res) {
  let inquiries = await PropertyInquiry.find();

  return res
    .status(200)
    .send({ inquiries: inquiries, message: messages.en.getSuccess });
}

async function getInquiryById(req, res) {
  let inquiry = await PropertyInquiry.findOne({ _id: req.params.id });

  if (!inquiry)
    return res
      .status(404)
      .send({ inquiry: null, message: messages.en.noRecords });

  return res
    .status(200)
    .send({ inquiry: inquiry, message: messages.en.getSuccess });
}

async function approveInquiry(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let inquiry = await PropertyInquiry.findOne({ _id: req.params.id });

  if (!inquiry)
    return res
      .status(404)
      .send({ inquiry: null, message: messages.en.noRecords });

  inquiry.approved = true;
  await inquiry.save();

  return res
    .status(200)
    .send({ inquiry: inquiry, message: messages.en.updateSucces });
}

async function deleteInquiry(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let inquiry = await PropertyInquiry.findOne({ _id: req.params.id });

  if (!inquiry)
    return res
      .status(404)
      .send({ inquiry: null, message: messages.en.noRecords });

  let deleted = await PropertyInquiry.findOneAndDelete({ _id: req.params.id });

  return res
    .status(200)
    .send({ inquiry: deleted, message: messages.en.deleted });
}

module.exports = {
  createPropertyInquiry,
  getInquiries,
  getInquiryById,
  approveInquiry,
  deleteInquiry,
};

//var express = require('express');
//var router = express.Router();
//const PropertyInquiry = require('./PropertyInquiry');
//const nodemailer = require("nodemailer");
//var path = require('path')
//var Handlebars = require('handlebars');
//var fs = require('fs');
//const _ = require('lodash');
//const Property = require('../Property/Property');
//const HoldEvent = require('../Calendar/HoldEvent');
//
//
//var transporter = nodemailer.createTransport({
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
//const Utils = require('../../Utils');
//
//sendPropertyMail = async (fullName, email, phoneNumber, stay, checkInDate, checkOutDate, numberOfGuests, target, targetemail) => {
//    var source = await fs.readFileSync(path.join(__dirname, '../../Email/stay-booking-template.html'), 'utf8');
//    var template = await Handlebars.compile(source);
//    var options = {
//        from: 'replyn85@gmail.com',
//        to: targetemail,
//        subject: 'Cheez Stay Inquiry',
//        html: template({
//            fullName: fullName,
//            email: email,
//            phoneNumber: phoneNumber,
//            stay: stay,
//            checkInDate: checkInDate,
//            checkOutDate: checkOutDate,
//            numberOfGuests: numberOfGuests,
//            target: target
//        })
//    }
//    transporter.sendMail(options, function (error, response) {
//        if (error) {
//            console.log(error);
//            callback(error);
//        }
//        return true
//    })
//}
//async function createPropertyInquiry(req, res) {
//    var checkIn = new Date(req.body.checkInDate);
//    var checkOut = new Date(req.body.checkOutDate);
//    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
//
//
//    targetemail = "info@cheezhospitality.com"
//    var newPropertyInquiry = new PropertyInquiry();
//    req.body.status = "New"
//    newPropertyInquiry.setPropertyInquiry(req.body);
//    await newPropertyInquiry.save();
//    var createdPropertyInquiry = await PropertyInquiry.findOne({ _id: newPropertyInquiry._id }).populate('stay');
//    // if (createdPropertyInquiry.stay.name.includes("Iskandar")) {
//    //     targetemail = "iskandar@cheezhospitality.com"
//    // }
//    target = "https://admin.cheezhospitality.com/#/stays/inquiries/" + createdPropertyInquiry._id
//
//
//    sendPropertyMail(createdPropertyInquiry.fullName,createdPropertyInquiry.email,createdPropertyInquiry.phoneNumber,createdPropertyInquiry.stay.name ,checkIn.toLocaleDateString(undefined, dateOptions) , checkOut.toLocaleDateString(undefined, dateOptions) ,createdPropertyInquiry.numberOfGuests, target, targetemail).then(sent=>{
//        console.log("New property Inquiry created", newPropertyInquiry);
//        res.status(200).send(newPropertyInquiry);
//        error=>
//        {
//            console.log(error);
//            return res.status(500).send("error sending email", error)
//        }
//
//    })
//
//}
//
//async function getPropertyInquiries(req, res) {
//    var propertyInquiries;
//    try {
//        if (req.params.id) {
//            var query = { _id: req.params.id };
//            propertyInquiries = await PropertyInquiry.findOne(query).populate('stay','name');
//            console.log(propertyInquiries)
//        }
//        else {
//            propertyInquiries = await PropertyInquiry.find({}).populate('stay','name').sort({createdAt: -1});
//        }
//        if (propertyInquiries)
//            res.status(200).send(propertyInquiries);
//        else
//            res.status(200).send({ "message": "No propertyInquiries" });
//    }
//    catch (error) {
//        res.status(500).send({ "message": error.message });
//    }
//};
//
//async function getMostInquiredStays(req,res){
//
//    var propertyInquiries;
//    var last30daysDate = new Date();
//    //LAST 30 DAYS
//    last30daysDate.setDate(last30daysDate.getDate() - 30);
//    try {
//        propertyInquiries = await PropertyInquiry.find({"createdAt" : { $gte : last30daysDate }}).populate('stay','name').select('stay').sort({createdAt: -1});
//
//        var inquiriesData = propertyInquiries.filter(p=> {
//            if (!p.stay) {
//              return false; // skip
//            }
//            return true;
//          }).map(p=> { return p.stay.name });
//        var result = _.values(_.groupBy(inquiriesData)).map(d => ({name: d[0], count: d.length}));
//        result = _.sortBy(result,"count")
//        res.status(200).send(result.reverse());
//    }
//    catch (error) {
//        res.status(500).send({ "message": error.message });
//    }
//}
//
//async function updatePropertyInquiry(req, res) {
//    var inquiry = await PropertyInquiry.findOne({_id:req.params.id});
//    if (inquiry == undefined || inquiry == null) {
//        status = 422;
//        message ="ERROR -- inquiry not found";
//        return res.status(status).send(message);
//    } else {
//        var updated = await PropertyInquiry.update({_id:req.params.id}, req.body)
//        var blockedDates = Utils.getDates(inquiry.checkInDate,inquiry.checkOutDate)
//        if(req.body.status === "Booked"){
//            await Property.findOneAndUpdate({ _id: inquiry.stay },
//            { $push: { blockedDates: blockedDates } })
//        }
//        else if(req.body.status === "Canceled"){
//            await Property.findOneAndUpdate({ _id: inquiry.stay },
//            { $pullAll: { blockedDates: blockedDates } })
//        }
//        return res.status(200).send(updated)
//    }
//};
//
//async function getNbOfInquiriesLast30Days(req, res) {
//    var propertyInquiries;
//    var last30daysDate = new Date();
//    //LAST 30 DAYS
//    last30daysDate.setDate(last30daysDate.getDate() - 30);
//    try {
//        nbOfInquiries = await PropertyInquiry.countDocuments({"createdAt" : { $gte : last30daysDate }})
//
//        res.status(200).send({nb:nbOfInquiries});
//    }
//    catch (error) {
//        res.status(500).send({ "message": error.message });
//    }
//};
//
//async function getTodaysData(req, res) {
//    var today = {
//        $gte: new Date(new Date().setHours(00, 00, 00)),
//        $lt: new Date(new Date().setHours(23, 59, 59))
//    }
//
//    try {
//        checkinsNb = await PropertyInquiry.countDocuments({"status":"Booked","checkInDate" :today});
//        checkoutsNb = await PropertyInquiry.countDocuments({"status":"Booked","checkOutDate" : today});
//        checkinStays = await PropertyInquiry.find({"status":"Booked","checkInDate" :today}).populate('stay','name').select('_id stay');
//        checkoutStays = await PropertyInquiry.find({"status":"Booked","checkOutDate" : today}).populate('stay','name').select('_id stay');
//        occupiedStays =  await PropertyInquiry.find({"status":"Booked","checkInDate" : {
//            $lt: new Date(new Date().setHours(00, 00, 00)),
//        },
//        "checkOutDate" : {
//            $gte: new Date(new Date().setHours(23, 59, 59))
//        }}).populate('stay','name').select('_id stay fullName');
//        res.status(200).send({
//            checkinsNb:checkinsNb,
//            checkoutsNb:checkoutsNb,
//            checkinStays:checkinStays,
//            checkoutStays:checkoutStays,
//            occupiedStays: occupiedStays
//        });
//    }
//    catch (error) {
//        res.status(500).send({ "message": error.message });
//    }
//};
//
//async function getInquiriesForCalendar(req,res){
//
//    var propertyInquiries;
//    try {
//        propertyInquiries = await PropertyInquiry.find({"status" : "Booked"}).populate('stay','name').select('_id fullName stay checkInDate checkOutDate').sort({createdAt: -1});
//
//
//        res.status(200).send(propertyInquiries);
//    }
//    catch (error) {
//        res.status(500).send({ "message": error.message });
//    }
//}
//
//
//async function holdDatesForProperty(req,res){
//    try {
//        const datesArray = req.body.datesArray;
//
//        var updatedProperty = await Property.findOneAndUpdate({ _id: req.body.id },
//            { $push: { blockedDates: datesArray } })
//
//        res.status(200).send(updatedProperty);
//    }
//    catch (error) {
//        res.status(500).send({ "message": error.message });
//    }
//}
//
//async function unholdDatesForProperty(req,res){
//    try {
//        const datesArray = req.body.datesArray
//        var updatedProperty = await Property.findOneAndUpdate({ _id: req.body.id },
//            { $pullAll: { blockedDates: datesArray } })
//
//        res.status(200).send(updatedProperty);
//    }
//    catch (error) {
//        res.status(500).send({ "message": error.message });
//    }
//}
//
//
//async function deletePropertyInquiry(req,res){
//    var inquiry = await PropertyInquiry.findOne({_id:req.params.id});
//    if (inquiry == undefined || inquiry == null) {
//        console.log("ERROR -- Inquiry not found");
//        status = 422;
//        return res.status(status).send({"error":"error deleting inquiry"});
//    } else {
//        var deleted = await PropertyInquiry.deleteOne({_id:req.params.id})
//        return res.status(200).send(deleted)
//    }
//}
//
//module.exports = { createPropertyInquiry, getPropertyInquiries, updatePropertyInquiry, getMostInquiredStays,getNbOfInquiriesLast30Days , getTodaysData, getInquiriesForCalendar, holdDatesForProperty, unholdDatesForProperty,deletePropertyInquiry};
