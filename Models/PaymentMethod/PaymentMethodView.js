const PaymentMethod = require("./PaymentMethod");
const Property = require("../Property/Property");
const Tour = require("../Tour/Tour");
const TourDates = require("../TourDates/TourDates");
const Cart = require("../Cart/Cart");
const CartItem = require("../CartItem/CartItem");
const PropertyBooking = require("../PropertyBooking/PropertyBooking");
const TourBooking = require("../TourBooking/TourBooking");
const Order = require("../Order/Order");
const mongoose = require("mongoose");
const CONF = require("../../constants");
const stripe = require("stripe")(CONF.stripe.API_KEY);
const messages = require("../../messages.json");

async function checkIfUserExistInStripe(req, res) {
  let customer = await PaymentMethod.findOne({ user: req.user._id }).populate(
    "user",
    "_id fullName email"
  );

  if (!customer)
    return res
      .status(200)
      .send({ customer: -1, message: messages.en.noRecords });

  return res.status(200).send({
    user: customer.user,
    stripeId: customer.stripeCustomerId,
    message: messages.en.getSuccess,
  });
}

async function createPaymentRecordForStays_stripe(req, res) {
  try {
    let { bookingId } = req.body;

    let booking = await PropertyBooking.findOne({
      _id: mongoose.Types.ObjectId(bookingId),
    });

    if (!booking)
      return res
        .status(200)
        .send({ booking: null, message: messages.en.noRecords });

    //Payment
    let user = await PaymentMethod.findOne({ user: req.user._id }).populate(
      "user",
      "_id fullName email"
    );

    if (!user) {
      customer = await stripe.customers.create(req.user.email);
    } else {
      customer = { id: user.stripeCustomerId };
    }

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2020-08-27" }
    );
    const paymentIntent = await stripe.paymentIntents.create({
      amount: booking.totalPrice * 100,
      currency: "usd",
      customer: customer.id,
      setup_future_usage: "on_session",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    let payment = new PaymentMethod({
      user: req.user._id,
      stripeCustomerId: customer.id,
      stripePaymentIntent: paymentIntent.id,
      propertyBooking: booking._id,
      paymentGate: 0,
      paidAmount: booking.totalPrice,
    });

    await payment.save();

    return res.status(200).send({
      customer: customer.id,
      intentSecret: paymentIntent.client_secret,
      ephemeralKeySecret: ephemeralKey.secret,
      message: messages.en.addSuccess,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err: err });
  }
}

async function createPaymentRecordForTours_stripe(req, res) {
  try {
    let { bookingId } = req.body;

    let booking = await TourBooking.findOne({
      _id: mongoose.Types.ObjectId(bookingId),
    });

    if (!booking)
      return res
        .status(200)
        .send({ booking: null, message: messages.en.noRecords });

    //Payment
    let user = await PaymentMethod.findOne({ user: req.user._id }).populate(
      "user",
      "_id fullName email"
    );

    if (!user) {
      customer = await stripe.customers.create();
    } else {
      customer = { id: user.stripeCustomerId };
    }

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2020-08-27" }
    );
    const paymentIntent = await stripe.paymentIntents.create({
      amount: booking.totalPrice * 100,
      currency: "usd",
      customer: customer.id,
      setup_future_usage: "on_session",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    let payment = new PaymentMethod({
      user: req.user._id,
      stripeCustomerId: customer.id,
      stripePaymentIntent: paymentIntent.id,
      tourBooking: booking._id,
      paymentGate: 0,
      paidAmount: booking.totalPrice,
    });

    await payment.save();

    return res.status(200).send({
      customer: customer.id,
      intentSecret: paymentIntent.client_secret,
      ephemeralKeySecret: ephemeralKey.secret,
      message: messages.en.addSuccess,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err: err });
  }
}

async function createPaymentRecordForOrders_stripe(req, res) {
  try {
    let { orderId } = req.body;

    let order = await Order.findOne({ _id: mongoose.Types.ObjectId(orderId) });

    if (!order)
      return res.status(404).send({
        order: null,
        message: messages.en.noRecords,
      });

    //Payment
    let user = await PaymentMethod.findOne({ user: req.user._id }).populate(
      "user",
      "_id fullName email"
    );

    if (!user) {
      customer = await stripe.customers.create();
    } else {
      customer = { id: user.stripeCustomerId };
    }

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2020-08-27" }
    );
    const paymentIntent = await stripe.paymentIntents.create({
      amount: order.totalPrice * 100,
      currency: "usd",
      customer: customer.id,
      setup_future_usage: "on_session",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    let payment = new PaymentMethod({
      user: req.user._id,
      stripeCustomerId: customer.id,
      stripePaymentIntent: paymentIntent.id,
      order: order._id,
      paymentGate: 0,
      paidAmount: order.totalPrice,
    });

    await payment.save();

    return res.status(200).send({
      customer: customer.id,
      intentSecret: paymentIntent.client_secret,
      ephemeralKeySecret: ephemeralKey.secret,
      message: messages.en.addSuccess,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err: err });
  }
}

async function createPaymentMethod(req, res) {
  try {
    let customer;
    let user = await PaymentMethod.findOne({ user: req.user._id }).populate(
      "user",
      "_id fullName email"
    );

    if (!user) {
      customer = await stripe.customers.create();

      let payment = new PaymentMethod({
        user: req.user._id,
        stripeCustomerId: customer.id,
      });

      await payment.save();
    } else {
      customer = { id: user.stripeCustomerId };
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
    });

    if (!setupIntent)
      return res.status(422).send({
        clientSecret: null,
        message: messages.en.generalError,
      });

    return res.status(200).send({
      clientSecret: setupIntent.client_secret,
      customer: customer.id,
      message: messages.en.getSuccess,
    });
  } catch (err) {
    return res.status(500).send({ err: err });
  }
}

async function getMyPaymentMethods(req, res) {
  try {
    let user = await PaymentMethod.findOne({ user: req.user._id }).populate(
      "user",
      "_id fullName email"
    );

    if (!user)
      return res
        .status(200)
        .send({ paymentMethods: [], message: messages.en.noRecords });

    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: "card",
    });

    if (!paymentMethods || paymentMethods.length === 0)
      return res
        .status(200)
        .send({ paymentMethods: [], message: messages.en.getSuccess });

    return res.status(200).send({
      paymentMethods: paymentMethods.data,
      message: messages.en.getSuccess,
    });
  } catch (err) {
    return res.status(500).send({ err: err });
  }
}

async function deletePaymentMethod(req, res) {
  let paymentMethodId = req.params.id;
  let customer;
  let user = await PaymentMethod.findOne({ user: req.user._id }).populate(
    "user",
    "_id fullName email"
  );
  try {
    if (!user) {
      return res
        .status(404)
        .send({ customer: null, message: messages.en.noRecords });
    } else {
      customer = { id: user.stripeCustomerId };

      const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);

      if (!paymentMethod || paymentMethod.length === 0)
        return res
          .status(404)
          .send({ paymentMethod: null, message: messages.en.noRecords });

      return res
        .status(200)
        .send({ paymentMethod: paymentMethod, message: messages.en.deleted });
    }
  } catch (err) {
    return res
      .status(422)
      .send({ paymentMethod: null, message: messages.en.generalError });
  }
}

async function deletePaymentMethodForWebsite(req, res) {
  let cardId = req.params.id;
  let customer;
  let user = await PaymentMethod.findOne({ user: req.user._id }).populate(
    "user",
    "_id fullName email"
  );
  try {
    if (!user) {
      return res
        .status(404)
        .send({ customer: null, message: messages.en.noRecords });
    } else {
      customer = { id: user.stripeCustomerId };

      const deleted = await stripe.customers.deleteSource(customer.id, cardId);

      if (!deleted || deleted.length === 0)
        return res
          .status(404)
          .send({ paymentMethod: null, message: messages.en.noRecords });

      return res
        .status(200)
        .send({ paymentMethod: deleted, message: messages.en.deleted });
    }
  } catch (err) {
    return res
      .status(422)
      .send({ paymentMethod: null, message: messages.en.generalError });
  }
}

async function createPaymentMethodForWebsite(req, res) {
  try {
    let { card, token, name } = req.body;
    let customer;
    let user = await PaymentMethod.findOne({ user: req.user._id }).populate(
      "user",
      "_id fullName email"
    );

    if (!user) {
      customer = await stripe.customers.create({ source: token, name: name });

      let payment = new PaymentMethod({
        user: req.user._id,
        stripeCustomerId: customer.id,
      });
      await payment.save();
    } else {
      customer = await stripe.customers.update(user.stripeCustomerId, {
        source: token,
        name: name,
      });
    }

    return res.status(200).send({ customers: customer });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err: err });
  }

  //   let customer;
  //   let user = await PaymentMethod.findOne({ user: req.user._id }).populate(
  //     "user",
  //     "_id fullName email"
  //   );
  //
  //   if (!user) {
  //     customer = await stripe.customers.create();
  //
  //     let payment = new PaymentMethod({
  //       user: req.user._id,
  //       stripeCustomerId: customer.id,
  //     });
  //
  //     await payment.save();
  //   } else {
  //     customer = { id: user.stripeCustomerId };
  //   }
  //
  //   const paymentMethod = await stripe.paymentMethods.create({
  //     type: "card",
  //     card: req.body.card,
  //   });
  //
  //   const attach = await stripe.paymentMethods.attach(paymentMethod.id, {
  //     customer: customer.id,
  //   });
  //
  //   return res
  //     .status(200)
  //     .send({ paymentMethod: paymentMethod, message: messages.en.addSuccess });
  // } catch (err) {
  //   return res.status(500).send({ err: err });
  // }
}

async function paymentInWebsite(req, res) {
  try {
    let { lineItems, id, type } = req.body;

    let customer;
    let user = await PaymentMethod.findOne({ user: req.user._id }).populate(
      "user",
      "_id fullName email"
    );

    if (!user) {
      customer = await stripe.customers.create();
    } else {
      customer = { id: user.stripeCustomerId };
    }

    if (type === "order") {
      let order = await Order.findOne({ _id: mongoose.Types.ObjectId(id) });

      if (!order)
        return res
          .status(404)
          .send({ order: null, message: messages.en.noRecords });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer: customer.id,
        line_items: lineItems,
        success_url: `${CONF.DOMAIN}success/${order._id}?type=${type}`,
        cancel_url: `${CONF.DOMAIN}`,
      });

      let payment = new PaymentMethod({
        user: req.user._id,
        stripeCustomerId: customer.id,
        stripePaymentIntent: session.payment_intent,
        order: order._id,
        paymentGate: 0,
        paidAmount: order.totalPrice,
      });

      await payment.save();

      return res.status(200).send({
        session: session,
      });
    }

    if (type === "stay") {
      let booking = await PropertyBooking.findOne({
        _id: mongoose.Types.ObjectId(id),
      });

      if (!booking)
        return res
          .status(200)
          .send({ booking: null, message: messages.en.noRecords });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer: customer.id,
        line_items: lineItems,
        success_url: `${CONF.DOMAIN}success/${booking._id}?type=${type}`,
        cancel_url: `${CONF.DOMAIN}`,
      });

      let payment = new PaymentMethod({
        user: req.user._id,
        stripeCustomerId: customer.id,
        stripePaymentIntent: session.payment_intent,
        propertyBooking: booking._id,
        paymentGate: 0,
        paidAmount: booking.totalPrice,
      });

      await payment.save();

      return res.status(200).send({
        session: session,
      });
    }

    if (type === "tour") {
      let booking = await TourBooking.findOne({
        _id: mongoose.Types.ObjectId(id),
      });

      if (!booking)
        return res
          .status(200)
          .send({ booking: null, message: messages.en.noRecords });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer: customer.id,
        line_items: lineItems,
        success_url: `${CONF.DOMAIN}success/${booking._id}?type=${type}`,
        cancel_url: `${CONF.DOMAIN}`,
      });

      let payment = new PaymentMethod({
        user: req.user._id,
        stripeCustomerId: customer.id,
        stripePaymentIntent: session.payment_intent,
        tourBooking: booking._id,
        paymentGate: 0,
        paidAmount: booking.totalPrice,
      });

      await payment.save();

      return res.status(200).send({
        session: session,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err: err });
  }
}

//async function succesOnWebsitePayment(req, res) {
//  let { session_id, id, type } = req.body;
//
//  const session = await stripe.checkout.sessions.retrieve(session_id);
//  const customer = await stripe.customers.retrieve(session.customer);
//
//  const paymentIntent = await stripe.paymentIntents.retrieve(
//    session.payment_intent
//  );
//
//  if (type === "order") {
//    let order = await Order.findOne({ _id: mongoose.Types.ObjectId(id) });
//
//    if (!order)
//      return res
//        .status(404)
//        .send({ order: null, message: messages.en.noRecords });
//
//    let payment = new PaymentMethod({
//      user: req.user._id,
//      stripeCustomerId: customer.id,
//      stripePaymentIntent: paymentIntent.id,
//      order: order._id,
//      paymentGate: 0,
//      paidAmount: order.totalPrice,
//    });
//
//    await payment.save();
//
//    return res.status(200).send({
//      paymentIntent: paymentIntent,
//      id: order._id,
//      type: type,
//    });
//  }
//
//  if (type === "stay") {
//    let booking = await PropertyBooking.findOne({
//      _id: mongoose.Types.ObjectId(id),
//    });
//
//    if (!booking)
//      return res
//        .status(200)
//        .send({ booking: null, message: messages.en.noRecords });
//
//    let payment = new PaymentMethod({
//      user: req.user._id,
//      stripeCustomerId: customer.id,
//      stripePaymentIntent: paymentIntent.id,
//      propertyBooking: booking._id,
//      paymentGate: 0,
//      paidAmount: booking.totalPrice,
//    });
//
//    await payment.save();
//
//    return res.status(200).send({
//      paymentIntent: paymentIntent,
//      id: booking._id,
//      type: type,
//    });
//  }
//
//  if (type === "tour") {
//    let booking = await TourBooking.findOne({
//      _id: mongoose.Types.ObjectId(bookingId),
//    });
//
//    if (!booking)
//      return res
//        .status(200)
//        .send({ booking: null, message: messages.en.noRecords });
//
//    let payment = new PaymentMethod({
//      user: req.user._id,
//      stripeCustomerId: customer.id,
//      stripePaymentIntent: paymentIntent.id,
//      tourBooking: booking._id,
//      paymentGate: 0,
//      paidAmount: booking.totalPrice,
//    });
//
//    await payment.save();
//
//    return res.status(200).send({
//      paymentIntent: paymentIntent,
//      id: booking._id,
//      type: type,
//    });
//  }
//
//res.send(
//  `<html><body><h1>Thanks for your order, ${customer.name}!</h1></body></html>`
//);
//}

module.exports = {
  createPaymentRecordForStays_stripe,
  createPaymentRecordForTours_stripe,
  createPaymentRecordForOrders_stripe,
  checkIfUserExistInStripe,
  getMyPaymentMethods,
  createPaymentMethod,
  createPaymentMethodForWebsite,
  deletePaymentMethod,
  deletePaymentMethodForWebsite,
  paymentInWebsite,
  //succesOnWebsitePayment,
};
