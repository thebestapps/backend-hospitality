const Property = require("../Property/Property");
const PropertyBooking = require("./PropertyBooking");
const HoldEvent = require("../../Models/Calendar/HoldEvent");
const messages = require("../../messages.json");
const mongoose = require("mongoose");
const { task } = require("../../dbConnection");
const CONF = require("../../constants");
const { sendByMailGun } = require("../../Services/generalServices");
const {
  sendConfirmationEmail,
  sendBookinGuide,
} = require("../../Services/Emails");
const bookingDetailsService = require("../../Services/propertyBookingPriceDetails");
const checkIfAvailableService = require("../../Services/checkIfDatesAreAvailable.js");

async function getPropertyBookings(req, res) {
  let propertyBookings = await PropertyBooking.find()
    .where("confirmationCode")
    .ne(null)
    .populate("user", "_id fullName")
    .populate("currency", "_id name symbol")
    .populate("property", "_id name")
    .sort("-createdAt");

  if (propertyBookings.length !== 0)
    return res.status(200).send({
      propertyBookings: propertyBookings,
      message: messages.en.getSuccess,
    });

  return res.status(200).send({
    message: messages.en.noRecords,
    propertyBookings: propertyBookings,
  });
}

async function getPropertyBookingsById(req, res) {
  let bookingId = mongoose.Types.ObjectId(req.params.id);

  let propertyBooking = await PropertyBooking.findOne({
    _id: bookingId,
  })
    .populate("user", "_id fullName")
    .populate("currency", "_id name symbol")
    .populate("property", "_id name");

  if (!propertyBooking)
    res.status(404).send({
      propertyBookings: null,
      message: messages.en.noRecords,
    });

  return res.status(200).send({
    propertyBookings: propertyBooking,
    message: messages.en.getSuccess,
  });
}

async function confirmBooking(req, res) {
  let { bookingId } = req.body;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let booking = await PropertyBooking.findOne({
    _id: mongoose.Types.ObjectId(bookingId),
  }).populate("user");

  if (!booking)
    return res
      .status(404)
      .send({ booking: null, message: messages.en.noRecords });

  booking.isConfirmed = true;
  booking.confirmationCode = `s#${Math.floor(
    10000000 + Math.random() * 9000000
  )}`;

  await booking.save();

  sendByMailGun(
    [booking.user.email, CONF.EMAIL],
    "Booking is confirmed",
    "booking",
    null,
    sendConfirmationEmail(booking)
  );

  return res
    .status(200)
    .send({ isConfirmed: true, message: messages.en.updateSucces });
}

async function createBooking(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let { propertyId, numberOfGuests, checkInDate, checkOutDate, user } =
    req.body;
  let availableFilter = {
    property: propertyId,
    isCancelled: false,
    isConfirmed: true,
    $or: [
      {
        checkInDate: { $lte: new Date(checkInDate).toISOString() },
        checkOutDate: { $gte: new Date(checkInDate).toISOString() },
      },
      {
        checkInDate: { $lte: new Date(checkOutDate).toISOString() },
        checkOutDate: { $gte: new Date(checkOutDate).toISOString() },
      },
      {
        checkInDate: { $gt: new Date(checkInDate).toISOString() },
        checkOutDate: { $lt: new Date(checkOutDate).toISOString() },
      },
    ],
  };

  let property = await Property.findOne({
    _id: mongoose.Types.ObjectId(propertyId),
  });

  if (!property)
    return res
      .status(404)
      .send({ property: null, message: messages.en.noRecords });

  if (!user)
    return res.status(200).send({
      user: null,
      isAvailable: false,
      message: "User is required",
    });

  const { bookingDetails } = bookingDetailsService(
    property,
    checkInDate,
    checkOutDate
  );

  let holdDates = await HoldEvent.find({
    stay: mongoose.Types.ObjectId(propertyId),
  });

  let bookings = await PropertyBooking.find(availableFilter);

  const { isAvailable, message } = checkIfAvailableService(
    holdDates,
    bookings,
    property,
    checkInDate,
    checkOutDate
  );

  if (!isAvailable)
    return res.status(200).send({
      isAvailable: false,
      message: !message ? messages.en.NotAvailable : message,
    });

  let totalGuests =
    numberOfGuests.adults + numberOfGuests.infants + numberOfGuests.childrens;

  if (!(property.numberOfGuests.maximum >= totalGuests))
    return res.status(400).send({
      isAvailabe: false,
      message: `maximum number of guests is ${property.numberOfGuests.maximum}`,
    });

  if (property.numberOfGuests.minimum > totalGuests)
    return res.status(400).send({
      isAvailabe: false,
      message: `minimum number of guests is ${property.numberOfGuests.minimum} `,
    });

  req.body.nights = bookingDetails.priceDetails.numberOfNights;
  req.body.discount = bookingDetails.priceDetails.discount;
  req.body.cleanFeas = bookingDetails.priceDetails.cleanFeas;
  req.body.pricePerNight = bookingDetails.priceDetails.pricePerNight;
  req.body.priceForNumberOfNights =
    bookingDetails.priceDetails.priceForNumberOfNights;
  req.body.totalPrice = bookingDetails.priceDetails.totalPrice;
  req.body.property = property._id;
  req.body.currency = property.price.currency;
  req.body.isPaid = false;
  req.body.isConfirmed = true;
  req.body.confirmationCode = `s#${Math.floor(
    10000000 + Math.random() * 9000000
  )}`;

  let newPropertyBooking = new PropertyBooking(req.body);

  let updatedProperty = property.toObject();
  updatedProperty.popularityCounter++;

  let newHoldDates = new HoldEvent({
    stay: property._id,
    stayBooking: newPropertyBooking._id,
    holdDates: getDatesBetweenDates(
      newPropertyBooking.checkInDate,
      newPropertyBooking.checkOutDate
    ),
  });

  task.save(newHoldDates);

  task.save(newPropertyBooking);

  task.update(property, updatedProperty).options({ viaSave: true });

  task.run({ useMongoose: true });

  res.status(200).send({
    newPropertyBooking: newPropertyBooking,
    isAvailabe: true,
    message: messages.en.addSuccess,
  });
}

module.exports = {
  confirmBooking,
  getPropertyBookings,
  getPropertyBookingsById,
  createBooking,
};
