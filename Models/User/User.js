const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const generalServices = require("../../Services/generalServices");
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
const bcrypt = require("bcrypt");
const secret = require("../../constants").secret_jwt;

const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
const messages = require("../../messages.json");

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      first: { type: String, default: null },
      last: { type: String, default: null },
    },
    email: { type: String },
    phoneNumber: { type: String, default: null },
    otherPhoneNumbers: [{ type: String }],
    accountMethod: {
      type: String,
      required: true,
      enum: ["phone", "emailAuth", "facebook", "google", "apple"],
      default: "phone",
    },
    phone: {
      phoneNumber: { type: String },
      otp: { type: String },
      otpExpire: Date,
    },
    emailAuth: {
      email: { type: String },
      password: { type: String, minlength: 5, maxlength: 1024 },
      emailVerificationCode: { type: String },
      codeExpired: Date,
    },
    facebook: { id: { type: String, index: true } },
    google: { id: { type: String, index: true } },
    apple: { id: { type: String, index: true } },
    gender: { type: String, enum: ["F", "M", "O"] },
    birthday: { type: String, default: null },
    role: { type: String, enum: ["user"], required: true, default: "user" },
    imageUrl: { type: String, default: "" },
    //token: { type: String, default: "" },
    //codeforJWT: { type: String, default: "" },
    language: { type: String, default: null },
    isEmailVerified: { type: Boolean, default: false },
    profileImg: { type: String, default: null },
    timeZone: { type: Number, default: null },
    city: { type: mongoose.Types.ObjectId, ref: "cities", default: null },
    nationality: { type: Number, default: null }, //refrene to the all countries
    currency: {
      type: mongoose.Types.ObjectId,
      ref: "currencies",
      default: null,
    },
    reciveAdsAndMarketingMessages: {
      type: Boolean,
      required: true,
      default: false,
    },
    changePasswordOtp: {
      otp: { type: String },
      otpExpire: Date,
    },
    favoriteProperties: [{ type: mongoose.Types.ObjectId, ref: "properties" }],
    favoriteTours: [{ type: mongoose.Types.ObjectId, ref: "tours" }],
    favoriteProducts: [{ type: mongoose.Types.ObjectId, ref: "products" }],
    fcmToken: { type: String, default: "" },
    isDisactivated: { type: Boolean, default: false },
    changeEmail: {
      newEmail: { type: String, default: null },
      currentEmail: { type: String, default: null },
      emailVerificationCode: { type: String },
      codeExpiredDate: Date,
      isChanged: { type: Boolean, default: false },
    },
    changePhoneNumber: {
      newPhoneNumber: { type: String, default: null },
      currentPhoneNumber: { type: String, default: null },
      PhoneNumberVerificationCode: { type: String },
      codeExpiredDate: Date,
      isChanged: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

UserSchema.methods.generateJWT = function () {
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);
  return jwt.sign(
    {
      _id: this._id,
      role: this.role,
      city: this.city,
    },
    secret
  );
};

UserSchema.statics.getCurrentUser = async function (id) {
  var user = await User.findOne({ _id: id });
  if (!user) {
    console.log("user doesn't exist");
    // this method shld throw an error.
    return null;
  } else {
    return user;
  }
};

const User = mongoose.model("users", UserSchema, "users");
module.exports = User;
