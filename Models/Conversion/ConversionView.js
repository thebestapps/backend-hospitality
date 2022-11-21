const Rate = require("./Conversion");
const { Currency } = require("../Currency/Currency");
const mongoose = require("mongoose");
const messages = require("../../messages.json");

async function createRate(req, res) {
  let { to, from } = req.body;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let fromCurrency = await Currency.findOne({
    _id: mongoose.Types.ObjectId(from),
  });

  if (!fromCurrency)
    return res.status(404).send({ from: null, message: messages.en.noRecords });

  let toCurrency = await Currency.findOne({
    _id: mongoose.Types.ObjectId(to),
  });

  if (!toCurrency)
    return res.status(404).send({ to: null, message: messages.en.noRecords });

  let existRate = await Rate.findOne({
    to: mongoose.Types.ObjectId(to),
    from: mongoose.Types.ObjectId(from),
  });

  if (existRate)
    return res
      .status(422)
      .send({ isExist: true, message: "Record already exist you can edit it" });

  const newRate = new Rate(req.body);
  await newRate.save();
  return res
    .status(200)
    .send({ newRate: newRate, message: messages.en.addSuccess });
}

async function getRates(req, res) {
  let rates = await Rate.find()
    .populate("from", "_id name symbol")
    .populate("to", "_id name symbol");

  if (rates.length === 0)
    return res
      .status(200)
      .send({ rates: rates, message: messages.en.noRecords });

  return res
    .status(200)
    .send({ rates: rates, message: messages.en.getSuccess });
}

async function getRateById(req, res) {
  let rateId = mongoose.Types.ObjectId(req.params.id);

  let rate = await Rate.findOne({ _id: rateId })
    .populate("from", "_id name symbol")
    .populate("to", "_id name symbol");

  if (!rate)
    return res.status(404).send({ rate: null, message: messages.en.noRecords });

  return res.status(200).send({ rate: rate, message: messages.en.getSuccess });
}

async function editRate(req, res) {
  let rateId = mongoose.Types.ObjectId(req.params.id);

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let rate = await Rate.findOne({ _id: rateId })
    .populate("from", "_id name symbol")
    .populate("to", "_id name symbol");

  if (!rate)
    return res.status(404).send({ rate: null, message: messages.en.noRecords });

  let updatedRate = await Rate.findOneAndUpdate(
    { _id: rateId },
    { $set: req.body },
    { new: true }
  );

  return res
    .status(200)
    .send({ rate: updatedRate, message: messages.en.getSuccess });
}

async function editRate(req, res) {
  let rateId = mongoose.Types.ObjectId(req.params.id);

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let rate = await Rate.findOne({ _id: rateId })
    .populate("from", "_id name symbol")
    .populate("to", "_id name symbol");

  if (!rate)
    return res.status(404).send({ rate: null, message: messages.en.noRecords });

  let updatedRate = await Rate.findOneAndUpdate(
    { _id: rateId },
    { $set: req.body },
    { new: true }
  );

  return res
    .status(200)
    .send({ rate: updatedRate, message: messages.en.updateSucces });
}

async function deleteRate(req, res) {
  let rateId = mongoose.Types.ObjectId(req.params.id);

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let rate = await Rate.findOne({ _id: rateId })
    .populate("from", "_id name symbol")
    .populate("to", "_id name symbol");

  if (!rate)
    return res.status(404).send({ rate: null, message: messages.en.noRecords });

  let deletedRate = await Rate.findOneAndDelete({ _id: rateId });

  return res
    .status(200)
    .send({ rate: deletedRate, message: messages.en.deleted });
}

async function getDefaultCurrencyRate(req, res) {
  let currency = await Currency.findOne({ isWebSiteDefault: true });

  if (!currency)
    return res
      .status(404)
      .send({ currency: null, message: messages.en.noRecords });

  let rates = await Rate.find({
    from: mongoose.Types.ObjectId(currency._id),
  }).populate("to", "_id name symbol");

  let result = Object.fromEntries(rates.map((e) => [e.to.symbol, e.rate]));

  console.log(rates);

  if (!result)
    return res.status(404).send({ rate: null, message: messages.en.noRecords });

  return res
    .status(200)
    .send({ rate: result, message: messages.en.getSuccess });
}

module.exports = {
  createRate,
  getRates,
  editRate,
  deleteRate,
  getRateById,
  getDefaultCurrencyRate,
};
