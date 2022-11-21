const mongoose = require("mongoose");
const Tour = require("../Tour/Tour");
const TourBooking = require("./TourBooking");
const messages = require("../../messages.json");
const { sendByMailGun } = require("../../Services/generalServices");
const CONF = require("../../constants");

async function getTourBookings(req, res) {
  let tourBookings = await TourBooking.find({})
    .where("confirmationCode")
    .ne(null)
    .populate("user", "_id fullName")
    .populate("tourDateId", "_id departureTime returnTime day")
    .populate("currency", "_id name symbol")
    .populate("tour", "_id title images")
    .sort("-createdAt");

  if (tourBookings.length !== 0)
    return res
      .status(200)
      .send({ tourBookings: tourBookings, message: messages.en.getSuccess });

  return res
    .status(200)
    .send({ tourBookings: tourBookings, message: messages.en.noRecords });
}

async function getTourBookingById(req, res) {
  let tourBooking = await TourBooking.findOne({ _id: req.params.id })
    .populate("user", "_id fullName")
    .populate("tourDateId", "_id departureTime returnTime day")
    .populate("currency", "_id name symbol")
    .populate("tour", "_id title images");

  if (!tourBooking)
    return res
      .status(404)
      .send({ tourBooking: null, message: messages.en.noRecords });

  return res
    .status(200)
    .send({ tourBooking: tourBooking, message: messages.en.noRecords });
}

async function confirmBooking(req, res) {
  let { bookingId } = req.body;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let booking = await TourBooking.findOne({
    _id: mongoose.Types.ObjectId(bookingId),
  }).populate("user");

  if (!booking)
    return res
      .status(404)
      .send({ booking: null, message: messages.en.noRecords });

  booking.isConfirmed = true;
  booking.confirmationCode = `t#${Math.floor(
    10000000 + Math.random() * 9000000
  )}`;
  await booking.save();

  sendByMailGun(
    [booking.user.email, CONF.EMAIL],
    "Booking is confirmed",
    "Booking",
    null,
    `Your Cheez-Hospitality booking has been confirmed successfuly:
      Tour: ${booking.tour.title}
      Day: ${new Date(booking.tourDateId.day).toLocaleDateString()}
      Confirmation Code: ${booking.confirmationCode}`
  );

  return res
    .status(200)
    .send({ isConfirmed: true, message: messages.en.updateSucces });
}
module.exports = { getTourBookings, getTourBookingById, confirmBooking };
