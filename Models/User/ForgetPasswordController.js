const express = require("express");
const router = express.Router();
const controller = require("./ForgetPasswordView");
const jwt = require("../../Services/jwtAuthorization");

router.post("/requestchange", controller.RequestChangePassword);

router.post("/requestchange/verifycode", controller.verifycode);

router.post("/", jwt.checkUser, controller.ChangePassword);

module.exports = router;

//var express = require('express');
//var router = express.Router();
//var bodyParser = require('body-parser');
//const saltRounds = 10;
//router.use(bodyParser.urlencoded({ extended: true }));
//router.use(bodyParser.json());
//var User = require('./User');
//const nodemailer = require("nodemailer");
//var path = require('path')
//var Handlebars = require('handlebars');
//var fs = require('fs');
//var bcrypt = require('bcrypt');
//
//var salt = bcrypt.genSaltSync(saltRounds);
//
//var passwordTransporter = nodemailer.createTransport({
//    service: 'gmail',
//    secure: false,
//    port: 25,
//    auth: {
//        user: 'replyn85@gmail.com',
//        pass: 'fadeljoe'
//    },
//    tls: {
//        rejectUnauthorized: false
//    }
//});
//
//sendForgotPasswordEmail = async (target, email) => {
//    var source = await fs.readFileSync(path.join(__dirname, '../../Email/template.html'), 'utf8');
//    var template = await Handlebars.compile(source);
//    var options = {
//        from: 'replyn85@gmail.com',
//        to: email,
//        subject: 'Admin password reset',
//        html: template({
//            message: "Your password has been reset",
//            target: target,
//        }) // Process template with locals - {passwordResetAddress}
//    }
//    passwordTransporter.sendMail(options, function (error, response) {
//        if (error) {
//            console.log(error);
//            callback(error);
//        }
//    })
//}
//
////Forget Password
//
//router.post('/', async function (req, res) {
//    var status;
//    var msg = "";
//    console.log(req.body.email)
//    try {
//        var user = await User.findOne({ email: req.body.email });
//        console.log(user)
//        if (!user) {
//            msg = "User does not exist"
//            return res.status(400).send({ msg: msg })
//        }
//        else {
//            link = 'https://admin.cheezhospitality.com/#/pages/reset-password?token=' + user.token
//            user_email = req.body.email
//            sendForgotPasswordEmail(link, user_email).then(() => {
//                msg = "An email has been sent to you"
//                console.log(msg)
//                return res.status(200).send({ msg: msg })
//            })
//
//        }
//    }
//    catch (error) {
//        if (!error.status) {
//            console.log("error finding  user: ", error);
//            status = 500;
//            msg = error;
//        }
//
//        else {
//            status = error.status;
//            msg = error.msg;
//        }
//        return res.status(status).send(msg);
//    }
//
//});
//
//module.exports = router;
