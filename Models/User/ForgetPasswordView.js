const User = require("./User");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const _ = require("lodash");
const messages = require("../../messages.json");
const { sendByMailGun } = require("../../Services/generalServices");

async function RequestChangePassword(req, res) {
  let { email } = req.body;
  //TODO add a real link to send to user
  //let link = "www.SomelinkToChangePassword.com";

  if (!isValidEmail(email))
    return res.status(422).send({ message: "Not an Email" });

  const otpExpireOn = new Date(new Date().getTime() + 5 * 60000);
  const otp = Math.floor(10000 + Math.random() * 90000);

  let user = await User.findOneAndUpdate(
    { email: email.toLowerCase(), accountMethod: "emailAuth" },
    { $set: { changePasswordOtp: { otp: otp, otpExpire: otpExpireOn } } },
    { new: true }
  );

  if (!user)
    return res.status(400).send({
      meesage: "wrong email or account can't sign in with this method",
    });

  sendByMailGun(
    email,
    "Forgot your password",
    "forgot",
    null,
    `here is a code to change your account password ${otp}`
  );

  return res.status(200).send({
    message: `A link to reset your password has been sent to ${email}`,
  });
}

async function verifycode(req, res) {
  let { email, code } = req.body;
  let response = {};

  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser.changePasswordOtp.otpExpire < new Date())
    return res
      .status(405)
      .send({ message: messages.en.codeExpired, codeVerified: false });

  if (code !== existingUser.changePasswordOtp.otp)
    return res
      .status(400)
      .send({ message: messages.en.codeError, codeVerified: false });

  response.message = messages.en.codeVerified;
  response.token = existingUser.generateJWT();
  response.codeVerified = true;

  return res.status(200).send(response);
}

async function ChangePassword(req, res) {
  let { password } = req.body;
  let userId = mongoose.Types.ObjectId(req.user._id);

  let user = await User.findOne({ _id: userId });

  if (!user) return res.status(404).send({ message: messages.en.noUserFound });

  if (user.accountMethod !== "emailAuth")
    return res.status(400).send({ message: messages.en.forbidden });

  const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt);

  user.emailAuth.password = password;
  await user.save();

  return res.status(200).send({ message: messages.en.changePasswordSuccess });
}

module.exports = { RequestChangePassword, verifycode, ChangePassword };
