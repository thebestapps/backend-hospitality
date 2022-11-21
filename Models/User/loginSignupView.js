const User = require("./User");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const _ = require("lodash");
const messages = require("../../messages.json");
const {
  sendByTwilio,
  sendByMailGun,
  isValidEmail,
} = require("../../Services/generalServices");
const https = require("https");
const { OAuth2Client } = require("google-auth-library");
const appleSignin = require("apple-signin-auth");
const CONF = require("../../constants");

async function EmailLoginOrSignup(req, res) {
  let { email } = req.body;
  let response = {};
  let code;
  let codeExpiredDate;

  if (!email) return res.status(500).send({ message: messages.en.missingInfo });

  if (!isValidEmail(email))
    return res.status(422).send({ message: "Not an Email" });

  let user = await User.findOne({
    email: email.toLowerCase(),
    //accountMethod: "emailAuth",
  });

  //Signup
  if (!user) {
    code = Math.floor(10000 + Math.random() * 90000);
    codeExpiredDate = new Date(new Date().getTime() + 5 * 60000);

    user = new User({
      email: email.toLowerCase(),
      emailAuth: {
        email: email.toLowerCase(),
        emailVerificationCode: code,
        codeExpired: codeExpiredDate,
      },
      accountMethod: "emailAuth",
      role: "user",
    });
    await user.save();

    sendByMailGun(
      user.email,
      "Confirm email for Cheez-Hospitality account",
      "log in",
      null,
      `Your Cheez-Hospitality email confirmation code is ${code}`
    );

    response.message = messages.en.verifyEmailCode;
    response.newAccoount = true;
    response.otp = code;

    return res.status(200).send(response);
  }

  //Login
  else {
    if (user.isDisactivated)
      return res.status(403).send({ user: null, message: messages.en.blocked });

    if (user.accountMethod !== "emailAuth")
      return res.status(400).send({ message: messages.en.wrongMethod });

    if (!user.isEmailVerified) {
      code = Math.floor(10000 + Math.random() * 90000);
      codeExpiredDate = new Date(new Date().getTime() + 5 * 60000);

      user.emailAuth.emailVerificationCode = code;
      user.emailAuth.codeExpired = codeExpiredDate;
      await user.save();

      sendByMailGun(
        user.email,
        "Confirm email for Cheez-Hospitality account",
        "log in",
        null,
        `Your Cheez Hospitality email confirmation code is ${code}`
      );

      return res.status(400).send({
        message: messages.en.emailNotVerified,
        verified: false,
      });
    }

    response.isInfoCompleted = true;

    if (!user.fullName.first) response.isInfoCompleted = false;
    if (!user.fullName.last) response.isInfoCompleted = false;

    response.newAccoount = false;

    return res.status(200).send(response);
  }
}

async function resendCodeForEmailConfirmation(req, res) {
  let { email } = req.body;

  if (!isValidEmail(email))
    return res.status(422).send({ message: "Not an Email" });

  let user = await User.findOne({
    email: email.toLowerCase(),
    //accountMethod: "emailAuth",
  });

  if (!user)
    return res
      .status(404)
      .send({ user: null, message: messages.en.noUserFound });

  if (user.accountMethod !== "emailAuth")
    return res
      .status(400)
      .send({ user: null, message: messages.en.wrongMethod });

  let code = Math.floor(10000 + Math.random() * 90000);
  let codeExpiredDate = new Date(new Date().getTime() + 5 * 60000);

  user.emailAuth.emailVerificationCode = code;
  user.emailAuth.codeExpired = codeExpiredDate;
  await user.save();

  sendByMailGun(
    user.email,
    "Confirm email for Cheez Hospitality account",
    "log in",
    null,
    `Your Cheez Hospitality email confirmation code is ${code}`
  );

  return res.status(200).send({ message: "sent code", verified: false });
}

async function verifyEmail(req, res) {
  let { email, code } = req.body;
  let response = {};

  if (!isValidEmail(email))
    return res.status(422).send({ message: "Not an Email" });

  let user = await User.findOne({
    email: email.toLowerCase(),
  });

  if (!user) return res.status(404).send({ message: messages.en.noUserFound });

  if (user.emailAuth.codeExpired < new Date())
    return res.status(405).send({ message: messages.en.codeExpired });

  if (user.emailAuth.emailVerificationCode !== code)
    return res.status(400).send({ message: messages.en.codeError });

  user.isEmailVerified = true;
  await user.save();

  response.token = user.generateJWT();
  response.message = messages.en.signUpSuccess;

  return res.status(200).send(response);
}

async function verifyPassword(req, res) {
  let { email, password, fcmToken } = req.body;
  let response = {};

  let user = await User.findOne({ email: email.toLowerCase() });

  if (!user) return res.status(404).send({ message: messages.en.noUserFound });

  if (user.accountMethod !== "emailAuth")
    return res.status(400).send({ message: messages.en.wrongMethod });

  const validPassword = await bcrypt.compare(password, user.emailAuth.password);

  if (!validPassword)
    return res.status(400).send({ message: messages.en.invalidCredentials });

  if (fcmToken) {
    user.fcmToken = fcmToken;
    await user.save();
  }

  response.user = _.pick(user, [
    "_id",
    "fullName",
    "email",
    "emailAuth",
    "role",
  ]);
  response.token = user.generateJWT();
  response.newAccoount = false;

  return res.status(200).send(response);
}

async function RequestOtp(req, res) {
  let { phoneNumber } = req.body;

  let user = await User.findOne({
    phoneNumber: phoneNumber,
    //accountMethod: "phone",
  });

  const otpExpireOn = new Date(new Date().getTime() + 5 * 60000);
  const otp = Math.floor(10000 + Math.random() * 90000);
  let text = `Your Cheez Hospitality Code is ${otp}`;

  //Signup and wait for otp code
  if (!user) {
    req.body.role = "user";
    user = new User({
      role: req.body.role,
      phoneNumber: phoneNumber,
      phone: { phoneNumber: phoneNumber, otp: otp, otpExpire: otpExpireOn },
      accountMethod: "phone",
    });
    await user.save();

    let result = await sendByTwilio(phoneNumber, text, otp);
    if (result.result === "err")
      return res.status(405).send({ message: messages.en.FaildSendCode });
    else
      return res.status(200).send({ message: messages.en.watingConfirmation });
  }
  //send code to Login
  else {
    if (user.isDisactivated)
      return res.status(403).send({ user: null, message: messages.en.blocked });

    if (user.accountMethod !== "phone")
      return res.status(400).send({ message: messages.en.wrongMethod });

    user.phone.otp = otp;
    user.phone.otpExpire = otpExpireOn;
    await user.save();

    let result = await sendByTwilio(phoneNumber, text, otp);
    if (result.result === "err")
      return res.status(405).send({ message: messages.en.FaildSendCode });
    else
      return res.status(200).send({ message: messages.en.watingConfirmation });
  }
}

async function verifyPhone(req, res) {
  let { phoneNumber, otpCode, fcmToken } = req.body;
  let response = {};

  const existingUser = await User.findOne({ phoneNumber: phoneNumber });

  if (existingUser.phone.otpExpire < new Date())
    return res.status(405).send({ message: messages.en.codeExpired });

  if (otpCode !== existingUser.phone.otp)
    return res.status(400).send({ message: messages.en.codeError });

  if (!existingUser.fullName.first)
    return res.status(200).send({
      message: messages.en.signUpSuccess,
      token: existingUser.generateJWT(),
      newAccoount: true,
      isInfoCompleted: false,
    });

  if (fcmToken) {
    existingUser.fcmToken = fcmToken;
    await existingUser.save();
  }

  response.user = _.pick(existingUser, [
    "_id",
    "fullName",
    "email",
    "phone",
    "role",
  ]);
  response.token = existingUser.generateJWT();
  response.message = messages.en.loginSuccess;
  response.newAccoount = false;
  response.isInfoCompleted = true;

  return res.status(200).send(response);
}

/*############## Social auth ##############*/
async function facebookLoginOrSignup(req, res) {
  let { access_token, email, fcmToken } = req.body;
  let responseVal = {};

  const options = {
    hostname: "graph.facebook.com",
    port: 443,
    path: "/me?access_token=" + access_token,
    method: "GET",
  };

  const request = https.get(options, (response) => {
    response.on("data", async function (user) {
      user = JSON.parse(user.toString());
      console.log(user);

      if (user.error) {
        responseVal.message = messages.en.facebookFailed;
        return res.status(400).send(responseVal);
      }

      let checkUser = await User.findOne({ email: email.toLowerCase() });

      // sign up
      if (!checkUser) {
        checkUser = new User({
          fullName: {
            first: user.name.split(" ")[0],
            last: user.name.split(" ")[1],
          },
          email: email.toLowerCase(),
          accountMethod: "facebook",
          "facebook.id": user.id,
          role: "user",
          isEmailVerified: true,
          fcmToken: fcmToken,
        });

        await checkUser.save();

        responseVal.user = _.pick(checkUser, [
          "_id",
          "fullName",
          "email",
          "facebook",
          "role",
        ]);
        responseVal.token = checkUser.generateJWT();
        responseVal.message = messages.en.facebookSignup;

        return res.status(200).send(responseVal);
      }
      // login
      else {
        if (checkUser.isDisactivated)
          return res
            .status(403)
            .send({ user: null, message: messages.en.blocked });

        if (checkUser.accountMethod !== "facebook")
          return res.status(400).send({ message: messages.en.wrongMethod });

        if (fcmToken) {
          checkUser.fcmToken = fcmToken;
          await checkUser.save();
        }

        responseVal.user = _.pick(checkUser, [
          "_id",
          "fullName",
          "email",
          "facebook",
          "role",
        ]);
        responseVal.token = checkUser.generateJWT();
        responseVal.message = messages.en.facebookLogin;

        return res.status(200).send(responseVal);
      }
    });
  });

  request.on("error", (message) => {
    console.error(message);
    responseVal.message = messages.en.facebookFailed;
    return res.status(400).send(responseVal);
  });

  request.end();
}

async function googleLoginOrSignup(req, res) {
  let { idToken, fcmToken } = req.body;
  let responseVal = {};
  const client = new OAuth2Client(CONF.google.CLIENT_ID_WEB);

  async function verifyGoogleToken(token) {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: [
        CONF.google.CLIENT_ID_WEB,
        CONF.google.CLIENT_ID_IOS,
        CONF.google.CLIENT_ID_ANDROID,
      ],
    });
    const payload = ticket.getPayload();
    return payload;
  }

  verifyGoogleToken(idToken)
    .then(async (user) => {
      let checkUser = await User.findOne({
        email: user.email.toLocaleLowerCase(),
      });
      //Signup
      if (!checkUser) {
        checkUser = new User({
          fullName: {
            first: user.name.split(" ")[0],
            last: user.name.split(" ")[1],
          },
          email: user.email.toLowerCase(),
          accountMethod: "google",
          "google.id": user.sub,
          role: "user",
          isEmailVerified: true,
        });

        await checkUser.save();

        responseVal.user = _.pick(checkUser, [
          "_id",
          "fullName",
          "email",
          "google",
          "role",
        ]);
        responseVal.token = checkUser.generateJWT();
        responseVal.message = messages.en.googleSignup;

        return res.status(200).send(responseVal);
      }
      //Login
      else {
        if (checkUser.isDisactivated)
          return res
            .status(403)
            .send({ user: null, message: messages.en.blocked });

        if (checkUser.accountMethod !== "google")
          return res.status(400).send({ message: messages.en.wrongMethod });

        if (fcmToken) {
          checkUser.fcmToken = fcmToken;
          await checkUser.save();
        }

        responseVal.user = _.pick(checkUser, [
          "_id",
          "fullName",
          "email",
          "google",
          "role",
        ]);
        responseVal.token = checkUser.generateJWT();
        responseVal.message = messages.en.googleLogin;

        return res.status(200).send(responseVal);
      }
    })
    .catch((err) => {
      console.log(err);
      responseVal.message = messages.en.googleFailed;
      return res.status(400).send(responseVal);
    });
}

async function appleLoginOrSignup(req, res) {
  let response = {};
  let { idToken, nonce, name, fcmToken } = req.body;
  try {
    const apple = await appleSignin.verifyIdToken(idToken, {
      audience: CONF.apple.CLIENT_ID,
      nonce: nonce
        ? crypto.createHash("sha256").update(nonce).digest("hex")
        : undefined,
      ignoreExpiration: true,
    });

    let user = await User.findOne({ email: apple.email.toLocaleLowerCase() });

    //Signup
    if (!user) {
      user = new User({
        fullName: {
          first: name.split(" ")[0],
          last: name.split(" ")[1],
        },
        email: apple.email.toLowerCase(),
        "apple.id": apple.sub,
        accountMethod: "apple",
        role: "user",
        isEmailVerified: true,
      });
      await user.save();

      response.user = _.pick(user, [
        "_id",
        "fullName",
        "email",
        "apple",
        "role",
      ]);
      response.token = user.generateJWT();
      response.message = messages.en.appleSignup;

      return res.status(200).send(response);
    }

    //Login
    else {
      if (user.isDisactivated)
        return res
          .status(403)
          .send({ user: null, message: messages.en.blocked });

      if (user.accountMethod !== "apple")
        return res.status(400).send({ message: messages.en.wrongMethod });

      if (fcmToken) {
        user.fcmToken = fcmToken;
        await user.save();
      }

      response.user = _.pick(user, [
        "_id",
        "fullName",
        "email",
        "apple",
        "role",
      ]);
      response.token = user.generateJWT();
      response.message = messages.en.appleLogin;

      return res.status(200).send(response);
    }
  } catch (err) {
    console.log(err);
    response.message = messages.en.appleFailed;
    return res.status(400).send(response);
  }
}

module.exports = {
  EmailLoginOrSignup,
  verifyPassword,
  verifyEmail,
  resendCodeForEmailConfirmation,
  RequestOtp,
  verifyPhone,
  facebookLoginOrSignup,
  googleLoginOrSignup,
  appleLoginOrSignup,
};
