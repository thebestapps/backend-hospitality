const { Currency } = require("./Currency");
const messages = require("../../messages.json");
const mongoose = require("mongoose");

async function AddCurrency(req, res) {
  let { name, symbol, isWebSiteDefault } = req.body;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let currency = await Currency.findOne({ name: name, deleted: false });

  if (currency) return res.status(400).send({ message: messages.en.exists });
  else {
    if (isWebSiteDefault) {
      currency = await Currency.findOne({ isWebSiteDefault: true });

      if (currency)
        return res.status(200).send({
          currency: currency,
          message: "Default currency already exist",
        });
    }

    currency = new Currency(req.body);
    await currency.save();

    return res
      .status(200)
      .send({ currency: currency, message: messages.en.addSuccess });
  }
}

async function GetCurrencyApp(req, res) {
  let currency = await Currency.find({ deleted: false, enabled: true });

  if (currency.length === 0)
    return res
      .status(200)
      .send({ currencies: currency, message: messages.en.noRecords });

  return res
    .status(200)
    .send({ currencies: currency, message: messages.en.getSuccess });
}

async function GetCurrency(req, res) {
  let currency = await Currency.find({ deleted: false });

  if (currency.length === 0)
    return res
      .status(200)
      .send({ currencies: currency, message: messages.en.noRecords });

  return res
    .status(200)
    .send({ currencies: currency, message: messages.en.getSuccess });
}

async function GetCurrencyById(req, res) {
  let currencyId = req.params.id;

  let currency = await Currency.findOne({
    _id: mongoose.Types.ObjectId(currencyId),
    deleted: false,
    enabled: true,
  });
  if (!currency)
    return res.status(404).send({ message: messages.en.noRecords });

  return res
    .status(200)
    .send({ currency: currency, message: messages.en.getSuccess });
}

async function GetDefaultCurrency(req, res) {
  let currency = await Currency.findOne({
    isWebSiteDefault: true,
    deleted: false,
    enabled: true,
  });
  if (!currency)
    return res.status(404).send({ message: messages.en.noRecords });

  return res
    .status(200)
    .send({ currency: currency, message: messages.en.getSuccess });
}

async function edit(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let currencyId = req.params.id;
  let { enabled } = req.body;

  currencyId = mongoose.Types.ObjectId(currencyId);

  let currency = await Currency.findOneAndUpdate(
    { _id: currencyId },
    { $set: req.body },
    { new: true }
  );

  if (!currency)
    return res.status(404).send({ message: messages.en.noRecords });

  return res
    .status(200)
    .send({ currency: currency, message: messages.en.updateSucces });
}

async function Delete(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let currencyId = req.params.id;

  currencyId = mongoose.Types.ObjectId(currencyId);

  let currency = await Currency.findOneAndUpdate(
    { _id: currencyId },
    { $set: { deleted: true, enabled: false } },
    { new: true }
  );

  if (!currency)
    return res.status(404).send({ message: messages.en.noRecords });

  return res
    .status(200)
    .send({ currency: currency, message: messages.en.deleted });
}

module.exports = {
  AddCurrency,
  GetCurrencyApp,
  GetCurrency,
  GetCurrencyById,
  GetDefaultCurrency,
  edit,
  Delete,
};
