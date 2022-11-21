const Admin = require("./Admin");
const mongoose = require("mongoose");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const messages = require("../../messages.json");

async function signUpAdmin(req, res) {
  let admin = await Admin.findOne({ role: 1 });

  if (admin)
    return res.status(403).send({
      unAutherized: true,
      message: "only admin can create an account",
    });
  else {
    let newAdmin = new Admin();

    req.body.role = 1;
    newAdmin.setAdmin(req.body);

    newAdmin.token = newAdmin.generateJWT();
    newAdmin.save();

    return res
      .status(200)
      .send({ newAdmin: newAdmin, message: messages.en.adminSuccess });
  }
}

async function createUser(req, res) {
  if (req.user.role !== 1)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let admin = await Admin.findOne({
    email: req.body.email.toLowerCase(),
    deleted: false,
  });

  if (admin)
    return res
      .status(422)
      .send({ isExist: true, message: messages.en.emailExist });

  let newAdmin = new Admin();

  newAdmin.setAdmin(req.body);

  newAdmin.token = newAdmin.generateJWT();
  newAdmin.save();

  return res
    .status(200)
    .send({ newAdmin: newAdmin, message: messages.en.adminSuccess });
}

async function logIn(req, res) {
  let { email, password, fcmToken } = req.body;

  let admin = await Admin.findOne({
    email: email.toLowerCase(),
    deleted: false,
  });

  if (!admin)
    return res
      .status(404)
      .send({ admin: null, message: messages.en.noUserFound });

  const validPassword = await bcrypt.compare(password, admin.password);

  if (!validPassword)
    return res
      .status(400)
      .send({ unAutherized: true, message: messages.en.invalidCredentials });

  if (fcmToken) {
    admin.fcmToken = fcmToken;
    await admin.save();
  }

  return res
    .status(200)
    .send({ admin: admin, message: messages.en.loginSuccess });
}

async function getAdmins(req, res) {
  let admins = await Admin.find({ deleted: false });

  return res
    .status(200)
    .send({ admins: admins, message: messages.en.getSuccess });
}

async function getAdminById(req, res) {
  let adminId = mongoose.Types.ObjectId(req.params.id);

  let admin = await Admin.findOne({ _id: adminId, deleted: false });
  if (!admin)
    return res
      .status(404)
      .send({ admin: null, message: messages.en.noUserFound });

  return res
    .status(200)
    .send({ admin: admin, message: messages.en.getSuccess });
}

async function editAdmin(req, res) {
  let { password } = req.body;
  let adminId = mongoose.Types.ObjectId(req.params.id);

  if (req.user.role !== 1)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let admin = await Admin.findOne({ _id: adminId, deleted: false });

  if (!admin)
    return res
      .status(404)
      .send({ admin: null, message: messages.en.noUserFound });

  if (password) {
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);

    req.body.password = password;
  }

  let updated = await Admin.findOneAndUpdate(
    { _id: adminId, deleted: false },
    { $set: req.body },
    { new: true }
  );

  return res
    .status(200)
    .send({ admin: updated, message: messages.en.updateSucces });
}

async function deleteAdmin(req, res) {
  let adminId = mongoose.Types.ObjectId(req.params.id);

  if (req.user.role !== 1)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let admin = await Admin.findOne({ _id: adminId, deleted: false });

  if (!admin)
    return res
      .status(404)
      .send({ admin: null, message: messages.en.noUserFound });

  let deleted = await Admin.findByIdAndUpdate(
    { _id: adminId, deleted: false },
    { $set: { deleted: true } },
    { new: true }
  );

  return res.status(200).send({ admin: deleted, message: messages.en.deleted });
}

async function getProfile(req, res) {
  let admin = await Admin.findOne({ _id: req.user._id, deleted: false });

  if (!admin)
    return res
      .status(404)
      .send({ admin: null, message: messages.en.noUserFound });

  return res
    .status(200)
    .send({ admin: admin, message: messages.en.getSuccess });
}

module.exports = {
  signUpAdmin,
  createUser,
  logIn,
  getAdmins,
  getAdminById,
  editAdmin,
  deleteAdmin,
  getProfile,
};

//var express = require("express");
//var router = express.Router();
//var bodyParser = require("body-parser");
//const saltRounds = 10;
//router.use(bodyParser.urlencoded({ extended: true }));
//router.use(bodyParser.json());
//var Admin = require("./Admin");
//
//const nodemailer = require("nodemailer");
//var path = require("path");
//var Handlebars = require("handlebars");
//var fs = require("fs");
//var bcrypt = require("bcrypt");
//
//var salt = bcrypt.genSaltSync(saltRounds);
//
//var transporterForAdmin = nodemailer.createTransport({
//  service: "gmail",
//  secure: false,
//  port: 25,
//  auth: {
//    user: "replyn85@gmail.com",
//    pass: "fadeljoe",
//  },
//  tls: {
//    rejectUnauthorized: false,
//  },
//});
//
//sendAdminMail = async (target, email) => {
//  var source = await fs.readFileSync(
//    path.join(__dirname, "../../Email/template.html"),
//    "utf8"
//  );
//  var template = await Handlebars.compile(source);
//  var optionsForAdmin = {
//    from: "replyn85@gmail.com",
//    to: email,
//    subject: "Admin account verification",
//    html: template({
//      message: "You've been signed up as administrator in Cheez Admin Panel",
//      target: target,
//    }), // Process template with locals - {passwordResetAddress}
//  };
//  transporterForAdmin.sendMail(optionsForAdmin, function (error, response) {
//    if (error) {
//      console.log(error);
//      return error;
//    }
//  });
//};
///* CREATES A NEW ADMIN*/
//router.post("/", async function (req, res) {
//  var status;
//  var msg;
//  try {
//    console.log("\n\n----- add admin request -----\n", req.body);
//    req.body.role = 1;
//    var newAdmin = new Admin();
//    newAdmin.setAdmin(req.body);
//
//    console.log("newUser", newAdmin);
//    var exists = await Admin.findOne({ phoneNumber: req.body.phoneNumber });
//    if (!exists) {
//      await newAdmin.save();
//      newAdmin.token = newAdmin.generateJWT();
//      await newAdmin.save();
//      msg = newAdmin;
//      link =
//        "https://admin.cheezhospitality.com/#/pages/reset-password?token=" +
//        newAdmin.token;
//      email = newAdmin.email;
//      var email = await sendAdminMail(link, email);
//      status = 200;
//    } else {
//      msg = "User with this phone number exists";
//      status = 401;
//    }
//    return res.status(status).send(msg);
//
//    // var result = await createAuthorization(userAndPhone, newUser, req);
//  } catch (error) {
//    if (!error.status) {
//      console.log("error in creating new user: ", error);
//      status = 500;
//      msg = error;
//    } else {
//      status = error.status;
//      msg = error.msg;
//    }
//    return res.status(status).send(msg);
//  }
//});
//
////GET ADMIN BY ID
//router.get("/:id", async function (req, res) {
//  console.log("GET ADMIN BY ID");
//  if (req.params.id !== "new") {
//    var admin = await Admin.findOne({ _id: req.params.id });
//    if (admin == undefined || admin == null) {
//      return res.status(200).send({ message: "no admin found" });
//    } else {
//      return res.status(200).send(admin);
//    }
//  } else return res.status(200).send({ message: "no admin found" });
//});
//
////GET ADMIN BY TOKEN
//router.get("/token/:token", async function (req, res) {
//  console.log("GET ADMIN BY TOKEN");
//  var admin = await Admin.findOne({ token: req.params.token });
//  if (admin == undefined || admin == null) {
//    console.log("ERROR -- admin not found");
//    status = 422;
//    response.message = msg;
//    return res.status(status).send(response);
//  } else {
//    return res.status(200).send(admin);
//  }
//});
//
////GET ADMINS
//router.get("/", async function (req, res) {
//  console.log("GET ADMINS");
//  var admins = await Admin.find({});
//  return res.status(200).send(admins);
//});
//
////UPDATE ADMIN
//
//router.post("/:id", async function (req, res) {
//  var status;
//  var msg;
//  var admin = await Admin.findOne({ _id: req.params.id });
//
//  if (admin == undefined || admin == null) {
//    console.log("ERROR -- admin not found");
//    status = 422;
//    response.message = msg;
//    return res.status(status).send(response);
//  } else {
//    var updated = await Admin.findOneAndUpdate(
//      { _id: req.params.id },
//      req.body
//    );
//    return res.status(200).send(updated);
//  }
//});
//
////UPDATE ADMIN PASSWORD
//
//router.put("/:id", async function (req, res) {
//  var status;
//  var msg;
//  var admin = await Admin.findOne({ _id: req.params.id });
//
//  if (admin == undefined || admin == null) {
//    console.log("ERROR -- admin not found");
//    status = 422;
//    response.message = msg;
//    return res.status(status).send(response);
//  } else {
//    var updated = await Admin.findOneAndUpdate(
//      { _id: req.params.id },
//      { password: bcrypt.hashSync(req.body.password, salt) }
//    );
//    return res.status(200).send(updated);
//  }
//});
//
//router.delete("/:id", async function (req, res) {
//  var admin = await Admin.findOne({ _id: req.params.id });
//  if (admin == undefined || admin == null) {
//    console.log("ERROR -- admin not found");
//    status = 422;
//    response.message = msg;
//    return res.status(status).send(response);
//  } else {
//    var updated = await Admin.deleteOne({ _id: req.params.id });
//    return res.status(200).send(updated);
//  }
//});
//
//module.exports = router;
