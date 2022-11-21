const Property = require("../Property/Property");
const PropertyBooking = require("./PropertyBooking");
const HoldEvent = require("../../Models/Calendar/HoldEvent");
const UnRegestierdBookingDetails = require("./unRegestierdBookingDetails");
const PaymentMethod = require("../PaymentMethod/PaymentMethod");
const Details = require("../propertyDetails/Details");
const CONF = require("../../constants");
const messages = require("../../messages.json");
const mongoose = require("mongoose");
const _ = require("lodash");
const { task } = require("../../dbConnection");
const {
  getDatesBetweenDates,
  sendByMailGun,
  formatDate,
} = require("../../Services/generalServices");
const {
  sendConfirmationEmail,
  sendBookingGuide,
} = require("../../Services/Emails");
const { policis } = require("../CancellationPolicy/CancelPolicy");
const stripe = require("stripe")(CONF.stripe.API_KEY);
const bookingDetailsService = require("../../Services/propertyBookingPriceDetails");
const checkIfAvailableService = require("../../Services/checkIfDatesAreAvailable.js");

async function checkIfAvailable(req, res) {
  let { propertyId, checkInDate, checkOutDate } = req.body;
  let { bookingId } = req.query;
  let conversion = req.conversion;
  let booking;
  let filter = {
    stay: mongoose.Types.ObjectId(propertyId),
  };
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
  }).populate("price.currency", "_id name symbol");

  if (!property)
    return res
      .status(404)
      .send({ property: null, message: messages.en.noRecords });

  if (bookingId) {
    filter.stayBooking = { $ne: mongoose.Types.ObjectId(bookingId) };
    availableFilter._id = { $ne: mongoose.Types.ObjectId(bookingId) };

    booking = await PropertyBooking.findOne({ _id: bookingId });

    if (!booking)
      return res
        .status(404)
        .send({ booking: null, message: messages.en.noRecords });
  }

  const { bookingDetails } = bookingDetailsService(
    property,
    checkInDate,
    checkOutDate,
    conversion,
    booking
  );

  //check if chosen dates not in blocked dates or booked dates
  let holdDates = await HoldEvent.find(filter);

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

  if (req.url === "/user/saved-details") {
    let unRegestierdBookingDetails = new UnRegestierdBookingDetails({
      user: req.user._id,
      bookingDetails: bookingDetails,
    });

    await unRegestierdBookingDetails.save();
  }

  return res
    .status(200)
    .send({ isAvailabe: true, bookingDetails: bookingDetails });
}

async function createPropertyBooking(req, res) {
  let { propertyId, numberOfGuests, checkInDate, checkOutDate } = req.body;
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
    return res
      .status(400)
      .send({ isAvailabe: false, message: messages.en.maxCapacity });

  if (property.numberOfGuests.minimum > totalGuests)
    return res
      .status(400)
      .send({ isAvailabe: false, message: messages.en.maxCapacity });

  req.body.nights = bookingDetails.priceDetails.numberOfNights;
  req.body.discount = bookingDetails.priceDetails.discount;
  req.body.cleanFeas = bookingDetails.priceDetails.cleanFeas;
  req.body.pricePerNight = bookingDetails.priceDetails.pricePerNight;
  req.body.priceForNumberOfNights =
    bookingDetails.priceDetails.priceForNumberOfNights;
  req.body.totalPrice = bookingDetails.priceDetails.totalPrice;
  req.body.property = property._id;
  req.body.user = req.user._id;
  req.body.currency = property.price.currency;

  let newPropertyBooking = new PropertyBooking(req.body);

  //Transaction to complete when every thing succesd or rollback if anything fails

  let updatedProperty = property.toObject();
  updatedProperty.popularityCounter++;

  task.save(newPropertyBooking);

  task.update(property, updatedProperty).options({ viaSave: true });

  task.run({ useMongoose: true });

  res.status(200).send({
    newPropertyBooking: newPropertyBooking,
    isAvailabe: true,
    message: messages.en.addSuccess,
  });
}

async function confirmBooking(req, res) {
  let { bookingId } = req.body;

  let booking = await PropertyBooking.findOne({
    _id: mongoose.Types.ObjectId(bookingId),
  })
    .populate("property")
    .populate("user");

  if (!booking)
    return res
      .status(404)
      .send({ booking: null, message: messages.en.noRecords });

  let updatedBooking = booking.toObject();

  updatedBooking.isConfirmed = true;
  updatedBooking.confirmationCode = `s#${Math.floor(
    10000000 + Math.random() * 9000000
  )}`;

  let newHoldDates = new HoldEvent({
    stay: booking.property._id,
    stayBooking: updatedBooking._id,
    holdDates: getDatesBetweenDates(
      updatedBooking.checkInDate,
      updatedBooking.checkOutDate
    ),
  });

  task.save(newHoldDates);

  task.update(booking, updatedBooking).options({ viaSave: true });

  task.run({ useMongoose: true });

  sendByMailGun(
    [updatedBooking.user.email, CONF.EMAIL],
    "Booking is confirmed",
    "booking",
    null,
    sendConfirmationEmail(updatedBooking)
  );

  let diff =
    (new Date(booking.checkInDate).getTime() - new Date().getTime()) / 3600000;

  if (diff < 24) {
    let details = await Details.findOne({
      property: booking.property._id,
    });

    if (!details) console.log("No details");
    else {
      sendByMailGun(
        req.user.email,
        `${booking.property.name}`,
        "booking",
        null,
        sendBookingGuide(updatedBooking, details)
      );
    }
  }

  return res.status(200).send({
    isConfirmed: true,
    confirmationCode: updatedBooking.confirmationCode,
    link: `${CONF.DOMAIN}guests-data/${booking._id}`,
    message: messages.en.updateSucces,
  });
}

async function cancelBookingDetails(req, res) {
  let conversion = req.conversion;
  let bookingId = req.params.id;
  let refundAmount = 0;
  let totalPrice = 0;

  let booking = await PropertyBooking.findOne({
    _id: mongoose.Types.ObjectId(bookingId),
    isCancelled: false,
  })
    .populate("property", "cancelationPolicy price")
    .populate("currency", "_id name symbol");

  if (!booking)
    return res
      .status(404)
      .send({ booking: null, message: messages.en.noRecords });

  let cancelationDate = new Date();
  let checkInDate = new Date(booking.checkInDate);
  let timmDiff = checkInDate.getTime() - cancelationDate.getTime();
  let numOfDaysBeforeCancelation = Math.round(timmDiff / (1000 * 60 * 60 * 24));

  let policy = policis.find((item) =>
    item._id.equals(booking.property.cancelationPolicy)
  );

  if (!policy)
    return res
      .status(404)
      .send({ policy: null, message: messages.en.noRecords });

  if (numOfDaysBeforeCancelation >= policy.numberOfDays) {
    totalPrice = booking.totalPrice - booking.property.price.cleanFeas;
    refundAmount =
      policy.refundAmountPercent * totalPrice +
      booking.property.price.cleanFeas;
  } else {
    refundAmount = booking.property.price.cleanFeas;
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

    let booking = await PropertyBooking.findOne({
      _id: mongoose.Types.ObjectId(bookingId),
      isCancelled: false,
    })
      .populate("property")
      .populate("user");

    if (!booking)
      return res
        .status(404)
        .send({ booking: null, message: messages.en.noRecords });

    let holdDates = await HoldEvent.findOne({
      stay: mongoose.Types.ObjectId(booking.property._id),
      stayBooking: mongoose.Types.ObjectId(booking._id),
    });

    if (!holdDates)
      return res
        .status(404)
        .send({ holdDates: null, message: messages.en.noRecords });

    let cancelationDate = new Date();
    let checkInDate = new Date(booking.checkInDate);
    let timmDiff = checkInDate.getTime() - cancelationDate.getTime();
    let numOfDaysBeforeCancelation = Math.round(
      timmDiff / (1000 * 60 * 60 * 24)
    );

    let policy = policis.find((item) =>
      item._id.equals(booking.property.cancelationPolicy)
    );

    if (!policy)
      return res
        .status(404)
        .send({ policy: null, message: messages.en.noRecords });

    let updatedBooking = booking.toObject();

    updatedBooking.isCancelled = true;
    updatedBooking.cancelledDate = new Date();
    updatedBooking.isConfirmed = false;

    const paymentRecord = await PaymentMethod.find({
      propertyBooking: mongoose.Types.ObjectId(bookingId),
    });

    if (booking.isConfirmed) {
      if (numOfDaysBeforeCancelation >= policy.numberOfDays) {
        totalPrice = booking.totalPrice - booking.property.price.cleanFeas;
        refundAmount =
          policy.refundAmountPercent * totalPrice +
          booking.property.price.cleanFeas;
        updatedBooking.refundAmount = refundAmount;
      } else {
        refundAmount = booking.property.price.cleanFeas;
        updatedBooking.refundAmount = refundAmount;
      }

      if (refundAmount !== 0) {
        let remainingAmount = refundAmount;
        paymentRecord.forEach(async (item, i) => {
          if (remainingAmount < item.paidAmount && remainingAmount !== 0) {
            const refund = await stripe.refunds.create({
              payment_intent: item.stripePaymentIntent,
              amount: Math.round(remainingAmount) * 100,
            });
            remainingAmount = 0;
          }
          if (remainingAmount > item.paidAmount) {
            remainingAmount = remainingAmount - item.paidAmount;
            const refund = await stripe.refunds.create({
              payment_intent: item.stripePaymentIntent,
              amount: Math.round(item.paidAmount) * 100,
            });
          }
        });

        updatedBooking.totalPrice = booking.totalPrice - refundAmount;
      }
    }

    task.remove(holdDates);

    task.update(booking, updatedBooking).options({ viaSave: true });

    task.run({ useMongoose: true });

    sendByMailGun(
      [booking.user.email, CONF.EMAIL],
      "Booking is Cancelled",
      "Booking is Cancelled",
      null,
      `Your Cheez-Hospitality booking has been cancelled successfuly:
      Stay: ${booking.property.name}
      Code: ${booking.confirmationCode}
      `
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
    console.log(err);
    return res.status(500).send({ message: messages.en.generalError });
  }
}

async function getMyBookings(req, res) {
  let conversion = req.conversion;
  let userId = req.user._id;
  let ongoingBookings = [];
  let historyBookings = [];
  let today = new Date();

  let bookings = await PropertyBooking.find({
    user: userId,
    confirmationCode: { $ne: null },
  })
    .populate("property")
    .populate("currency", "_id name symbol")
    .populate({
      path: "property",
      populate: {
        path: "area",
        select: "_id name",
      },
    })
    .sort("-checkInDate");

  if (bookings.length !== 0)
    bookings.forEach((item) => {
      if (
        today.setUTCHours(0, 0, 0, 0) <= new Date(item.checkOutDate) &&
        !item.isCancelled
      ) {
        ongoingBookings.push({
          _id: item._id,
          property: item.property._id,
          name: item.property.name,
          image: item.property.images[0],
          checkInDate: item.checkInDate,
          checkOutDate: item.checkOutDate,
          location: item.property.area.name,
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
        historyBookings.push({
          _id: item._id,
          property: item.property._id,
          name: item.property.name,
          image: item.property.images[0],
          checkInDate: item.checkInDate,
          checkOutDate: item.checkOutDate,
          location: item.property.area.name,
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
    ongoingBookings: ongoingBookings,
    historyBookings: historyBookings,
    message: messages.en.getSuccess,
  });
}

async function getBookingById(req, res) {
  let bookingId = mongoose.Types.ObjectId(req.params.id);
  let conversion = req.conversion;
  let methods;
  let checkInDates = [];
  let checkOutDates = [];
  let blockedDates = [];
  let data = {};

  let propertyBooking = await PropertyBooking.findOne({
    _id: bookingId,
  })
    .populate("currency", "_id name symbol")
    .populate({
      path: "property",
      populate: {
        path: "area",
        select: "_id name",
      },
    });

  if (!propertyBooking)
    return res.status(404).send({
      bookingDetails: null,
      message: messages.en.noRecords,
    });

  let dates = await HoldEvent.find({
    stay: propertyBooking.property._id,
    stayBooking: { $ne: propertyBooking._id },
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

  let policy = policis.find((item) =>
    item._id.equals(propertyBooking.property.cancelationPolicy)
  );

  if (!policy)
    return res
      .status(404)
      .send({ policy: null, message: messages.en.noRecords });

  try {
    const paymentRecord = await PaymentMethod.findOne({
      propertyBooking: propertyBooking._id,
    });

    const paymentIntent = await stripe.paymentIntents.retrieve(
      paymentRecord.stripePaymentIntent
    );

    const paymentMethod = await stripe.paymentMethods.retrieve(
      paymentIntent.payment_method
    );
    methods = paymentMethod.card;
  } catch (err) {
    methods = null;
  }

  data = {
    _id: propertyBooking._id,
    dates: {
      checkInDate: propertyBooking.checkInDate,
      checkOutDate: propertyBooking.checkOutDate,
    },
    numberOfGuests: propertyBooking.numberOfGuests,
    priceDetails: {
      cleanFeas: !conversion
        ? propertyBooking.cleanFeas
        : propertyBooking.cleanFeas * conversion.rate,
      numberOfNights: propertyBooking.nights,
      pricePerNight: !conversion
        ? propertyBooking.pricePerNight
        : propertyBooking.pricePerNight * conversion.rate,
      discount: propertyBooking.discount,
      priceForNumberOfNights: !conversion
        ? propertyBooking.priceForNumberOfNights
        : propertyBooking.priceForNumberOfNights * conversion.rate,
      totalPrice: !conversion
        ? propertyBooking.totalPrice
        : propertyBooking.totalPrice * conversion.rate,
      refundAmount: !conversion
        ? propertyBooking.refundAmount
        : propertyBooking.refundAmount * conversion.rate,
      extraCharge: !conversion
        ? propertyBooking.extraCharge
        : propertyBooking.extraCharge * conversion.rate,
      currency: !conversion ? propertyBooking.currency : conversion.to,
    },
    property: {
      _id: propertyBooking.property._id,
      image: propertyBooking.property.images[0],
      name: propertyBooking.property.name,
      location: propertyBooking.property.area.name,
      checkInDates: checkInDates,
      checkOutDates: checkOutDates,
      blockedDates: blockedDates,
    },
    cancelationPolicy: policy,
    isCancelled: propertyBooking.isCancelled,
    cancelledDate: propertyBooking.cancelledDate,
    paymentMethod: methods,
    confirmationCode: propertyBooking.confirmationCode,
  };

  return res.status(200).send({
    bookingDetails: data,
    message: messages.en.getSuccess,
  });
}

async function editBooking(req, res) {
  try {
    let { bookingId, checkInDate, checkOutDate } = req.body;

    let booking = await PropertyBooking.findOne({
      _id: mongoose.Types.ObjectId(bookingId),
    })
      .populate({
        path: "property",
        populate: {
          path: "price.currency",
          select: "_id name symbol",
        },
      })
      .populate("currency", "_id name symbol")
      .populate("user");

    if (!booking)
      return res.status(404).send({
        booking: null,
        message: messages.en.noRecords,
      });

    let holdDates = await HoldEvent.findOne({
      stayBooking: mongoose.Types.ObjectId(bookingId),
    });

    if (!holdDates)
      return res.status(404).send({
        holdDates: null,
        message: messages.en.noRecords,
      });

    const { bookingDetails } = bookingDetailsService(
      booking.property,
      checkInDate,
      checkOutDate,
      null,
      booking
    );

    let stayCalender = await HoldEvent.find({
      stay: mongoose.Types.ObjectId(booking.property._id),
      stayBooking: { $ne: booking._id },
    });

    let bookings = await PropertyBooking.find({
      property: booking.property._id,
      _id: { $ne: bookingId },
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
    });

    const { isAvailable, message } = checkIfAvailableService(
      stayCalender,
      bookings,
      booking.property,
      checkInDate,
      checkOutDate
    );

    if (!isAvailable)
      return res.status(200).send({
        isAvailable: false,
        message: !message ? messages.en.NotAvailable : message,
      });

    let updatedBooking = booking.toObject();

    updatedBooking.checkInDate = new Date(checkInDate);
    updatedBooking.checkOutDate = new Date(checkOutDate);
    updatedBooking.nights = bookingDetails.priceDetails.numberOfNights;
    updatedBooking.discount = bookingDetails.priceDetails.discount;
    updatedBooking.cleanFeas = bookingDetails.priceDetails.cleanFeas;
    updatedBooking.pricePerNight = bookingDetails.priceDetails.pricePerNight;
    updatedBooking.priceForNumberOfNights =
      bookingDetails.priceDetails.priceForNumberOfNights;
    updatedBooking.totalPrice = bookingDetails.priceDetails.totalPrice;

    let updatedHoldDates = holdDates.toObject();
    updatedHoldDates.holdDates = getDatesBetweenDates(
      checkInDate,
      checkOutDate
    );

    task.update(booking, updatedBooking).options({ viaSave: true });
    task.update(holdDates, updatedHoldDates).options({ viaSave: true });

    //Pricing differnce
    //Do refund
    if (bookingDetails.priceDetails.totalPrice < booking.totalPrice) {
      const paymentRecord = await PaymentMethod.find({
        propertyBooking: mongoose.Types.ObjectId(bookingId),
      });

      //let updatedRecord = paymentRecord.toObject();
      let { refundAmount } = bookingDetails.priceDetails;

      if (booking.isConfirmed) {
        if (refundAmount !== 0) {
          let remainingAmount = refundAmount;
          paymentRecord.forEach(async (item, i) => {
            if (remainingAmount < item.paidAmount && remainingAmount !== 0) {
              const refund = await stripe.refunds.create({
                payment_intent: item.stripePaymentIntent,
                amount: Math.round(remainingAmount) * 100,
              });
              remainingAmount = 0;
            }
            if (remainingAmount > item.paidAmount) {
              remainingAmount = remainingAmount - item.paidAmount;
              const refund = await stripe.refunds.create({
                payment_intent: item.stripePaymentIntent,
                amount: Math.round(item.paidAmount) * 100,
              });
            }
          });
        }
      }

      task.run({ useMongoose: true });

      sendByMailGun(
        [booking.user.email, CONF.EMAIL],
        "Booking is Updated",
        "Booking",
        null,
        `Your Cheez-Hospitality booking has been updated successfuly:
          Stay: ${booking.property.name}
          Checkin: ${new Date(
            updatedBooking.checkInDate
          ).toLocaleDateString()} at ${booking.property.checkInTime}
          Checkout: ${new Date(
            updatedBooking.checkOutDate
          ).toLocaleDateString()} at ${booking.property.checkOutTime}
          Code: ${updatedBooking.confirmationCode}
          `
      );

      return res.status(200).send({
        isUpdated: true,
        booking: updatedBooking,
        message: messages.en.updateSucces,
      });
    }

    //Charge for the extra nights
    if (bookingDetails.priceDetails.totalPrice > booking.totalPrice) {
      const paymentRecord = await PaymentMethod.findOne({
        propertyBooking: mongoose.Types.ObjectId(bookingId),
      });

      updatedBooking.extraCharge = bookingDetails.priceDetails.extraCharge;

      //Retrevie confirmed old payment to get info from it
      const oldIntent = await stripe.paymentIntents.retrieve(
        paymentRecord.stripePaymentIntent
      );

      //charge the new amount
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(bookingDetails.priceDetails.extraCharge) * 100,
        currency: "usd",
        customer: paymentRecord.stripeCustomerId,
        payment_method: oldIntent.payment_method,
        off_session: true,
        confirm: true,
      });

      let newPaymntRecord = new PaymentMethod({
        user: booking.user._id,
        stripeCustomerId: paymentRecord.stripeCustomerId,
        stripePaymentIntent: paymentIntent.id,
        paymentGate: 0,
        paidAmount: bookingDetails.priceDetails.extraCharge,
        propertyBooking: booking._id,
      });

      task.update(booking, updatedBooking).options({ viaSave: true });
      task.update(holdDates, updatedHoldDates).options({ viaSave: true });

      task.save(newPaymntRecord);

      task.run({ useMongoose: true });

      sendByMailGun(
        [booking.user.email, CONF.EMAIL],
        "Booking is Updated",
        "Booking",
        null,
        `Your Cheez-Hospitality booking has been updated successfuly:
          Stay: ${booking.property.name}
          Checkin: ${new Date(
            updatedBooking.checkInDate
          ).toLocaleDateString()} at ${booking.property.checkInTime}
          Checkout: ${new Date(
            updatedBooking.checkOutDate
          ).toLocaleDateString()} at ${booking.property.checkOutTime}
          Code: ${updatedBooking.confirmationCode}`
      );

      return res.status(200).send({
        isUpdated: true,
        booking: updatedBooking,
        message: messages.en.updateSucces,
      });
    }

    //No charges
    if (bookingDetails.priceDetails.totalPrice === booking.totalPrice) {
      task.update(booking, updatedBooking).options({ viaSave: true });
      task.update(holdDates, updatedHoldDates).options({ viaSave: true });

      task.run({ useMongoose: true });

      sendByMailGun(
        [booking.user.email, CONF.EMAIL],
        "Booking is Updated",
        "Booking",
        null,
        `Your Cheez-Hospitality booking has been updated successfuly:
          Stay: ${booking.property.name}
          Checkin: ${new Date(
            updatedBooking.checkInDate
          ).toLocaleDateString()} at ${booking.property.checkInTime}
          Checkout: ${new Date(
            updatedBooking.checkOutDate
          ).toLocaleDateString()} at ${booking.property.checkOutTime}
          Code: ${updatedBooking.confirmationCode}`
      );

      return res.status(200).send({
        isUpdated: true,
        booking: updatedBooking,
        message: messages.en.updateSucces,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: messages.en.generalError });
  }
}

async function getUnRegestierdBookingDetails(req, res) {
  let unRegestierdBookingDetails = await UnRegestierdBookingDetails.findOne({
    user: req.user._id,
  });

  if (!unRegestierdBookingDetails)
    return res.status(404).send({
      bookingDetails: unRegestierdBookingDetails,
      message: messages.en.noRecords,
    });

  console.log(req.url);

  return res.status(200).send({
    bookingDetails: unRegestierdBookingDetails,
    message: messages.en.getSuccess,
  });
}

async function deleteUnRegestierdBookingDetails(req, res) {
  let { savedDetailsId } = req.body;
  let unRegestierdBookingDetails = await UnRegestierdBookingDetails.findOne({
    user: req.user._id,
  });

  if (!unRegestierdBookingDetails)
    return res.status(404).send({
      bookingDetails: unRegestierdBookingDetails,
      message: messages.en.noRecords,
    });

  let deleted = await UnRegestierdBookingDetails.findOneAndDelete({
    _id: mongoose.Types.ObjectId(savedDetailsId),
  });

  if (deleted)
    return res
      .status(200)
      .send({ deleted: true, message: messages.en.deleted });

  return res
    .status(500)
    .send({ deleted: false, message: messages.en.generalError });
}

module.exports = {
  createPropertyBooking,
  getMyBookings,
  getBookingById,
  checkIfAvailable,
  confirmBooking,
  cancelBooking,
  editBooking,
  cancelBookingDetails,
  getUnRegestierdBookingDetails,
  deleteUnRegestierdBookingDetails,
};
