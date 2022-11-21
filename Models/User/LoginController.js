const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const jwtAuth = require("../../Services/jwtAuthorization");
const bcrypt = require("bcrypt");
const enumerator = require("../Enumerator");
const view = require("./loginSignupView");
const profileView = require("./userProfileView");

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
const User = require("./User");
const messages = require("../../messages.json");

router.post("/email", view.EmailLoginOrSignup);

router.post("/email/checkpassword", view.verifyPassword);

router.post("/email/confirm", view.verifyEmail);

router.post("/email/resendcode", view.resendCodeForEmailConfirmation);

router.post("/email/completeinfo", jwtAuth.checkUser, profileView.updateInfo);

router.post("/phone", view.RequestOtp);

router.post("/phone/completeinfo", jwtAuth.checkUser, profileView.updateInfo);

router.put("/phone/confirm", view.verifyPhone);

router.post("/facebook", view.facebookLoginOrSignup);

router.post("/google", view.googleLoginOrSignup);

router.post("/apple", view.appleLoginOrSignup);

//router.post('/', async function (req, res) {
//    try {
//        var msg = "";
//        var response = {};
//        var query = {};
//        console.log("BODY \n", req.body);
//
//        //missing fields
//        if ((!req.body.phoneNumber && !req.body.email) || !req.body.password) {
//            console.log("TWO");
//            status = 422;
//            msg = messages.en.missingInfo;
//            response.message = msg;
//            return res.status(status).send(response);
//        }
//
//        //signing in with email
//        if (req.body.email) {
//            console.log("Logging in with email");
//            req.body.email = req.body.email.toLowerCase();
//            query = { email: req.body.email };
//        }
//        //signing in with phone
//        else if (req.body.phoneNumber) {
//            console.log("Logging in with phone number");
//            query = { phoneNumber: req.body.phoneNumber };
//        }
//        else {
//            console.log("Attention: Neither email nor phoneNumber were sent in the request.")
//            status = 422;
//            msg = messages.en.invalidCredentials;
//            response.message = msg;
//            return res.status(status).send(response);
//        }
//
//        //getting user
//        var user = await User.findOne(query);
//
//        if (user == undefined || user == null) {
//            console.log("ERROR -- user not found");
//            status = 422;
//            msg = messages.en.invalidCredentials;
//            response.message = msg;
//            return res.status(status).send(response);
//        } else {
//            console.log("Comparing passwords");
//            var password = req.body.password;
//            var result = await bcrypt.compare(password, user.password);
//            if (result != true) {
//                console.log("Password is wrong");
//                status = 422;
//                response.message = messages.en.invalidCredentials;
//                return res.status(status).send(response);
//            } else {
//                console.log("Passwords match, you're in mabrouk");
//                status = 200;
//                return res.status(status).send(user);
//            }
//
//        }
//    } catch (error) {
//        console.log("error", error);
//        status = 500;
//        response.message = messages.en.logInProblem;
//        return res.status(status).send(response);
//    }
//});

module.exports = router;
