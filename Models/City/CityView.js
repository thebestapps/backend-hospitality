const { City } = require("./City");
const worldMapData = require("city-state-country");
const Property = require("../Property/Property");
const messages = require("../../messages.json");
const mongoose = require("mongoose");
const { Country } = require("../Country/Country");
const CONF = require("../../constants");
const AWS = require("aws-sdk");
const fs = require("fs");

const url = (folder, picture) => {
  return `https://${CONF.AWS.BUCKET_NAME}.s3.amazonaws.com/${folder}/${picture}`;
};

async function AddCity(req, res) {
  let { country, name } = req.body;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  const selectedCountry = await Country.findOne({ _id: country });

  if (!selectedCountry)
    return res
      .status(404)
      .send({ country: null, message: messages.en.noRecords });

  //let selectedCountry = await Country.findOne({
  //  _id: country,
  //  deleted: false,
  //});
  //
  //if (!selectedCountry)
  //  return res.status(404).send({
  //    country: null,
  //    message: messages.en.noRecords,
  //  });
  //
  //let globalCountry = worldMapData
  //  .getAllCountries()
  //  .find((item) => (item.id = selectedCountry.id));
  //
  //let countryCitis = worldMapData.getAllStatesFromCountry(globalCountry.name);
  //
  //let selectedCity = countryCitis.find((item) => item.id === req.params.id);
  //
  //if (!selectedCity)
  //  return res
  //    .status(500)
  //    .send({ city: null, message: messages.en.generalError });
  //
  //let city = await City.findOne({ id: selectedCity.id });
  //
  //if (!city) {
  //  req.body.id = selectedCity.id;
  //  req.body.name = selectedCity.name;
  //  req.body.image = url("cities", req.files[0].filename);

  req.body.image = url("cities", req.files[0].filename);

  let newCity = await new City(req.body);

  let params = {
    ACL: "public-read",
    Bucket: CONF.AWS.BUCKET_NAME,
    Body: fs.createReadStream(req.files[0].path),
    Key: `cities/${req.files[0].filename}`,
  };

  AWS.config.setPromisesDependency();
  AWS.config.update({
    accessKeyId: CONF.AWS.ID,
    secretAccessKey: CONF.AWS.SECRET,
    region: CONF.AWS.REGION,
  });

  const s3 = new AWS.S3();

  s3.upload(params, async (err, data) => {
    if (err) {
      console.log("Error occured while trying to upload to S3 bucket", err);
      return res.status(500).send({ err: err });
    }

    if (data) {
      fs.unlinkSync(req.files[0].path); // Empty temp folder
      console.log(data);
      console.log(req.files[0]);
      req.body.image = data.Location;
    }
  });

  await newCity.save();

  return res.status(200).send({
    city: newCity,
    message: messages.en.addSuccess,
  });
  // }

  // if (city.deleted) {
  //   city.deleted = false;
  //   city.enabled = true;
  //
  //   await city.save();
  //
  //   return res
  //     .status(200)
  //     .send({ city: city, message: messages.en.addSuccess });
  // } else {
  //   return res.status(200).send({ city: city, message: messages.en.exist });
  // }
}

async function GetCitisOfACountryInTheWorld(req, res) {
  let globalCityId = req.params.id;

  let selectedCountry = await Country.findOne({ _id: globalCityId });

  if (!selectedCountry)
    return res
      .status(404)
      .send({ country: null, message: messages.en.noRecords });

  let country = worldMapData
    .getAllCountries()
    .find((item) => (item.id = selectedCountry.id));

  const cities = worldMapData.getAllStatesFromCountry(country.name);

  return res.status(200).send({
    cities: cities,
  });
}

async function GetCities(req, res) {
  let cities = await City.find({ deleted: false }).populate(
    "country",
    "_id name"
  );
  let data = [];

  if (cities.length === 0)
    return res
      .status(200)
      .send({ cities: data, message: messages.en.noRecords });

  let stays = await Property.find({
    city: cities.map((item) => item._id),
  }).select("_id city");

  cities.forEach(async (item) => {
    data.push({
      _id: item._id,
      name: item.name,
      image: item.image,
      country: item.country,
      enabled: item.enabled,
      stayCount: stays.filter((value) => value.city.equals(item._id)).length,
    });
  });

  return res
    .status(200)
    .send({ cities: data, message: messages.en.getSuccess });
}

async function GetCitiesApp(req, res) {
  let cities = await City.find({ deleted: false, enabled: true }).populate(
    "country",
    "_id name"
  );
  let data = [];

  if (cities.length === 0)
    return res
      .status(200)
      .send({ cities: data, message: messages.en.noRecords });

  let stays = await Property.find({
    city: cities.map((item) => item._id),
    deleted: false,
  }).select("_id city");

  cities.forEach(async (item) => {
    data.push({
      _id: item._id,
      name: item.name,
      image: item.image,
      country: item.country,
      stayCount: stays.filter((value) => value.city.equals(item._id)).length,
    });
  });

  return res
    .status(200)
    .send({ cities: data, message: messages.en.getSuccess });
}

async function GetCityById(req, res) {
  let cityId = req.params.id;

  let city = await City.findOne({
    _id: mongoose.Types.ObjectId(cityId),
    deleted: false,
  });
  if (!city)
    return res.status(404).send({ city: null, message: messages.en.noRecords });

  return res.status(200).send({ city: city, message: messages.en.getSuccess });
}

async function GetCitiesByCountryId(req, res) {
  let { countryId } = req.query;
  let data = [];

  let cities = await City.find({
    country: mongoose.Types.ObjectId(countryId),
    deleted: false,
    enabled: true,
  }).populate("country", "_id name image");

  if (cities.length === 0)
    return res
      .status(200)
      .send({ cities: data, message: messages.en.noRecords });

  let stays = await Property.find({
    city: cities.map((item) => item._id),
  }).select("_id city");

  cities.forEach(async (item) => {
    data.push({
      _id: item._id,
      name: item.name,
      image: item.image,
      country: item.country,
      enabled: item.enabled,
      stayCount: {
        count: stays.filter((value) => value.city.equals(item._id)).length,
      },
    });
  });

  return res
    .status(200)
    .send({ cities: data, message: messages.en.getSuccess });

  //
  //let cities = await City.find({
  //  country: mongoose.Types.ObjectId(countryId),
  //  deleted: false,
  //}).select("_id name image");
  //
  //if (cities.length !== 0) {
  //  const results = new Promise((resolve, reject) => {
  //    City.aggregate([
  //      { $match: { country: mongoose.Types.ObjectId(countryId) } },
  //      {
  //        $lookup: {
  //          from: "properties",
  //          let: { cityId: "$_id" },
  //          pipeline: [
  //            {
  //              $match: {
  //                $expr: { $eq: ["$$cityId", "$city"] },
  //                deleted: false,
  //              },
  //            },
  //            { $count: "count" },
  //          ],
  //          as: "stayCount",
  //        },
  //      },
  //      {
  //        $unwind: "$stayCount",
  //      },
  //    ])
  //      .then((data) => {
  //        resolve({
  //          cities: data,
  //          message: messages.en.getSuccess,
  //        });
  //      })
  //      .catch((err) => {
  //        return reject({
  //          cities: [],
  //          message: err,
  //        });
  //      });
  //  });
  //
  //  results
  //    .then((data) => {
  //      res.status(200).json(data);
  //    })
  //    .catch((err) => {
  //      res.status(409).json(err);
  //    });
  //}
}

async function EditCity(req, res) {
  let cityId = mongoose.Types.ObjectId(req.params.id);
  let { enabled } = req.body;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let city = await City.findOne({ _id: cityId });

  if (!city)
    return res.status(404).send({ city: null, message: messages.en.noRecords });

  if (req.files.length === 0) {
    let updated = await City.findOneAndUpdate(
      { _id: cityId },
      { $set: req.body },
      { new: true }
    );

    return res
      .status(200)
      .send({ city: updated, message: messages.en.updateSucces });
  } else {
    let params = {
      ACL: "public-read",
      Bucket: CONF.AWS.BUCKET_NAME,
      Body: fs.createReadStream(req.files[0].path),
      Key: `cities/${req.files[0].filename}`,
    };

    AWS.config.setPromisesDependency();
    AWS.config.update({
      accessKeyId: CONF.AWS.ID,
      secretAccessKey: CONF.AWS.SECRET,
      region: CONF.AWS.REGION,
    });

    const s3 = new AWS.S3();

    if (city.image)
      s3.deleteObject(
        {
          Bucket: CONF.AWS.BUCKET_NAME,
          Key: city.image.split(".com/").pop(),
        },
        async (data, err) => {
          if (err) return res.status(500).send({ err: err });
          if (data) {
            console.log("deleted");
          }
        }
      );

    s3.upload(params, async (err, data) => {
      if (err) {
        console.log("Error occured while trying to upload to S3 bucket", err);
        return res.status(500).send({ err: err });
      }

      if (data) {
        fs.unlinkSync(req.files[0].path); // Empty temp folder
        console.log(data);
        console.log(req.files[0]);
      }
    });

    req.body.image = url("cities", req.files[0].filename);

    let updated = await City.findOneAndUpdate(
      { _id: cityId },
      { $set: req.body },
      { new: true }
    );

    return res
      .status(200)
      .send({ city: updated, message: messages.en.updateSucces });
  }
}

async function Delete(req, res) {
  let cityId = req.params.id;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  cityId = mongoose.Types.ObjectId(cityId);

  let city = await City.findOneAndUpdate(
    { _id: cityId },
    { $set: { deleted: true, enabled: false } },
    { new: true }
  );

  if (!city)
    return res.status(404).send({ city: null, message: messages.en.noRecords });

  return res.status(200).send({ city: city, message: messages.en.deleted });
}

async function search(req, res) {
  let { searchWord } = req.query;
  let query = {};

  if (searchWord) query.name = { $regex: searchWord || "", $options: "$i" };

  let cities = await City.find(query).select("_id name");

  return res
    .status(200)
    .send({ cities: cities, message: messages.en.getSuccess });
}

module.exports = {
  AddCity,
  GetCitiesApp,
  GetCities,
  GetCitisOfACountryInTheWorld,
  GetCitiesByCountryId,
  search,
  GetCityById,
  EditCity,
  Delete,
};
