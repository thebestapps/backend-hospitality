const HoldEvent = require("./HoldEvent");
const Property = require("../Property/Property");
const messages = require("../../messages.json");
const mongoose = require("mongoose");
const PropertyBooking = require("../PropertyBooking/PropertyBooking");
const TourDates = require("../TourDates/TourDates");
const { getDatesBetweenDates } = require("../../Services/generalServices");
const _ = require("lodash");

async function getHoldEvents(req, res) {
  let { stay } = req.query;
  let filter = { stay: { $ne: null } };
  let data = [];

  if (stay) filter.stay = mongoose.Types.ObjectId(stay);

  let holdEvents = await HoldEvent.find(filter)
    .populate({
      path: "stay",
      populate: {
        path: "area",
      },
    })
    .populate({
      path: "stayBooking",
      populate: {
        path: "currency user",
        select: "_id fullName name symbol",
      },
    });

  if (holdEvents.length !== 0)
    holdEvents.forEach((item) => {
      if (item.blockedDates.length === 0) {
        if (!item.stayBooking) return;
        if (item.tourBooking) return;
        if (item.holdDates.length === 0) return;
        if (!item.stayBooking.isConfirmed) return;

        data.push({
          _id: item._id,
          title: `${item.stayBooking.user.fullName.first} ${item.stayBooking.user.fullName.last} `,
          arrivingIn: Math.round(
            (new Date().getTime() - new Date(item.holdDates[0]).getTime()) /
              (1000 * 60 * 60 * 24)
          ),
          startDate: item.holdDates[0],
          endDate: item.holdDates[item.holdDates.length - 1],
          property: item.stay._id,
          name: item.stay.name,
          image: item.stay.images[0],
          guests:
            item.stayBooking.numberOfGuests.adults +
            item.stayBooking.numberOfGuests.childrens +
            item.stayBooking.numberOfGuests.infants,
          price: `${item.stayBooking.totalPrice} ${item.stayBooking.currency.symbol}`,
          area: item.stay.area.name,
        });
      } else {
        data.push({
          _id: item._id,
          title: item.notes,
          startDate: item.blockedDates[0],
          endDate: item.blockedDates[item.blockedDates.length - 1],
          property: item.stay._id,
          notes: item.notes,
        });
      }
    });

  return res
    .status(200)
    .send({ holdEvents: data, message: messages.en.getSuccess });
}

async function getStaysSummury(req, res) {
  let filter = { stay: { $ne: null } };
  let data = [];

  let holdEvents = await HoldEvent.find(filter)
    .populate("stay", "_id blockedDates images")
    .populate({
      path: "stayBooking",
      populate: {
        path: "currency user",
        select: "_id fullName name symbol",
      },
    });

  if (holdEvents.length !== 0)
    holdEvents.forEach((item) => {
      if (!item.stayBooking) return;
      if (item.tourBooking) return;
      if (item.holdDates === 0) return;
      if (!item.stayBooking.isConfirmed) return;

      data.push({
        _id: item._id,
        title: `${item.stayBooking.user.fullName.first} ${item.stayBooking.user.fullName.last}`,
        startDate: item.holdDates[0],
        endDate: item.holdDates[item.holdDates.length - 1],
        image: item.stay.images[0],
      });
    });

  return res
    .status(200)
    .send({ holdEvents: data, message: messages.en.getSuccess });
}

async function getEventById(req, res) {
  let eventId = mongoose.Types.ObjectId(req.params.id);

  let holdEvent = await HoldEvent.findOne({ _id: eventId });

  if (!holdEvent)
    return res
      .status(404)
      .send({ holdEvent: null, message: messages.en.noRecords });

  return res
    .status(200)
    .send({ holdEvent: holdEvent, message: messages.en.getSuccess });
}

async function getStaysAndEvents(req, res) {
  let data = [];
  let holdEvents = [];
  let { country, city, area } = req.query;
  let filter = { stay: { $ne: null } };
  let staysFilter = { deleted: false };

  if (country) staysFilter.country = mongoose.Types.ObjectId(country);
  if (city) staysFilter.city = mongoose.Types.ObjectId(city);
  if (area) staysFilter.area = mongoose.Types.ObjectId(area);

  let events = await HoldEvent.find(filter).populate({
    path: "stayBooking",
    populate: {
      path: "currency user",
      select: "_id fullName name symbol",
    },
  });

  let stays = await Property.find(staysFilter).populate("area");

  if (stays.length !== 0)
    stays.forEach((stay) => {
      holdEvents = events.filter((event) => stay._id.equals(event.stay));

      data.push({
        _id: stay._id,
        name: stay.name,
        image: stay.images[0],
        holdEvents: holdEvents.map((event) =>
          !event.stayBooking
            ? {
                _id: event._id,
                title: event.notes,

                startDate: event.blockedDates[0],
                endDate: event.blockedDates[event.blockedDates.length - 1],
                property: stay._id,
                name: stay.name,
                image: stay.images[0],
                notes: event.notes,
              }
            : {
                _id: event._id,
                title: `${event.stayBooking.user.fullName.first} ${event.stayBooking.user.fullName.last}`,
                arrivingIn: Math.round(
                  (new Date().getTime() -
                    new Date(event.holdDates[0]).getTime()) /
                    (1000 * 60 * 60 * 24)
                ),
                startDate: event.holdDates[0],
                endDate: event.holdDates[event.holdDates.length - 1],
                property: stay._id,
                name: stay.name,
                image: stay.images[0],
                guests:
                  event.stayBooking.numberOfGuests.adults +
                  event.stayBooking.numberOfGuests.infants +
                  event.stayBooking.numberOfGuests.childrens,
                price: `${event.stayBooking.totalPrice} ${event.stayBooking.currency.symbol}`,
                area: stay.area.name,
              }
        ),
      });

      holdEvents = [];
    });

  return res.status(200).send({ stays: data, message: messages.en.getSuccess });
}

async function getUpcomingStaysBooking(req, res) {
  let data = [];
  const d = new Date().setHours(0, 0, 0, 0);

  const today = new Date(d);
  const threeDaysLater = new Date(today);

  threeDaysLater.setDate(threeDaysLater.getDate() + 3);
  let datesRange = getDatesBetweenDates(today, threeDaysLater);

  let bookings = await PropertyBooking.find({
    checkInDate: { $in: datesRange },
    isConfirmed: true,
  })
    .populate("user", "_id fullName")
    .populate("property", "_id name");

  bookings.forEach((item) => {
    data.push({
      _id: item._id,
      property: {
        _id: item.property._id,
        name: item.property.name,
      },
      user: { _id: item.user._id, fullName: item.user.fullName },
      checkInDate: item.checkInDate,
      checkInTime: item.property.checkInTime,
      numberOfGuests: item.numberOfGuests,
    });
  });

  return res
    .status(200)
    .send({ bookings: data, message: messages.en.getSuccess });
}

async function getUpcomingDepartures(req, res) {
  let data = [];
  const d = new Date().setHours(0, 0, 0, 0);

  const today = new Date(d);
  const threeDaysLater = new Date(today);

  threeDaysLater.setDate(threeDaysLater.getDate() + 3);
  let datesRange = getDatesBetweenDates(today, threeDaysLater);

  let bookings = await PropertyBooking.find({
    checkOutDate: { $in: datesRange },
  })
    .populate("user", "_id fullName")
    .populate("property", "_id name");

  bookings.forEach((item) => {
    data.push({
      _id: item._id,
      property: {
        _id: item.property._id,
        name: item.property.name,
      },
      user: { _id: item.user._id, fullName: item.user.fullName },
      checkOutDate: item.checkOutDate,
      checkOutTime: item.property.checkOutTime,
      numberOfGuests: item.numberOfGuests,
    });
  });

  return res
    .status(200)
    .send({ bookings: data, message: messages.en.getSuccess });
}

async function getUpcomingTours(req, res) {
  let data = [];
  const d = new Date().setHours(0, 0, 0, 0);

  const today = new Date(d);
  const fiveDaysLater = new Date(today);

  fiveDaysLater.setDate(fiveDaysLater.getDate() + 5);
  let datesRange = getDatesBetweenDates(today, fiveDaysLater);

  let tourDates = await TourDates.find({ day: { $in: datesRange } }).populate(
    "tour",
    "_id title"
  );

  tourDates.forEach((item) => {
    data.push({
      _id: item._id,
      title: item.tour.title,
      tour: item.tour._id,
      day: item.day,
      soldOut: item.soldOut,
      numberOfGuests: item.numberOfGuests,
    });
  });

  return res.status(200).send({ tours: data, message: messages.en.getSuccess });
}

async function getBlockedDates(req, res) {
  let { stay } = req.query;
  let filter = { stay: { $ne: null } };
  let data = [];

  if (stay) filter.stay = mongoose.Types.ObjectId(stay);

  let blockedDates = await HoldEvent.find(filter).populate("stay", "_id");

  if (blockedDates.length !== 0)
    blockedDates.forEach((item) => {
      if (item.blockedDates.length === 0) return;

      data.push({
        _id: item._id,
        stay: item.stay._id,
        blockedDates: item.blockedDates,
        notes: item.notes,
      });
    });

  return res
    .status(200)
    .send({ blockedDates: data, message: messages.en.getSuccess });
}

async function getBlockedDatesSummury(req, res) {
  let filter = { stay: { $ne: null } };
  let data = [];

  let blockedDates = await HoldEvent.find(filter).populate({
    path: "stayBooking",
    populate: {
      path: "currency user",
      select: "_id fullName name symbol",
    },
  });

  if (blockedDates.length !== 0)
    blockedDates.forEach((item) => {
      if (item.blockedDates.length === 0) return;

      data.push({
        _id: item._id,
        title: item.notes,
        color: "red",
        startDate: item.blockedDates[0],
        endDate: item.blockedDates[item.blockedDates.length - 1],
      });
    });

  return res
    .status(200)
    .send({ blockedDates: data, message: messages.en.getSuccess });
}

async function createBlockedDates(req, res) {
  let { propertyId, blockedDates, notes } = req.body;
  let data = [];

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let property = await Property.findOne({
    _id: mongoose.Types.ObjectId(propertyId),
  });

  if (!property)
    return res.status(200).send({ property: null, message: "No properties" });

  blockedDates.forEach((item) => {
    data.push(new Date(item.slice(0, 10) + "T00:00:00.000Z"));
  });

  let dates = await HoldEvent.find({
    stay: property._id,
    blockedDates: { $in: data },
  });

  if (dates.length !== 0) {
    let inetersection = [];

    dates.forEach((item) => {
      item.blockedDates.forEach((date) => {
        if (data.find((ele) => ele.getTime() === new Date(date).getTime()))
          inetersection.push(date);
      });
    });

    return res.status(400).send({
      dates: inetersection,
      message: "Some of these dates are already blocked",
    });
  }

  let bookingsDates = await HoldEvent.find({
    stay: property._id,
    holdDates: { $in: data },
  });

  if (bookingsDates.length !== 0) {
    let inetersection = [];

    dates.forEach((item) => {
      item.holdDates.forEach((date) => {
        if (data.find((ele) => ele.getTime() === new Date(date).getTime()))
          inetersection.push(date);
      });
    });

    return res.status(400).send({
      dates: inetersection,
      message: "Some of these dates are booked by customers",
    });
  }

  let holdeEvent = new HoldEvent({
    stay: property._id,
    blockedDates: data,
    notes: notes,
  });

  await holdeEvent.save();

  return res.status(200).send({
    blockedDates: holdeEvent,
    message: messages.en.addSuccess,
  });
}

async function cancelBlockedDates(req, res) {
  let event = await HoldEvent.findOneAndDelete({ _id: req.params.id });

  return res
    .status(200)
    .send({ blockedDates: event, message: messages.en.deleted });
}

async function editBlockedDates(req, res) {
  let { blockedDates, notes } = req.body;
  let data = [];

  if (blockedDates && blockedDates.length !== 0) {
    blockedDates.forEach((item) => {
      data.push(new Date(item.slice(0, 10) + "T00:00:00.000Z"));
    });

    req;
  }

  let event = await HoldEvent.findOneAndUpdate(
    { _id: req.params.id },
    { $set: req.body },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .send({ blockedDates: event, message: messages.en.updateSucces });
}

module.exports = {
  getHoldEvents,
  getUpcomingStaysBooking,
  getUpcomingDepartures,
  getUpcomingTours,
  getStaysSummury,
  getEventById,
  getStaysAndEvents,
  getBlockedDates,
  createBlockedDates,
  cancelBlockedDates,
  editBlockedDates,
  getBlockedDatesSummury,
};
