const { Country } = require("./Country");
const worldMapData = require("city-state-country");
const messages = require("../../messages.json");
const mongoose = require("mongoose");

async function AddCountry(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  const countries = worldMapData.getAllCountries();

  let selectedCountry = countries.find(
    (item) => item.id === parseInt(req.params.id)
  );

  if (!selectedCountry)
    return res
      .status(500)
      .send({ country: null, message: messages.en.generalError });

  let country = await Country.findOne({ id: selectedCountry.id });

  if (!country) {
    let newCountry = new Country({
      name: selectedCountry.name,
      id: selectedCountry.id,
    });

    await newCountry.save();

    return res
      .status(200)
      .send({ country: newCountry, message: messages.en.addSuccess });
  }

  if (country.deleted) {
    country.deleted = false;
    country.enabled = true;

    await country.save();

    return res
      .status(200)
      .send({ country: country, message: messages.en.addSuccess });
  } else {
    return res.status(200).send({
      country: country,
      message: messages.en.exist,
    });
  }
}

async function GetCountries(req, res) {
  let countries = await Country.find({ deleted: false });

  if (countries.length === 0)
    return res
      .status(200)
      .send({ countries: [], message: messages.en.noRecords });

  return res
    .status(200)
    .send({ countries: countries, message: messages.en.getSuccess });
}

async function GetCountriesApp(req, res) {
  let countries = await Country.find({ deleted: false, enabled: true });

  if (countries.length === 0)
    return res
      .status(200)
      .send({ countries: [], message: messages.en.noRecords });

  return res
    .status(200)
    .send({ countries: countries, message: messages.en.getSuccess });
}

async function GetAllCountries(req, res) {
  const countriesList = worldMapData.getAllCountries();
  let data = [];

  if (countriesList.length !== 0)
    countriesList.forEach((item) => {
      data.push({
        id: item.id,
        name: item.name,
      });
    });

  return res
    .status(200)
    .send({ countries: data, message: messages.en.getSuccess });
}

async function GetCountryById(req, res) {
  let countryId = req.params.id;

  let country = await Country.findOne({
    deleted: false,
    _id: mongoose.Types.ObjectId(countryId),
  });
  if (!country)
    return res
      .status(404)
      .send({ country: null, message: messages.en.noRecords });

  return res
    .status(200)
    .send({ country: country, message: messages.en.getSuccess });
}

async function EditCountry(req, res) {
  let countryId = req.params.id;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  countryId = mongoose.Types.ObjectId(countryId);

  let country = await Country.findOneAndUpdate(
    { _id: countryId, deleted: false },
    { $set: req.body },
    { new: true }
  );

  if (!country)
    return res
      .status(404)
      .send({ country: null, message: messages.en.noRecords });

  return res
    .status(200)
    .send({ country: country, message: messages.en.updateSucces });
}

async function Delete(req, res) {
  let countryId = req.params.id;

  countryId = mongoose.Types.ObjectId(countryId);

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let country = await Country.findOneAndUpdate(
    { _id: countryId, deleted: false },
    { $set: { deleted: true, enabled: false } },
    { new: true }
  );

  if (!country)
    return res
      .status(404)
      .send({ country: null, message: messages.en.noRecords });

  return res
    .status(200)
    .send({ country: country, message: messages.en.deleted });
}

module.exports = {
  AddCountry,
  GetCountriesApp,
  GetCountries,
  GetAllCountries,
  GetCountryById,
  EditCountry,
  Delete,
};
