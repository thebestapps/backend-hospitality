const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const generalServices = require("../../Services/generalServices");
const secret = require("../../constants").secret_jwt;

const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
const messages = require("../../messages.json");

const AdminSchema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    phoneNumber: String,
    password: String,
    role: { type: Number, enum: [1, 2, 3] }, //1 is Admin can do anything 2 is Editor 3 is Viewer
    imageUrl: String,
    token: String,
    codeforJWT: String,
    language: String,
    isEmailVerified: Boolean,
    profileImg: String,
    timeZone: Number,
    country: String,
    deleted: { type: Boolean, default: false },
    fcmToken: { type: String, default: null },
  },
  { timestamps: true }
);

AdminSchema.methods.setAdmin = function (admin) {
  this.fullName = admin.fullName;
  this.email = admin.email.toLowerCase();
  this.phoneNumber = admin.phoneNumber;
  this.password = bcrypt.hashSync(admin.password, salt);
  this.birthday = admin.birthday;
  this.role = admin.role;
  this.language = admin.language;
  this.imageUrl = admin.imageUrl;
  var randomid = generalServices.makeRandomId();
  console.log("random_id: " + randomid);
  this.codeforJWT = randomid;
  this.isEmailVerified = admin.isEmailVerified;
  // this.token = Admin.generateJWT();
  this.profileImg = admin.profileImg;
  this.timeZone = admin.timeZone;
  this.country = admin.country;
};

AdminSchema.methods.generateJWT = function () {
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);
  return jwt.sign(
    {
      _id: this._id,
      role: this.role,
      codeforJWT: this.codeforJWT,
    },
    secret
  );
};

AdminSchema.statics.getCurrentAdmin = async function (id) {
  var admin = await Admin.findOne({ _id: id });
  if (!admin) {
    console.log("admin doesn't exist");
    // this method shld throw an error.
    return null;
  } else {
    return admin;
  }
};

const Admin = mongoose.model("admins", AdminSchema, "admins");
module.exports = Admin;
