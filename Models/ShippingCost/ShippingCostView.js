const ShippingCost = require("./ShippingCost");
const messages = require("../../messages.json");
const { Currency } = require("../Currency/Currency");

async function addShippingCost(req, res) {
  let { cost, currencyId } = req.body;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  const shippingCost = await ShippingCost.findOne({ id: "1" }).select(
    "_id cost currency"
  );

  if (!shippingCost) {
    let currency = await Currency.findOne({ _id: currencyId, deleted: false });

    if (!currency)
      return res
        .status(404)
        .send({ currency: null, message: messages.en.noRecords });

    req.body.id = "1";
    req.body.currency = currencyId;

    let newCost = new ShippingCost(req.body);

    await newCost.save();

    return res.status(200).send({
      shippingCost: {
        _id: newCost._id,
        cost: newCost.cost,
        currency: newCost.currency,
      },
      message: messages.en.addSuccess,
    });
  }
  return res
    .status(200)
    .send({ shippingCost: shippingCost, message: messages.en.exist });
}

async function getCost(req, res) {
  let conversion = req.conversion;

  const shippingCost = await ShippingCost.findOne({ id: "1" })
    .select("_id cost currency")
    .populate("currency", "_id name symbol");

  if (!shippingCost)
    return res
      .status(404)
      .send({ shippingCost: null, message: messages.en.noRecords });

  let response = {
    _id: shippingCost._id,
    cost: !conversion ? shippingCost.cost : shippingCost.cost * conversion.rate,
    currency: !conversion ? shippingCost.currency : conversion.to,
  };

  return res
    .status(200)
    .send({ shippingCost: response, message: messages.en.getSuccess });
}

async function editCost(req, res) {
  let { currencyId } = req.body;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  const shippingCost = await ShippingCost.findOne({ id: "1" });

  if (!shippingCost)
    return res
      .status(404)
      .send({ shippingCost: null, message: messages.en.noRecords });

  if (currencyId) {
    let currency = await Currency.findOne({ _id: currencyId, deleted: false });

    if (!currency)
      return res
        .status(404)
        .send({ currency: null, message: messages.en.noRecords });

    req.body.currency = currencyId;
  }

  let updated = await ShippingCost.findOneAndUpdate(
    { id: "1" },
    { $set: req.body },
    { new: true }
  )
    .populate("currency", "_id name symbol")
    .select("cost currency");

  return res
    .status(200)
    .send({ shippingCost: updated, message: messages.en.updateSucces });
}

module.exports = { addShippingCost, getCost, editCost };
