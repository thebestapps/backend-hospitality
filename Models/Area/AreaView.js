const { Area } = require("./Area");
const messages = require("../../messages.json");
const mongoose = require("mongoose");
const { City } = require("../City/City");

async function AddArea(req, res) {
  let { name, city } = req.body;
  req.body.city = mongoose.Types.ObjectId(city);

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let area = new Area(req.body);
  await area.save();

  return res.status(200).send({ area: area, message: messages.en.addSuccess });
}

async function GetAreas(req, res) {
  let areas = await Area.find({ deleted: false }).populate("city", "_id name");

  if (areas.length === 0)
    return res.status(200).send({ areas: [], message: messages.en.noRecords });

  return res
    .status(200)
    .send({ areas: areas, message: messages.en.getSuccess });
}

async function GetAreasApp(req, res) {
  let areas = await Area.find({ deleted: false, enabled: true }).populate(
    "city",
    "_id name"
  );

  if (areas.length === 0)
    return res.status(200).send({ areas: [], message: messages.en.noRecords });

  return res
    .status(200)
    .send({ areas: areas, message: messages.en.getSuccess });
}

async function GetAreaById(req, res) {
  let areaId = req.params.id;

  let area = await Area.findOne({
    deleted: false,
    enabled: true,
    _id: mongoose.Types.ObjectId(areaId),
  });

  if (!area)
    return res.status(404).send({ area: null, message: messages.en.noRecords });

  return res.status(200).send({ area: area, message: messages.en.getSuccess });
}

async function GetAreasByCountryId(req, res) {
  let { countryId } = req.query;

  let cities = await City.find({
    deleted: false,
    enabled: true,
    country: mongoose.Types.ObjectId(countryId),
  }).select("_id");

  let citiesIds = cities.map((city) => city._id);

  let areas = await Area.find({
    deleted: false,
    enabled: true,
    city: citiesIds,
  }).populate("city", "_id name country");

  if (areas.length === 0)
    return res.status(200).send({ areas: [], message: messages.en.noRecords });

  return res
    .status(200)
    .send({ areas: areas, message: messages.en.getSuccess });
}

async function EditArea(req, res) {
  let areaId = req.params.id;
  let { enabled } = req.body;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  areaId = mongoose.Types.ObjectId(areaId);

  let area = await Area.findOneAndUpdate(
    { _id: areaId },
    { $set: req.body },
    { new: true }
  );

  if (!area)
    return res.status(404).send({ area: null, message: messages.en.noRecords });

  return res
    .status(200)
    .send({ area: area, message: messages.en.updateSucces });
}

async function Delete(req, res) {
  let areaId = req.params.id;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  areaId = mongoose.Types.ObjectId(areaId);

  let area = await Area.findOneAndUpdate(
    { _id: areaId },
    { $set: { deleted: true, enabled: false } },
    { new: true }
  );

  if (!area)
    return res.status(404).send({ area: null, message: messages.en.noRecords });

  return res.status(200).send({ area: area, message: messages.en.deleted });
}
module.exports = {
  AddArea,
  GetAreasApp,
  GetAreas,
  GetAreasByCountryId,
  GetAreaById,
  EditArea,
  Delete,
};
