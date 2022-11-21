var express = require("express");
var router = express.Router();
var MailComposer = require("nodemailer/lib/mail-composer");

const CONF = require("../constants");

var bodyParser = require("body-parser");

var nodemailer = require("nodemailer");
/*  var location = req.body.location;
    var nbrBedrooms = req.body.nbrBedrooms;
    var phone = req.body.phone;
    var email = req.body.email;
    var name = req.body.name; */
const twilio = require("twilio")(CONF.twilio.accountSID, CONF.twilio.authTOKEN);
const mailgun = require("mailgun-js")({
  apiKey: CONF.mailGun.API_KEY,
  domain: CONF.mailGun.DOMAIN,
});
const FCM = require("fcm-node");
const fcm = new FCM(CONF.firebase_messaging_serverKey);

sendEmailToUser = function (emailText, res, thisSubject) {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    secure: false,
    port: 25,
    auth: {
      user: "replyn85@gmail.com",
      pass: "fadeljoe",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  var mailOptions = {
    from: "Cheez Inquiries <replyn85@gmail.com>",
    to: "info@cheezhospitality.com",
    // to: "vanessa.boghos@cheezhospitality.com",
    subject: thisSubject,
    html: emailText,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log("error in sending email:", error);
      res.status(500).send(error.message);
    } else {
      console.log("Email sent: " + info.response);
      res.status(200).send({ message: "Successfully sent email!" });
    }
  });
};

sendEmailToIskandarUser = function (emailText, res, thisSubject) {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    secure: false,
    port: 25,
    auth: {
      user: "replyn85@gmail.com",
      pass: "fadeljoe",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  var mailOptions = {
    from: "Cheez Inquiries <replyn85@gmail.com>",
    to: "iskandar@cheezhospitality.com",
    // to: "vanessa.boghos@cheezhospitality.com",
    subject: thisSubject,
    html: emailText,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log("error in sending email:", error);
      res.status(500).send(error.message);
    } else {
      console.log("Email sent: " + info.response);
      res.status(200).send({ message: "Successfully sent email!" });
    }
  });
};

// Visit: fullName, email, phoneNumber, message, formTitle: visit
// Valuation: fullName, email, phoneNumber, message, images = [], formTitle: valuation
// Service: fullName, email, phoneNumber, message, address, formTitle: service, service : 1 2 3 (tuning, maintenance, restoration)
sendPianoEmailToUser = function (emailText, res, containsImage) {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    secure: false,
    port: 25,
    auth: {
      user: "pianosinquiries@gmail.com",
      pass: "fadeljoe",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  var mailOptions = {
    from: "Piano Inquiries <pianosinquiries@gmail.com>",
    to: "info@pianoskalaydjian.com",
    // to: "vanessaboghos@hotmail.com",
    subject: "New Inquiry",
    html: emailText,
  };
  if (containsImage && containsImage != null) {
    var attach = [];
    for (var i = 0; i < containsImage.length; i++) {
      var object = {
        filename: "image" + i + ".png",
        path: containsImage[i],
        cid: "attachedImage" + i,
      };
      attach.push(object);
    }
    mailOptions.attachments = attach;
  }

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log("error in sending email:", error);
      res.status(500).send(error.message);
    } else {
      console.log("Email sent: " + info.response);
      res.status(200).send({ message: "Successfully sent email!" });
    }
  });
};

shuffleArray = function (a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
};

/*
this method make a random combination of numbers and Letters in order to make a code
the result of this function will be saved on sign up and change password to make a jwtToken uniq for the user.
*/
makeRandomId = function makeRandomId(request, response, next) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 33; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
};

sendByTwilio = function (to, body, code) {
  return twilio.messages
    .create({ body: body, from: "Cheez", to })
    .then((data) => {
      return { result: "success" };
    })
    .catch((err) => {
      console.log(err);
      return { result: "err" };
    });
};

//TODO remove my email
sendByMailGun = function (
  to = "info@cheezhospitality.com",
  subject = "test",
  text = "tset mailgun",
  attachment = null,
  message = "<b> Test email text </b>"
) {
  var mailOptions = {
    from: "Cheez-Hospitality <info@cheezhospitality.com>",
    to: to,
    subject: subject,
    text: text,
    html: message,
  };

  if (!attachment) {
    var mail = new MailComposer(mailOptions);

    mail.compile().build((err, message) => {
      var dataToSend = {
        to: to,
        message: message.toString("ascii"),
      };

      mailgun.messages().sendMime(dataToSend, (sendError, body) => {
        if (sendError) {
          console.log(sendError);
          return;
        }
      });
    });
    //Attachments for job application
  } else {
    let data = {
      from: "Cheez-Hospitality <info@cheezhospitality.com>",
      to: to,
      subject: subject,
      text: text,
      attachment: attachment,
    };

    mailgun.messages().send(data, function (error, body) {
      console.log(body);
      console.log(error);
    });
  }
};

getDatesBetweenDates = function (startDate, endDate) {
  let dates = [];
  //to avoid modifying the original date
  const theDate = new Date(startDate);
  while (theDate < new Date(endDate)) {
    dates = [...dates, new Date(theDate)];
    theDate.setDate(theDate.getDate() + 1);
  }
  dates = [...dates, new Date(endDate)];
  return dates;
};

sendNotification = function (
  to,
  notificationTitle,
  notificationBody,
  listingType,
  id
) {
  let message = {
    registration_ids: to,
    collapse_key: "Cheez-test-message",
    notification: { title: notificationTitle, body: notificationBody },
    data: { my_key: listingType, my_another_key: id },
  };

  fcm.send(message, function (err, response) {
    if (err) {
      console.log("Something has gone wrong!");
      console.log(err);
    } else {
      console.log("Successfully sent with response: ", response);
    }
  });
};

isValidEmail = function (email) {
  var re = /\S+@\S+\.\S+/;
  return re.test(email);
};

formatDate = function (date) {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};

exports.shuffleArray = shuffleArray;
exports.sendEmailToUser = sendEmailToUser;
exports.sendPianoEmailToUser = sendPianoEmailToUser;
exports.sendEmailToIskandarUser = sendEmailToIskandarUser;
exports.makeRandomId = makeRandomId;
exports.sendByTwilio = sendByTwilio;
exports.sendByMailGun = sendByMailGun;
exports.getDatesBetweenDates = getDatesBetweenDates;
exports.sendNotification = sendNotification;
exports.isValidEmail = isValidEmail;
exports.formatDate = formatDate;
