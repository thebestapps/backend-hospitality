const Guest = require("./Guests");
const Property = require("../Property/Property");
const PropertyBooking = require("../PropertyBooking/PropertyBooking");
const messages = require("../../messages.json");
const mongoose = require("mongoose");

async function addStayBookingGuests(req, res) {
  let { bookingId, guestsInfo } = req.body;
  let data = [];

  let booking = await PropertyBooking.findOne({
    _id: mongoose.Types.ObjectId(bookingId),
  });

  if (!booking)
    return res.status(200).send({ guests: [], message: messages.en.add });

  if (guestsInfo)
    guestsInfo.forEach((element) => {
      data.push({
        stayBooking: bookingId,
        fullName: element.fullName,
        gender: element.gender,
        birthday: element.birthday,
        nationality: element.nationality,
        address: element.address,
        city: element.city,
        country: element.country,
        DocumentType: element.DocumentType,
        document: element.document,
        isMainGuest: element.isMainGuest,
      });
    });

  let guests = await Guest.create(data);

  console.log("gggg", guests);

  return res
    .status(200)
    .send({ guests: guests, message: messages.en.getSuccess });
}

async function getGuestsInfo(req, res) {
  let { bookingId } = req.query;

  let booking = await PropertyBooking.findOne({
    _id: mongoose.Types.ObjectId(bookingId),
  });

  if (!booking)
    return res.status(200).send({ guests: [], message: messages.en.add });

  let guests = await Guest.find({
    stayBooking: mongoose.Types.ObjectId(bookingId),
  })
    .populate({
      path: "stayBooking",
      select: "_id property confirmationCode",
      populate: { path: "property", select: "_id name" },
    })
    .sort("-createdAt");

  return res
    .status(200)
    .send({ guests: guests, message: messages.en.getSuccess });
}

async function getMainGuests(req, res) {
  let data = [];
  let guests = await Guest.find({
    isMainGuest: true,
  })
    .populate({
      path: "stayBooking",
      populate: {
        path: "property",
        select: "_id name",
      },
    })
    .sort("-createdAt");

  if (guests.length !== 0)
    guests.forEach((item) => {
      data.push({
        _id: item._id,
        bookingId: item.stayBooking._id,
        confirmationCode: item.stayBooking.confirmationCode,
        fullName: item.fullName,
        checkInDate: item.stayBooking.checkInDate,
        property: item.stayBooking.property,
      });
    });

  return res
    .status(200)
    .send({ guests: data, message: messages.en.getSuccess });
}

module.exports = { addStayBookingGuests, getGuestsInfo, getMainGuests };
