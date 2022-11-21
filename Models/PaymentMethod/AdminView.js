const PaymentMethod = require("./PaymentMethod");
const messages = require("../../messages.json");

async function getPaymentIntenstRecords(req, res) {
  const intents = await PaymentMethod.find()
    .populate("user", "_id fullName urlImage")
    .populate("propertyBooking", "_id property")
    .populate("tourBooking", "_id tour")
    .populate("order", "_id");

  return res.status(200).send({ intents, message: messages.en.getSuccess });
}

module.exports = { getPaymentIntenstRecords };
