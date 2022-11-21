const User = require("./User");
const Address = require("../Address/Address");
const mongoose = require("mongoose");
const Cart = require("../Cart/Cart");
const CartItems = require("../CartItem/CartItem");
const { Country } = require("../Country/Country");
const Product = require("../Product/Product");
const Property = require("../Property/Property");
const Tour = require("../Tour/Tour");
const { Review } = require("../Reviews/Review");
const { Currency } = require("../Currency/Currency");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const messages = require("../../messages.json");
const {
  sendByTwilio,
  sendByMailGun,
  isValidEmail,
} = require("../../Services/generalServices");
const worldMapData = require("city-state-country");

async function getProfile(req, res) {
  let response = { isInfoComplete: true };
  let cartItems = [];

  if (!req.user)
    return res.status(400).send({
      message: messages.en.missingAuthorizationHeader,
      authorized: false,
    });

  let user = await User.findOne({
    _id: mongoose.Types.ObjectId(req.user._id),
  }).populate("currency", "_id name symbol");

  if (user.fullName.first === null || user.fullName.last === null)
    response.isInfoComplete = false;
  if (user.birthday === null) response.isInfoComplete = false;

  const addresses = await Address.find({
    user: mongoose.Types.ObjectId(req.user._id),
    deleted: false,
  })
    .select(
      "_id country city cityWritten regionAndRoad buildingAndFloor isDefault"
    )
    .populate("country", "_id name")
    .populate("city", "_id name")
    .populate("area", "_id name");

  //Get cart products id's

  let cart = await Cart.findOne({ user: req.user._id, cartStatus: "open" });
  if (!cart) {
    cartItems = [];
  } else {
    cartItems = await CartItems.find({ cart: cart._id }).select("product");
  }
  let userResponse = user.toObject();
  userResponse.addresses = addresses;
  userResponse.cartItems = cartItems;

  let nationality = worldMapData
    .getAllCountries()
    .find((item) => item.id === user.nationality);

  userResponse.nationality = !nationality ? null : nationality;

  response.user = userResponse;

  return res.status(200).send(response);
}

async function updateInfo(req, res) {
  let {
    birthday,
    email,
    password,
    phoneNumbers,
    defaultPhoneNumber,
    countryId,
    currency,
  } = req.body;
  let userId = req.user._id;
  let otherNumbers = [];
  let response = {};

  //Complete info of new user or edit info of old one
  if (new Date().getFullYear - new Date(birthday).getFullYear < 18)
    return res.status(400).send({ message: messages.en.ageRestriction });

  let user = await User.findOne({ _id: mongoose.Types.ObjectId(userId) });

  if (!user) return res.status(400).send({ message: messages.en.noRecords });

  if (user.accountMethod === "emailAuth") {
    if (password) {
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);

      let emailAuth = { password: password };
      req.body.emailAuth = emailAuth;
    }
  }

  //Check if phone number is regesterd with other accounts or used as a sign in method of another account
  if (defaultPhoneNumber) {
    if (!req.user.phoneNumber) {
      let existUser = await User.findOne({
        "phone.phoneNumber": defaultPhoneNumber,
        accountMethod: "phone",
      });

      if (existUser)
        return res.status(400).send({
          profileUpdated: false,
          message: messages.en.cantRegisertWithThisNumber,
        });

      existUser = await User.findOne({
        phoneNumber: defaultPhoneNumber,
      })
        .where("_id")
        .ne(userId);

      if (existUser)
        return res.status(400).send({
          profileUpdated: false,
          message: messages.en.cantRegisertWithThisNumber,
        });

      req.body.phoneNumber = defaultPhoneNumber;
    }
  }

  //dont add numbers that exist
  if (phoneNumbers && phoneNumbers.length !== 0) {
    if (phoneNumbers.includes(req.user.phoneNumber)) {
      const index = phoneNumbers.indexOf(req.user.phoneNumber);
      if (index > -1) {
        phoneNumbers.splice(index, 1);
      }
    }
    req.body.otherPhoneNumbers = phoneNumbers;
  }

  if (email) {
    if (!isValidEmail(email))
      return res.status(422).send({ message: "Not an Email" });

    if (!req.user.email) {
      let existUser = await User.findOne({
        "emailAuth.email": email,
        accountMethod: "emailAuth",
      });

      if (existUser)
        return res.status(400).send({
          profileUpdated: false,
          message: "Cant Regiser With This email",
        });

      existUser = await User.findOne({
        email: email,
      })
        .where("_id")
        .ne(userId);

      if (existUser)
        return res.status(400).send({
          profileUpdated: false,
          message: "Cant Regiser With This email",
        });

      req.body.email = email.toLowerCase();
    }
  }

  if (countryId) {
    let country = await Country.findOne({
      _id: mongoose.Types.ObjectId(countryId),
    });

    if (!country)
      return res
        .status(404)
        .send({ country: null, message: messages.en.noRecords });

    req.body.country = country._id;
  }

  if (currency) {
    let existCurrency = await Currency.findOne({
      _id: mongoose.Types.ObjectId(currency),
      deleted: false,
      enabled: true,
    });

    if (!existCurrency)
      return res
        .status(404)
        .send({ currency: null, message: messages.en.noRecords });

    req.body.currency = existCurrency._id;
  }

  //save new added info after all conditions
  user = await User.findOneAndUpdate(
    { _id: mongoose.Types.ObjectId(userId) },
    { $set: req.body },
    {
      new: true,
    }
  ).populate("currency", "_id name symbol");

  const addresses = await Address.find({
    user: mongoose.Types.ObjectId(req.user._id),
    deleted: false,
  })
    .select(
      "_id country city cityWritten regionAndRoad buildingAndFloor isDefault"
    )
    .populate("country", "_id name")
    .populate("city", "_id name")
    .populate("area", "_id name");

  response.token = user.generateJWT();

  user = user.toObject();

  user.addresses = addresses;

  let nationality = worldMapData
    .getAllCountries()
    .find((item) => item.id === user.nationality);

  user.nationality = !nationality ? null : nationality;

  response.user = user;

  response.message = messages.en.signUpSuccess;

  return res.status(200).send(response);
}

async function getFavorites(req, res) {
  let reviewsCount = 0;
  let reviewsSum = 0;
  let reviewsAvg = 0;
  let conversion = req.conversion;
  const daysNumbers = [0, 6]; //0 is sunday and 1 is saturday

  let favoritePropertiesIds = req.user.favoriteProperties.map((id) => {
    return mongoose.Types.ObjectId(id);
  });

  let favoriteToursIds = req.user.favoriteTours.map((id) => {
    return mongoose.Types.ObjectId(id);
  });

  let favoriteProductsIds = req.user.favoriteProducts.map((id) => {
    return mongoose.Types.ObjectId(id);
  });

  let favoriteProperties = [];
  let favoriteTours = [];
  let favoriteProducts = [];

  let properties = await Property.find({ deleted: false })
    .where("_id")
    .in(favoritePropertiesIds)
    .populate("price.currency", "_id name symbol")
    .populate("area", "_id name");

  let propertyReviews = await Review.find().where("property").ne(null);
  let toursReviews = await Review.find().where("tour").ne(null);

  properties.forEach((item) => {
    let price = 0;

    if (daysNumbers.includes(new Date().getDay())) {
      price = item.priceAccordingToWeekends.price;
    }

    //Prices if days are weekdays
    else {
      price = item.priceAccordingToWeekDays.price;
    }

    //Check if date is in a range where price may be diffrent and change the price
    item.priceAccordingToDate.forEach((ele) => {
      ele.dates.forEach((date) => {
        new Date(date).getTime() ===
        new Date(new Date().setUTCHours(0, 0, 0, 0)).getTime()
          ? (price = ele.price)
          : (price = price);
      });
    });

    //Get reviews average
    let reviews = [];
    if (propertyReviews.length !== 0) {
      propertyReviews.forEach((review) => {
        if (_.isEqual(item._id, review.property)) {
          reviewsSum = reviewsSum + review.rate;
          reviewsCount++;
          reviews.push({
            rate: review.rate,
            review: review.review,
            location:
              review.city === null
                ? null
                : `${review.city.name}, ${review.city.country.name}`,
          });
        }
      });
    }

    reviewsCount == 0
      ? (reviewsAvg = 0)
      : (reviewsAvg = reviewsSum / reviewsCount);

    favoriteProperties.push({
      _id: item._id,
      name: item.name,
      urlName: item.urlName,
      image: item.images[0],
      price: !conversion
        ? `${price} ${item.price.currency.symbol}`
        : `${price * conversion.rate} ${conversion.to.symbol}`,
      location: item.area.name,
      numberOfGuests:
        item.numberOfGuests.adults +
        item.numberOfGuests.childrens +
        item.numberOfGuests.infants,
      rate: reviewsAvg,
      reviews: reviews,
    });

    reviewsCount = 0;
    reviewsAvg = 0;
    reviewsSum = 0;
  });

  let tours = await Tour.find({ deleted: false })
    .where("_id")
    .in(favoriteToursIds)
    .populate("price.currency", "_id symbol")
    .populate("area", "_id name");

  tours.forEach((item) => {
    let price = 0;
    price = item.price.amount.adults;

    //Get reviews average
    let reviews = [];
    if (toursReviews.length !== 0) {
      toursReviews.forEach((review) => {
        if (_.isEqual(item._id, review.tour)) {
          reviewsSum = reviewsSum + review.rate;
          reviewsCount++;
          reviews.push({
            rate: review.rate,
            review: review.review,
            location:
              review.city === null
                ? null
                : `${review.city.name}, ${review.city.country.name}`,
          });
        }
      });
    }

    reviewsCount == 0
      ? (reviewsAvg = 0)
      : (reviewsAvg = reviewsSum / reviewsCount);

    favoriteTours.push({
      _id: item._id,
      title: item.title,
      urlName: item.urlName,
      image: item.images[0],
      location: item.area.name,
      price: !conversion
        ? `${price} ${item.price.currency.symbol}`
        : `${price * conversion.rate} ${conversion.to.symbol}`,
      rate: reviewsAvg,
      reviews: reviews,
    });

    reviewsCount = 0;
    reviewsAvg = 0;
    reviewsSum = 0;
  });

  let products = await Product.find({ deleted: false })
    .where("_id")
    .in(favoriteProductsIds)
    .populate({
      path: "sizes",
      populate: {
        path: "price.currency",
        model: "currencies",
      },
    });

  products.forEach((item) => {
    favoriteProducts.push({
      _id: item._id,
      title: item.title,
      urlName: item.urlName,
      image: item.images[0],
      price: !conversion
        ? `${item.sizes[0].price.amount} ${item.sizes[0].price.currency.symbol}`
        : `${item.sizes[0].price.amount * conversion.rate} ${
            conversion.to.symbol
          }`,
    });
  });

  return res.status(200).send({
    favoriteProperties: favoriteProperties,
    favoriteTours: favoriteTours,
    favoriteProducts: favoriteProducts,
    message: messages.en.getSuccess,
  });
}

async function changeEmailRequest(req, res) {
  let user = req.user;
  let { email } = req.body;

  if (!isValidEmail(email))
    return res.status(422).send({ message: "Not an Email" });

  let existingUser = await User.findOne({ email: email });

  if (existingUser)
    return res
      .status(403)
      .send({ requestSuccess: false, message: messages.en.emailExist });

  let code = Math.floor(10000 + Math.random() * 90000);
  let codeExpiredDate = new Date(new Date().getTime() + 5 * 60000);

  user.changeEmail = {
    newEmail: email,
    currentEmail: req.user.email,
    emailVerificationCode: code,
    codeExpiredDate: codeExpiredDate,
    isChanged: false,
  };

  await user.save();

  sendByMailGun(
    email,
    "confirm",
    null,
    "Confirm email for Cheez-Hospitality account",
    `Your Cheez-Hospitality email confirmation code is ${code}`
  );

  return res.status(200).send({ requestSuccess: true, message: "sent code" });
}

async function confirmNewEmail(req, res) {
  let { email, code } = req.body;
  let user = req.user;
  let response = {};

  if (!isValidEmail(email))
    return res.status(422).send({ message: "Not an Email" });

  let existUser = await User.findOne({
    "changeEmail.newEmail": email.toLowerCase(),
  })
    .where("_id")
    .ne(user._id);

  if (existUser)
    return res
      .status(404)
      .send({ confirmed: false, message: messages.en.emailExist });

  existUser = await User.findOne({
    email: email.toLowerCase(),
  })
    .where("_id")
    .ne(user._id);

  if (existUser)
    return res
      .status(404)
      .send({ confirmed: false, message: messages.en.emailExist });

  if (user.changeEmail.codeExpiredDate < new Date())
    return res
      .status(405)
      .send({ confirmed: false, message: messages.en.codeExpired });

  if (user.changeEmail.emailVerificationCode !== code)
    return res
      .status(400)
      .send({ confirmed: false, message: messages.en.codeError });

  user.email = email;
  user.changeEmail.isChanged = true;

  if (user.accountMethod === "emailAuth") user.emailAuth.email = email;

  await user.save();

  response.token = user.generateJWT();
  response.message = messages.en.updateSucces;
  response.email = email;

  return res.status(200).send(response);
}

async function changePhoneNumberRequest(req, res) {
  let { phoneNumber } = req.body;
  let user = req.user;

  let existingUser = await User.findOne({
    phoneNumber: phoneNumber,
    //accountMethod: "phone",
  });

  if (existingUser)
    return res
      .status(403)
      .send({ requestSuccess: false, message: messages.en.exist });

  existingUser = await User.findOne({ otherPhoneNumbers: phoneNumber });

  if (existingUser)
    return res
      .status(403)
      .send({ requestSuccess: false, message: messages.en.exist });

  const otpExpireOn = new Date(new Date().getTime() + 5 * 60000);
  const otp = Math.floor(10000 + Math.random() * 90000);
  let text = `Your Cheez-Hospitality Code is ${otp}`;

  user.changePhoneNumber = {
    newPhoneNumber: phoneNumber,
    currentPhoneNumber: user.phoneNumber,
    PhoneNumberVerificationCode: otp,
    codeExpiredDate: otpExpireOn,
    isChanged: false,
  };

  await user.save();

  let result = await sendByTwilio(phoneNumber, text, otp);
  if (result.result === "err")
    return res.status(405).send({ message: messages.en.FaildSendCode });
  else
    return res.status(200).send({
      requestSuccess: true,
      message: messages.en.watingConfirmation,
    });
}

async function confirmNewPhoneNumber(req, res) {
  let { phoneNumber, code } = req.body;
  let user = req.user;
  let response = {};

  let existUser = await User.findOne({
    "changePhoneNumber.newPhoneNumber": phoneNumber,
  })
    .where("_id")
    .ne(user._id);

  if (existUser)
    return res
      .status(404)
      .send({ confirmed: false, message: messages.en.exist });

  existUser = await User.findOne({
    phoneNumber: phoneNumber,
  })
    .where("_id")
    .ne(user._id);

  if (existUser)
    return res
      .status(404)
      .send({ confirmed: false, message: messages.en.exist });

  if (user.changePhoneNumber.codeExpiredDate < new Date())
    return res
      .status(405)
      .send({ confirmed: false, message: messages.en.codeExpired });

  if (user.changePhoneNumber.PhoneNumberVerificationCode !== code)
    return res
      .status(400)
      .send({ confirmed: false, message: messages.en.codeError });

  user.phoneNumber = phoneNumber;
  user.changePhoneNumber.isChanged = true;

  if (user.accountMethod === "phone") user.phone.phoneNumber = phoneNumber;

  await user.save();

  response.token = user.generateJWT();
  response.message = messages.en.updateSucces;
  response.phoneNumber = phoneNumber;

  return res.status(200).send(response);
}

async function addNumberForUser(req, res) {
  let { phoneNumber } = req.body;
  let user = req.user;
  let response = {};

  let existingUser = await User.findOne({
    phoneNumber: phoneNumber,
  });

  if (existingUser)
    return res
      .status(403)
      .send({ requestSuccess: false, message: messages.en.exist });

  existingUser = await User.findOne({ otherPhoneNumbers: phoneNumber });

  if (existingUser)
    return res
      .status(403)
      .send({ requestSuccess: false, message: messages.en.exist });

  if (!req.user.otherPhoneNumbers.find((ele) => ele === phoneNumber)) {
    req.user.otherPhoneNumbers.push(phoneNumber);
    await req.user.save();

    return res
      .status(200)
      .send({ phoneNumber: phoneNumber, message: messages.en.updateSucces });
  } else {
    return res
      .status(422)
      .send({ requestSuccess: false, message: messages.en.exist });
  }

  const addresses = await Address.find({
    user: mongoose.Types.ObjectId(req.user._id),
    deleted: false,
  })
    .select(
      "_id country city cityWritten regionAndRoad buildingAndFloor isDefault"
    )
    .populate("country", "_id name")
    .populate("city", "_id name")
    .populate("area", "_id name");

  //Get cart products id's

  let cart = await Cart.findOne({ user: req.user._id, cartStatus: "open" });
  if (!cart) {
    cartItems = [];
  } else {
    cartItems = await CartItems.find({ cart: cart._id }).select("product");
  }
  let userResponse = user.toObject();
  userResponse.addresses = addresses;
  userResponse.cartItems = cartItems;

  response.user = userResponse;

  return res.status(200).send(response);
}

async function deletPhoneNumber(req, res) {
  let { phoneNumber } = req.body;

  req.user.otherPhoneNumbers.pull(phoneNumber);

  await req.user.save();

  return res.status(200).send({
    numbers: req.user.otherPhoneNumbers,
    message: messages.en.deleted,
  });
}

async function editPhoneNumbers(req, res) {
  let { oldNumber, newNumber } = req.body;

  let existingUser = await User.findOne({
    phoneNumber: newNumber,
    //accountMethod: "phone",
  });

  if (existingUser)
    return res
      .status(403)
      .send({ requestSuccess: false, message: messages.en.exist });

  existingUser = await User.findOne({ otherPhoneNumbers: newNumber });

  if (existingUser)
    return res
      .status(403)
      .send({ requestSuccess: false, message: messages.en.exist });

  if (req.user.otherPhoneNumbers.find((ele) => ele === newNumber)) {
    return res
      .status(422)
      .send({ requestSuccess: false, message: messages.en.exist });
  } else {
    req.user.otherPhoneNumbers.pull(oldNumber);

    req.user.otherPhoneNumbers.push(newNumber);

    await req.user.save();
  }

  return res.status(200).send({
    numbers: req.user.otherPhoneNumbers,
    message: messages.en.updateSucces,
  });
}

module.exports = {
  getProfile,
  updateInfo,
  getFavorites,
  changeEmailRequest,
  confirmNewEmail,
  changePhoneNumberRequest,
  confirmNewPhoneNumber,
  addNumberForUser,
  editPhoneNumbers,
  deletPhoneNumber,
};
