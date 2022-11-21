const Address = require("./Address");
const { Country } = require("../Country/Country");
const { City } = require("../City/City");
const { Area } = require("../Area/Area");
const messages = require("../../messages.json");
const mongoose = require("mongoose");
const _ = require("lodash");

async function createAddress(req, res) {
  let { countryId, cityId, areaId, isDefault } = req.body;
  let addresses;

  let country = await Country.findOne({
    _id: mongoose.Types.ObjectId(countryId),
  });

  if (!country)
    return res
      .status(404)
      .send({ country: null, message: messages.en.noRecords });

  let city = await City.findOne({
    _id: mongoose.Types.ObjectId(cityId),
  });

  if (!city)
    return res.status(404).send({ city: null, message: messages.en.noRecords });

  req.body.country = countryId;
  req.body.city = cityId;
  //req.body.area = areaId;
  req.body.user = req.user._id;

  if (isDefault) {
    let existAddress = await Address.findOne({
      isDefault: true,
      user: mongoose.Types.ObjectId(req.user._id),
    });

    if (!existAddress) {
      const newAddress = new Address(req.body);
      await newAddress.save();

      addresses = await Address.find({
        user: mongoose.Types.ObjectId(req.user._id),
        deleted: false,
      })
        .select(
          "_id country city cityWritten regionAndRoad buildingAndFloor isDefault"
        )
        .populate("country", "_id name")
        .populate("city", "_id name")
        .populate("area", "_id name");

      return res.status(200).send({
        newAddress: newAddress,
        addresses: addresses,
        message: messages.en.addSuccess,
      });
    } else {
      existAddress.isDefault = false;

      const newAddress = new Address(req.body);
      await newAddress.save();
      await existAddress.save();

      addresses = await Address.find({
        user: mongoose.Types.ObjectId(req.user._id),
        deleted: false,
      })
        .select(
          "_id country city cityWritten regionAndRoad buildingAndFloor isDefault"
        )
        .populate("country", "_id name")
        .populate("city", "_id name")
        .populate("area", "_id name");

      return res.status(200).send({
        newAddress: newAddress,
        addresses: addresses,
        message: messages.en.addSuccess,
      });
    }
  }

  const newAddress = new Address(req.body);
  await newAddress.save();

  addresses = await Address.find({
    user: mongoose.Types.ObjectId(req.user._id),
    deleted: false,
  })
    .select(
      "_id country city cityWritten regionAndRoad buildingAndFloor isDefault"
    )
    .populate("country", "_id name")
    .populate("city", "_id name")
    .populate("area", "_id name");

  return res.status(200).send({
    newAddress: newAddress,
    addresses: addresses,
    message: messages.en.addSuccess,
  });
}

async function editAddress(req, res) {
  let addressId = mongoose.Types.ObjectId(req.params.id);
  let { countryId, cityId, isDefault } = req.body;
  let updatedAddress;
  let addresses;

  if (countryId) {
    let country = await Country.findOne({
      _id: mongoose.Types.ObjectId(countryId),
    });

    if (!country)
      return res
        .status(404)
        .send({ country: null, message: messages.en.noRecords });

    req.body.country = countryId;
  }

  if (cityId) {
    let city = await City.findOne({
      _id: mongoose.Types.ObjectId(cityId),
    });

    if (!city)
      return res
        .status(404)
        .send({ city: null, message: messages.en.noRecords });

    req.body.city = cityId;
  }

  let address = await Address.findOne({ _id: addressId });

  if (!address)
    return res.status(404).send({
      address: null,
      message: messages.en.noRecords,
    });

  console.log(req.body);

  if (!isDefault) {
    updatedAddress = await Address.findOneAndUpdate(
      { _id: addressId },
      { $set: req.body },
      { new: true }
    );

    addresses = await Address.find({ user: req.user._id, deleted: false })
      .select(
        "_id country city cityWritten regionAndRoad buildingAndFloor isDefault"
      )
      .populate("country", "_id name")
      .populate("city", "_id name")
      .populate("area", "_id name");

    return res.status(200).send({
      address: updatedAddress,
      addresses: addresses,
      message: messages.en.updateSucces,
    });
  } else {
    let defaultAddrees = await Address.findOne({
      user: req.user._id,
      isDefault: true,
      deleted: false,
    });

    if (!defaultAddrees) {
      updatedAddress = await Address.findOneAndUpdate(
        { _id: addressId },
        { $set: req.body },
        { new: true }
      );

      addresses = await Address.find({
        user: req.user._id,
        deleted: false,
      })
        .select(
          "_id country city cityWritten regionAndRoad buildingAndFloor isDefault"
        )
        .populate("country", "_id name")
        .populate("city", "_id name")
        .populate("area", "_id name");

      return res.status(200).send({
        address: updatedAddress,
        addresses: addresses,
        message: messages.en.updateSucces,
      });
    } else {
      defaultAddrees.isDefault = false;
      await defaultAddrees.save();

      updatedAddress = await Address.findOneAndUpdate(
        { _id: addressId },
        { $set: req.body },
        { new: true }
      );

      addresses = await Address.find({
        user: req.user._id,
        deleted: false,
      })
        .select(
          "_id country city cityWritten regionAndRoad buildingAndFloor isDefault"
        )
        .populate("country", "_id name")
        .populate("city", "_id name")
        .populate("area", "_id name");

      return res.status(200).send({
        address: updatedAddress,
        addresses: addresses,
        message: messages.en.updateSucces,
      });
    }
  }
}

async function setAddressToDefault(req, res) {
  let addressId = mongoose.Types.ObjectId(req.params.id);
  let addresses;

  let defaultAddressExist = await Address.findOne({
    user: req.user._id,
    deleted: false,
    isDefault: true,
  })
    .select("_id country city cityWritten area street building floor isDefault")
    .populate("country", "_id name")
    .populate("city", "_id name")
    .populate("area", "_id name");

  let address = await Address.findOne({
    _id: mongoose.Types.ObjectId(addressId),
  })
    .select("_id country city cityWritten area street building floor isDefault")
    .populate("country", "_id name")
    .populate("city", "_id name")
    .populate("area", "_id name");

  if (!address)
    return res
      .status(404)
      .send({ address: null, message: messages.en.noRecords });

  if (!defaultAddressExist) {
    address.isDefault = true;
    await address.save();
  }

  if (_.isEqual(defaultAddressExist._id, addressId)) {
    addresses = await Address.find({
      user: mongoose.Types.ObjectId(req.user._id),
      deleted: false,
    })
      .select(
        "_id country city cityWritten regionAndRoad buildingAndFloor isDefault"
      )
      .populate("country", "_id name")
      .populate("city", "_id name")
      .populate("area", "_id name");

    return res.status(200).send({
      address: defaultAddressExist,
      addresses: addresses,
      message: messages.en.updateSucces,
    });
  }

  defaultAddressExist.isDefault = false;
  address.isDefault = true;

  await address.save();
  await defaultAddressExist.save();

  addresses = await Address.find({
    user: mongoose.Types.ObjectId(req.user._id),
    deleted: false,
  })
    .select(
      "_id country city cityWritten regionAndRoad buildingAndFloor isDefault"
    )
    .populate("country", "_id name")
    .populate("city", "_id name")
    .populate("area", "_id name");

  return res.status(200).send({
    address: address,
    addresses: addresses,
    message: messages.en.updateSucces,
  });
}

async function getAddresses(req, res) {
  const addresses = await Address.find({
    deleted: false,
  })
    .select("_id country city cityWritten area street building floor isDefault")
    .populate("country", "_id name")
    .populate("city", "_id name")
    .populate("area", "_id name");

  return res
    .status(200)
    .send({ addresses: addresses, message: messages.en.getSuccess });
}

async function deleteAddress(req, res) {
  let addressId = mongoose.Types.ObjectId(req.params.id);

  let address = await Address.findOne({ _id: addressId, deleted: false });

  if (!address)
    return res
      .status(404)
      .send({ address: null, message: messages.en.noRecords });

  address.deleted = true;
  await address.save();

  return res.status(200).send({
    address: address,
    message: messages.en.deleted,
  });
}

module.exports = {
  createAddress,
  getAddresses,
  editAddress,
  deleteAddress,
  setAddressToDefault,
};
