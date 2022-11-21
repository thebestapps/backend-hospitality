const User = require("./User");
const Address = require("../Address/Address");
const mongoose = require("mongoose");
const { Country } = require("../Country/Country");
const { City } = require("../City/City");
const messages = require("../../messages.json");
const PropertyBooking = require("../PropertyBooking/PropertyBooking");
const AddressView = require("../Address/AddressView");
const worldMapData = require("city-state-country");
const bcrypt = require("bcrypt");

async function getGuests(req, res) {
  let { searchWord } = req.query;
  let query = {};
  let data = [];

  if (searchWord) {
    query.$or = [
      { "fullName.first": { $regex: searchWord || "", $options: "$i" } },
      { "fullName.last": { $regex: searchWord || "", $options: "$i" } },
    ];
  }

  let users = await User.find(query).select(
    "_id fullName email phoneNumber otherPhoneNumbers imageUrl isDisactivated nationality"
  );

  const countries = worldMapData.getAllCountries();

  if (users.length !== 0)
    users.forEach((item) => {
      data.push({
        _id: item._id,
        fullName: item.fullName,
        email: item.email,
        phoneNumber: !item.phoneNumber ? "" : item.phoneNumber,
        otherPhoneNumbers: item.otherPhoneNumbers,
        imageUrl: item.imageUrl,
        isDisactivated: item.isDisactivated,
        nationality: !item.nationality
          ? null
          : countries.find((country) => item.nationality === country.id).name,
      });
    });
  return res.status(200).send({ users: data, message: messages.en.getSuccess });
}

async function getGuestById(req, res) {
  let guestId = mongoose.Types.ObjectId(req.params.id);
  let data = [];

  let user = await User.findOne({ _id: guestId }).select(
    "_id fullName email phoneNumber otherPhoneNumbers imageUrl birthday isDisactivated nationality"
  );

  if (!user)
    return res
      .status(404)
      .send({ user: null, message: messages.en.noUserFound });

  const countries = worldMapData.getAllCountries();

  let selectedCountry = countries.find(
    (item) => item.id === parseInt(user.nationality)
  );

  let userInfo = user.toObject();
  userInfo.nationality = !selectedCountry ? null : selectedCountry.name;

  const addresses = await Address.find({
    user: mongoose.Types.ObjectId(user._id),
    deleted: false,
  })
    .select("_id country city regionAndRoad buildingAndFloor isDefault")
    .populate("country", "_id name")
    .populate("city", "_id name")
    .populate("area", "_id name");

  let propertyBooking = await PropertyBooking.find({ user: guestId }).populate(
    "property",
    "_id name"
  );

  if (propertyBooking.length !== 0)
    propertyBooking.forEach((item) => {
      data.push({
        _id: item._id,
        property: item.property._id,
        name: item.property.name,
        numberOfGuests: item.numberOfGuests,
        checkInDate: item.checkInDate,
        checkOutDate: item.checkOutDate,
        totalPrice: item.totalPrice,
        paidAmount: item.paidAmount,
        currency: item.currency,
        isConfirmed: item.isConfirmed,
        isCancelled: item.isCancelled,
        confirmationCode: item.confirmationCode,
        nights: Math.round(
          (new Date(item.checkOutDate).getTime() -
            new Date(item.checkInDate).getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      });
    });

  return res.status(200).send({
    user: userInfo,
    addresses: addresses,
    bookingInfo: data,
    message: messages.en.getSuccess,
  });
}

async function editGuestInfo(req, res) {
  let guestId = mongoose.Types.ObjectId(req.params.id);
  let { password, email, phoneNumber, address } = req.body;
  let updatedAddress;
  let addresses;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let user = await User.findOne({ _id: guestId });

  if (!user)
    return res
      .status(404)
      .send({ user: null, message: messages.en.noUserFound });

  addresses = await Address.find({
    user: guestId,
    deleted: false,
  })
    .select("_id country city regionAndRoad buildingAndFloor isDefault")
    .populate("country", "_id name")
    .populate("city", "_id name")
    .populate("area", "_id name");

  if (email) {
    let existEmail = await User.findOne({ email: email })
      .where("_id")
      .ne(mongoose.Types.ObjectId(guestId));

    if (existEmail)
      return res.status(409).send({ message: messages.en.emailExist });
  }

  if (phoneNumber) {
    let existPhoneNumber = await User.findOne({ phoneNumber: phoneNumber })
      .where("_id")
      .ne(mongoose.Types.ObjectId(guestId));

    if (existPhoneNumber)
      return res
        .status(409)
        .send({ message: "This Number is alredy used with an account" });
  }

  if (password) {
    if (user.accountMethod === "emailAuth") {
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);

      let emailAuth = { password: password };
      req.body.emailAuth = emailAuth;
    } else {
      return res.status(200).send({
        isUpdated: false,
        message: "Cant change password to this type of account",
      });
    }
  }

  let updated = await User.findOneAndUpdate(
    { _id: guestId },
    { $set: req.body },
    { new: true }
  ).select("_id fullName email phoneNumber birthday imgUrl isDisactivated");

  if (address) {
    let addressId = address.addressId;
    let { countryId, cityId, isDefault } = address;

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

    let userAddress = await Address.findOne({ _id: addressId });

    if (!userAddress)
      return res.status(404).send({
        address: null,
        message: messages.en.noRecords,
      });

    console.log(req.body);

    if (!isDefault) {
      updatedAddress = await Address.findOneAndUpdate(
        { _id: addressId },
        { $set: req.body.address },
        { new: true }
      );

      addresses = await Address.find({ user: guestId, deleted: false })
        .select("_id country city regionAndRoad buildingAndFloor isDefault")
        .populate("country", "_id name")
        .populate("city", "_id name")
        .populate("area", "_id name");
    } else {
      let defaultAddrees = await Address.findOne({
        user: guestId,
        isDefault: true,
        deleted: false,
      });

      if (!defaultAddrees) {
        updatedAddress = await Address.findOneAndUpdate(
          { _id: addressId },
          { $set: req.body.address },
          { new: true }
        );

        addresses = await Address.find({
          user: guestId,
          deleted: false,
        })
          .select("_id country city regionAndRoad buildingAndFloor isDefault")
          .populate("country", "_id name")
          .populate("city", "_id name")
          .populate("area", "_id name");
      } else {
        defaultAddrees.isDefault = false;
        await defaultAddrees.save();

        updatedAddress = await Address.findOneAndUpdate(
          { _id: addressId },
          { $set: req.body.address },
          { new: true }
        );

        addresses = await Address.find({
          user: guestId,
          deleted: false,
        })
          .select("_id country city regionAndRoad buildingAndFloor isDefault")
          .populate("country", "_id name")
          .populate("city", "_id name")
          .populate("area", "_id name");
      }
    }
  }

  return res.status(200).send({
    user: updated,
    isUpdated: true,
    addresses: addresses,
    message: messages.en.updateSucces,
  });
}

async function editAddress(req, res) {
  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  AddressView.editAddress(req, res);
}

async function addGuest(req, res) {
  let { email, phoneNumber, password } = req.body;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  if (email) {
    let existEmail = await User.findOne({ email: email });

    if (existEmail)
      return res.status(409).send({ message: messages.en.emailExist });
  }

  if (phoneNumber) {
    let existPhoneNumber = await User.findOne({ phoneNumber: phoneNumber });

    if (existPhoneNumber)
      return res
        .status(409)
        .send({ message: "This Number is alredy used with an account" });
  }

  let emailAuth = { email: email };

  if (password) {
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);
    emailAuth.password = password;
  }

  req.body.emailAuth = emailAuth;
  req.body.accountMethod = "emailAuth";

  let newGuest = new User(req.body);
  await newGuest.save();

  return res
    .status(200)
    .send({ guest: newGuest, message: messages.en.addSuccess });
}

async function getAllAsDropDown(req, res) {
  let { searchWord } = req.body;
  let filter = { deleted: false };
  let query = {};

  if (searchWord) {
    query.$or = [
      { "fullName.first": { $regex: searchWord || "", $options: "$i" } },
      { "fullName.last": { $regex: searchWord || "", $options: "$i" } },
    ];
  }

  let users = await User.find(query)
    .select("_id fullName")
    .where("deleted")
    .ne(false);

  return res.status(200).send({ users, message: messages.en.getSuccess });
}

module.exports = {
  getGuests,
  getGuestById,
  editGuestInfo,
  editAddress,
  addGuest,
  getAllAsDropDown,
};
