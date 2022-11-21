const TourBooking = require("./TourBooking");
const TourDates = require("../../Models/TourDates/TourDates");
const Tour = require("../../Models/Tour/Tour");
const HoldEvent = require("../Calendar/HoldEvent");
const PaymentMethod = require("../PaymentMethod/PaymentMethod");
const CONF = require("../../constants");
const _ = require("lodash");
const { task } = require("../../dbConnection");
const mongoose = require("mongoose");
const messages = require("../../messages.json");
const { sendByMailGun } = require("../../Services/generalServices");
const { policis } = require("../CancellationPolicy/CancelPolicy");
const stripe = require("stripe")(CONF.stripe.API_KEY);

async function getTourDetails(req, res) {
  let conversion = req.conversion;
  let { tourId, tourDateId, numberOfGuests } = req.body;
  let discountAmount = 0;

  let tour = await Tour.findOne({
    _id: mongoose.Types.ObjectId(tourId),
  }).populate("price.currency", "_id symbol");

  if (!tour)
    return res.status(400).send({ tour: null, message: messages.en.noRecords });

  let tourDate = await TourDates.findOne({
    _id: mongoose.Types.ObjectId(tourDateId),
    tour: mongoose.Types.ObjectId(tourId),
  }).populate("price.currency", "_id name symbol");

  if (!tourDate)
    return res
      .status(400)
      .send({ tourDates: null, message: messages.en.noRecords });

  //Price details
  let pricePerOneAdult = !conversion
    ? tourDate.price.amount.adults
    : tourDate.price.amount.adults * conversion.rate;

  let pricePerOneChilde = !conversion
    ? tourDate.price.amount.childrens
    : tourDate.price.amount.childrens * conversion.rate;

  let pricePerOneInfant = !conversion
    ? tourDate.price.amount.infants
    : tourDate.price.amount.infants * conversion.rate;

  if (tour.sale.onSale) {
    discountAmount = `${tour.sale.salePercent * 100} %`;
  }

  let bookingDetails = {
    date: tourDate.day,
    tourDateId: tourDateId,
    numberOfGuests: tour.numberOfGuests,
    priceDetails: {
      pricePerOneAdult: pricePerOneAdult,
      pricePerOneChilde: pricePerOneChilde,
      pricePerOneInfant: pricePerOneInfant,
      discountAmount: discountAmount,
      currency: !conversion ? tourDate.price.currency : conversion.to,
    },
  };

  return res
    .status(200)
    .send({ bookingDetails: bookingDetails, message: messages.en.getSuccess });
}

async function createTourBooking(req, res) {
  let { tourId, tourDateId, numberOfGuests } = req.body;
  let priceDetails = {};
  let discountAmount = 0;
  const daysNumbers = [0, 6]; //0 is sunday and 1 is saturday
  let totalNumberOfGuests =
    numberOfGuests.infants + numberOfGuests.adults + numberOfGuests.childrens;

  let booking = await TourBooking.findOne({
    user: req.user._id,
    tour: mongoose.Types.ObjectId(tourId),
    tourDateId: mongoose.Types.ObjectId(tourDateId),
    isCancelled: false,
  });

  if (booking)
    return res.status(400).send({ message: "Already reegisterd in this tour" });

  let tour = await Tour.findOne({
    _id: mongoose.Types.ObjectId(tourId),
  }).populate("price.currency", "_id symbol");

  if (!tour)
    return res.status(400).send({ tour: null, message: messages.en.noRecords });

  let tourDate = await TourDates.findOne({
    _id: mongoose.Types.ObjectId(tourDateId),
    tour: mongoose.Types.ObjectId(tourId),
  }).populate("price.currency", "_id name symbol");

  if (!tourDate)
    return res
      .status(400)
      .send({ tourDates: null, message: messages.en.noRecords });

  if (tourDate.soldOut)
    return res
      .status(400)
      .send({ isAvailabe: false, message: messages.en.soldOut });

  //Check for max capacity of each guest type
  if (tour.numberOfGuests.adults < numberOfGuests.adults)
    return res
      .status(400)
      .send({ isAvailabe: false, message: messages.en.maxCapacity });

  if (tour.numberOfGuests.infants < numberOfGuests.infants)
    return res
      .status(400)
      .send({ isAvailabe: false, message: messages.en.maxCapacity });

  if (tour.numberOfGuests.childrens < numberOfGuests.childrens)
    return res
      .status(400)
      .send({ isAvailabe: false, message: messages.en.maxCapacity });

  if (tour.numberOfGuests.minimum > totalNumberOfGuests)
    return res.status(400).send({
      isAvailabe: false,
      message: `minimum ${tour.numberOfGuests.minimum} Guests`,
    });

  if (tour.numberOfGuests.maximum < totalNumberOfGuests)
    return res.status(400).send({
      isAvailabe: false,
      message: `maximum ${tour.numberOfGuests.maximum} Guests`,
    });

  if (tourDate.numberOfGuests.adults < numberOfGuests.adults)
    return res
      .status(400)
      .send({ isAvailabe: false, message: messages.en.maxCapacity });

  if (tourDate.numberOfGuests.infants < numberOfGuests.infants)
    return res
      .status(400)
      .send({ isAvailabe: false, message: messages.en.maxCapacity });

  if (tourDate.numberOfGuests.childrens < numberOfGuests.childrens)
    return res
      .status(400)
      .send({ isAvailabe: false, message: messages.en.maxCapacity });

  priceDetails.pricePerOneAdult = tourDate.price.amount.adults;
  priceDetails.pricePerOneChilde = tourDate.price.amount.childrens;
  priceDetails.pricePerOneInfant = tourDate.price.amount.infants;

  let totalAdultsPrice = priceDetails.pricePerOneAdult * numberOfGuests.adults;
  let totalChildrensPrice =
    priceDetails.pricePerOneChilde * numberOfGuests.childrens;
  let totalInfantsPrice =
    priceDetails.pricePerOneInfant * numberOfGuests.infants;

  let totalPrice = totalAdultsPrice + totalChildrensPrice + totalInfantsPrice;

  if (tour.sale.onSale) {
    discountAmount = totalPrice * tour.sale.salePercent;
    totalPrice = totalPrice - discountAmount;
  }

  req.body.tour = tourId;
  req.body.user = req.user._id;
  req.body.pricePerOneAdult = priceDetails.pricePerOneAdult;
  req.body.pricePerOneChilde = priceDetails.pricePerOneChilde;
  req.body.pricePerOneInfant = priceDetails.pricePerOneInfant;
  req.body.totalPrice = totalPrice;
  req.body.currency = tour.price.currency;
  req.body.sale = tour.sale;

  let newTourBooking = new TourBooking(req.body);
  let newHoldDates = new HoldEvent({
    tour: tourId,
    tourBooking: newTourBooking._id,
  });

  let updatedTourDate = tourDate.toObject();

  updatedTourDate.numberOfGuests.adults -= numberOfGuests.adults;
  updatedTourDate.numberOfGuests.childrens -= numberOfGuests.childrens;
  updatedTourDate.numberOfGuests.infants -= numberOfGuests.infants;

  if (updatedTourDate.numberOfGuests < 0)
    return res
      .status(400)
      .send({ isAvailabe: false, message: messages.en.maxCapacity });

  if (updatedTourDate.numberOfGuests === 0) updatedTourDate.soldOut = true;

  let updatedTour = tour.toObject();
  updatedTour.popularityCounter++;

  //Transaction to complete when every thing succesd or rollback if anything fails
  task.save(newTourBooking);

  task.save(newHoldDates);

  task.update(tourDate, updatedTourDate).options({ viaSave: true });

  task.update(tour, updatedTour).options({ viaSave: true });

  task.run({ useMongoose: true });

  return res.status(200).send({
    newTourBooking: newTourBooking,
    isAvailabe: true,
    message: messages.en.addSuccess,
  });
}

async function getMyBookings(req, res) {
  let conversion = req.conversion;
  let userId = req.user._id;
  let ongoingTours = [];
  let historyTours = [];
  let today = new Date();

  let bookings = await TourBooking.find({
    user: userId,
    confirmationCode: { $ne: null },
  })
    .populate("tourDateId")
    .populate("tour")
    .populate("currency", "_id name symbol")
    .populate({
      path: "tour",
      populate: {
        path: "area",
        select: "_id name",
      },
    });

  if (bookings.length !== 0)
    bookings.forEach((item) => {
      if (
        today.setHours(0, 0, 0, 0) <=
          new Date(item.tourDateId.day).setHours(0, 0, 0, 0) &&
        !item.isCancelled
      ) {
        ongoingTours.push({
          _id: item._id,
          tour: item.tour._id,
          name: item.tour.title,
          image: item.tour.images[0],
          location: item.tour.area.name,
          day: item.tourDateId.day,
          numberOfGuests:
            item.numberOfGuests.adults +
            item.numberOfGuests.childrens +
            item.numberOfGuests.infants,
          price: !conversion
            ? `${item.totalPrice} ${item.currency.symbol}`
            : `${item.totalPrice * conversion.rate} ${conversion.to.symbol}`,
          isCancelled: item.isCancelled,
        });
      } else {
        historyTours.push({
          _id: item._id,
          tour: item.tour._id,
          name: item.tour.title,
          image: item.tour.images[0],
          location: item.tour.area.name,
          day: item.tourDateId.day,
          numberOfGuests:
            item.numberOfGuests.adults +
            item.numberOfGuests.childrens +
            item.numberOfGuests.infants,
          price: !conversion
            ? `${item.totalPrice} ${item.currency.symbol}`
            : `${item.totalPrice * conversion.rate} ${conversion.to.symbol}`,
          isCancelled: item.isCancelled,
        });
      }
    });

  return res.status(200).send({
    ongoingTours: ongoingTours,
    historyTours: historyTours,
    message: messages.en.getSuccess,
  });
}

async function getBookingDetails(req, res) {
  let bookingId = mongoose.Types.ObjectId(req.params.id);
  let conversion = req.conversion;
  let data = {};

  let booking = await TourBooking.findOne({ _id: bookingId })
    .populate("tour")
    .populate("tourDateId")
    .populate({
      path: "tour",
      populate: {
        path: "area",
        select: "_id name",
      },
    })
    .populate("currency", "_id name symbol");

  if (!booking)
    return res.status(404).send({
      bookingDetails: null,
      message: messages.en.noRecords,
    });

  const paymentRecord = await PaymentMethod.findOne({
    tourBooking: booking._id,
  });

  const paymentIntent = await stripe.paymentIntents.retrieve(
    paymentRecord.stripePaymentIntent
  );

  const paymentMethod = await stripe.paymentMethods.retrieve(
    paymentIntent.payment_method
  );

  if (!paymentMethod || paymentMethod.length === 0) paymentMethod = null;

  data = {
    _id: booking._id,
    numberOfGuests: booking.numberOfGuests,
    priceDetails: {
      pricePerOneAdult: !conversion
        ? booking.pricePerOneAdult
        : booking.pricePerOneAdult * conversion.rate,
      pricePerOneChilde: !conversion
        ? booking.pricePerOneChilde
        : booking.pricePerOneChilde * conversion.rate,
      pricePerOneInfant: !conversion
        ? booking.pricePerOneInfant
        : booking.pricePerOneInfant * conversion.rate,
      totalPrice: !conversion
        ? booking.totalPrice
        : booking.totalPrice * conversion.rate,
      currency: !conversion ? booking.currency : conversion.to,
      refundAmount: !conversion
        ? booking.refundAmount
        : booking.refundAmount * conversion.rate,
      cancelledDate: booking.cancelledDate,
      sale: booking.sale,
    },
    tour: {
      _id: booking.tour._id,
      tourDateId: booking.tourDateId._id,
      title: booking.tour.title,
      image: booking.tour.images[0],
      day: booking.tourDateId.day,
      location: booking.tour.area.name,
    },
    paymentMethod: !!paymentRecord ? paymentMethod.card : null,
    confirmationCode: booking.confirmationCode,
  };

  return res.status(200).send({
    bookingDetails: data,
    message: messages.en.getSuccess,
  });
}

async function confirmBooking(req, res) {
  let { bookingId } = req.body;

  let booking = await TourBooking.findOne({
    _id: mongoose.Types.ObjectId(bookingId),
    isCancelled: false,
  })
    .populate("tour")
    .populate("user")
    .populate("tourDateId");

  if (!booking)
    return res
      .status(404)
      .send({ booking: null, message: messages.en.noRecords });

  //TODO handle booking after payment confirmation

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

  return res.status(200).send({
    isConfirmed: true,
    confirmationCode: booking.confirmationCode,
    message: messages.en.updateSucces,
  });
}

async function cancelBookingDetails(req, res) {
  let conversion = req.conversion;
  let bookingId = req.params.id;
  let refundAmount = 0;
  let totalPrice = 0;

  let booking = await TourBooking.findOne({
    _id: mongoose.Types.ObjectId(bookingId),
    isCancelled: false,
  })
    .populate("tour", "cancelationPolicy")
    .populate("tourDateId", "_id day")
    .populate("currency", "_id name symbol");

  if (!booking)
    return res
      .status(404)
      .send({ booking: null, message: messages.en.noRecords });

  let cancelationDate = new Date();
  let tourStartDate = new Date(booking.tourDateId.day);
  let timmDiff = tourStartDate.getTime() - cancelationDate.getTime();
  let numOfDaysBeforeCancelation = Math.round(timmDiff / (1000 * 60 * 60 * 24));

  let policy = policis.find((item) =>
    item._id.equals(booking.tour.cancelationPolicy)
  );

  if (!policy)
    return res
      .status(404)
      .send({ policy: null, message: messages.en.noRecords });

  if (numOfDaysBeforeCancelation >= policy.numberOfDays) {
    totalPrice = booking.totalPrice;
    refundAmount = policy.refundAmountPercent * totalPrice;
  }

  if (refundAmount === 0)
    return res.status(200).send({
      refundAmount: !conversion ? refundAmount : refundAmount * conversion.rate,
      currency: !conversion ? booking.currency : conversion.to,
      policy: policy,
      message: messages.en.getSuccess,
    });

  return res.status(200).send({
    refundAmount: !conversion ? refundAmount : refundAmount * conversion.rate,
    currency: !conversion ? booking.currency : conversion.to,
    policy: policy,
    message: messages.en.getSuccess,
  });
}

async function cancelBooking(req, res) {
  try {
    let { bookingId } = req.body;
    let refundAmount = 0;
    let totalPrice = 0;

    let booking = await TourBooking.findOne({
      _id: mongoose.Types.ObjectId(bookingId),
      isCancelled: false,
    })
      .populate("tour")
      .populate("tourDateId", "_id day");

    if (!booking)
      return res
        .status(404)
        .send({ booking: null, message: messages.en.noRecords });

    let holdDates = await HoldEvent.findOne({
      tour: mongoose.Types.ObjectId(booking.tour._id),
      tourBooking: mongoose.Types.ObjectId(booking._id),
    });

    if (!holdDates)
      return res
        .status(404)
        .send({ holdDates: null, message: messages.en.noRecords });

    let cancelationDate = new Date();
    let tourStartDate = new Date(booking.tourDateId.day);
    let timmDiff = tourStartDate.getTime() - cancelationDate.getTime();
    let numOfDaysBeforeCancelation = Math.round(
      timmDiff / (1000 * 60 * 60 * 24)
    );

    let policy = policis.find((item) =>
      item._id.equals(booking.tour.cancelationPolicy)
    );

    if (!policy)
      return res
        .status(404)
        .send({ policy: null, message: messages.en.noRecords });

    let updatedBooking = booking.toObject();

    if (numOfDaysBeforeCancelation >= policy.numberOfDays) {
      totalPrice = booking.totalPrice;
      refundAmount = policy.refundAmountPercent * totalPrice;
      updatedBooking.refundAmount = refundAmount;
    }

    let tourDate = await TourDates.findOne({
      _id: mongoose.Types.ObjectId(booking.tourDateId._id),
    });

    let updatedTourDate = tourDate.toObject();

    //Add places back
    updatedBooking.isCancelled = true;
    updatedBooking.cancelledDate = new Date();
    updatedBooking.isConfirmed = false;
    updatedTourDate.numberOfGuests.adults += booking.numberOfGuests.adults;
    updatedTourDate.numberOfGuests.childrens +=
      booking.numberOfGuests.childrens;
    updatedTourDate.numberOfGuests.infants += booking.numberOfGuests.infants;
    updatedTourDate.soldOut = false;

    const paymentRecord = await PaymentMethod.findOne({
      tourBooking: mongoose.Types.ObjectId(bookingId),
    });

    if (refundAmount !== 0) {
      const refund = await stripe.refunds.create({
        payment_intent: paymentRecord.stripePaymentIntent,
        amount: refundAmount * 100,
      });

      updatedBooking.paidAmount = booking.totalPrice - refundAmount;
    }

    task.remove(holdDates);

    task.update(booking, updatedBooking).options({ viaSave: true });

    task.update(tourDate, updatedTourDate).options({ viaSave: true });

    task.run({ useMongoose: true });

    sendByMailGun(
      [req.user.email, CONF.EMAIL],
      "Booking is Cancelled",
      "Booking",
      null,
      `Your Cheez-Hospitality booking has been Cancelled successfuly:
      Tour: ${booking.tour.title}
      Code: ${booking.confirmationCode}`
    );

    if (refundAmount === 0)
      return res.status(200).send({
        refundAmount: refundAmount,
        isCancelled: true,
        isRefunded: false,
        message: "No refunds due to the refund policy",
      });

    return res.status(200).send({
      refundAmount: refundAmount,
      isCancelled: true,
      isRefunded: true,
      message: "Refund success",
    });
  } catch (err) {
    return res.status(500).send({ message: messages.en.generalError });
  }
}

module.exports = {
  createTourBooking,
  getMyBookings,
  getBookingDetails,
  getTourDetails,
  confirmBooking,
  cancelBooking,
  cancelBookingDetails,
};
