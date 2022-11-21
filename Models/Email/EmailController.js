const express = require("express");
const router = express.Router();
const EmailView = require("./EmailView");
const jwtAuth = require("../../Services/jwtAuthorization");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./files");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname.replace(/ /g, "_"));
  },
});

const upload = multer({ dest: "files/", storage: storage });

router.post("/", EmailView.sendEmail);

router.get("/", jwtAuth.checkAuth, EmailView.getEmails);

router.get("/:id", jwtAuth.checkAuth, EmailView.getEmailById);

router.delete("/:id", jwtAuth.checkAuth, EmailView.deleteEmail);

router.post("/job-apply", upload.single("file"), EmailView.sendJobApplication);

module.exports = router;

//var express = require('express');
//var router = express.Router();
//
//var admin = require("firebase-admin");
//
//const fs = require('fs');
//var generalServices = require("../../Services/generalServices");
//
///**
// * @api {PUT} /v1/email Add email to mailing list
// * @apiName Email
// *
//**/
//
//router.put('/', async function (req, res) {
//    var email = req.body.email;
//    var now = Date.now();
//    fs.appendFile('message.txt', email + "\t"+now+"\n", function (err) {
//        if (err) throw err;
//        else {
//            res.status(200).send({ "message": "Email added to mail list" });
//        }
//    });
//});
//
//
///**
// * @api {POST} /v1/email/inquiry Gets Properties
// * @apiName Send Inquiry
// *
// * location = req.body.location;
// * nbrBedrooms = req.body.nbrBedrooms;
// * phone = req.body.phone;
// * email = req.body.email;
// * name = req.body.name;
// *
//**/
//router.post('/inquiry/', function (req, res) {
//    var subject = "New Inquiry";
//    var body = req.body;
//    var fullName = body.firstName +" "+body.lastName;
//    var amenities = "";
//    if(body.amenities && body.amenities !=[]){
//        body.amenities.forEach(amenity=>{
//            amenities = amenity+"; "+amenities;
//        })
//    }
//    var emailText ="<!DOCTYPE html><html> <body> <table class='email-wrapper' width='100%' cellpadding='0' cellspacing='0' role='presentation'> <tr> <td align='center'> <table class='email-content' width='100%' cellpadding='0' cellspacing='0' role='presentation'> <tr> <td class='email-masthead'> </td> </tr> <!-- Email Body --> <tr> <td class='email-body' width='100%' cellpadding='0' cellspacing='0'> <table class='email-body_inner' align='center' width='570' cellpadding='0' cellspacing='0' role='presentation'> <!-- Body content --> <tr> <td class='content-cell'> <div class='f-fallback'> <h1>New Inquiry For Property Quotation</h1> <table class='body-action' align='center' width='100%' cellpadding='0' cellspacing='0' role='presentation'> <tr> <td align='center'> <!-- Border based button https://litmus.com/blog/a-guide-to-bulletproof-buttons-in-email-design --> <table width='100%' border='0' cellspacing='0' cellpadding='0' role='presentation'> <tr> </tr> </table> </td> </tr> </table> <p>A potential client wants a quotation for his property.</p> <table class='attributes' width='100%' cellpadding='0' cellspacing='0' role='presentation'> <tr> <td class='attributes_content'> <table width='100%' cellpadding='0' cellspacing='0' role='presentation'> <tr> <td class='attributes_item'> <span class='f-fallback'> <strong>Name:</strong> " + fullName + " </span> </td> </tr> <tr> <td class='attributes_item'> <span class='f-fallback'> <strong>Email:</strong> " + body.email + " </span> </td> </tr> <tr> <td class='attributes_item'> <span class='f-fallback'> <strong>Phone:</strong> " + body.phoneNumber + " </span> </td> </tr> <tr><td><br/></td></tr><tr> <td class='attributes_item'> <span class='f-fallback'> <strong><u>Location:</u></strong> </span> </td> </tr><table><tr><td>Building: " + body.building + " </span></td></tr><tr><td>Street: " + body.street + " </span></td></tr><tr><td>City: " + body.city + " </span></td></tr><tr><td>State: " + body.state + " </span></td></tr><tr><td>Country: " + body.country + " </span></td></tr></table> <tr><td><br/></td></tr><tr> <td class='attributes_item'> <span class='f-fallback'> <strong><u>About the Property:</u></strong> </span> </td> </tr><table> <tr> <td class='attributes_item'> <span class='f-fallback'> Property Type: " + body.propertyType + " </span> </td> </tr><tr> <td class='attributes_item'> <span class='f-fallback'> Number of Guests: " + body.numberOfGuests + " </span> </td> </tr> <tr> <td class='attributes_item'> <span class='f-fallback'> Number of Bedrooms: " + body.numberOfBedrooms + " </span> </td> </tr> <tr> <td class='attributes_item'> <span class='f-fallback'> Number of Sofabeds: " + body.sofabedNumber + " </span> </td> </tr> <tr> <td class='attributes_item'> <span class='f-fallback'> Number of Couches: " + body.couchNumber + " </span> </td> </tr> <tr> <td class='attributes_item'> <span class='f-fallback'> Number of Sofabeds: " + body.sofabedNumber + " </span> </td> </tr><tr> <td class='attributes_item'> <span class='f-fallback'>Amenities: " + amenities + " </span> </td> </tr>  </table> </td> </tr> <tr><td><br/></td></tr><tr><td><strong>Description: </strong>" + body.description + "</td></tr></table></table> </body></html>";
//    console.log("Sending email...")
//    generalServices.sendEmailToUser(emailText, res,subject);
//
//});
//
//
//
///* @api {POST} /v1/email/book
//
//STAY:
//fullName: string,
//phoneNumber: string,
//email: string,
//stay:string,
//checkInDate: string,
//checkOutDate: string,
//numberOfGuests: number,
//housekeepingService: boolean,
//breakfast: boolean,
//airportPickup: boolean,
//airportDropoff: boolean,
//packedFridge: boolean,
//extraPillows: boolean,
//spotifyNetflix: boolean
//
//TOUR:
//fullName: string,
//phoneNumber: string,
//email: string,
//tour:string,
//date:string,
//numberOfguests:number,
//breakfast:boolean,
//vehicle: string
// */
//
//router.post('/book/', function (req, res) {
//    /*for stays*/
//    var subject = "";
//    console.log("req.body.selectedCities",req.body.selectedCities);
//    if(req.body.selectedCities!=undefined){
//        console.log("----IN HERE");
//        var cities = "";
//        subject = "New Customized Trip Booking";
//        if(req.body.selectedCities.length>0){
//            req.body.selectedCities.forEach(city=>{
//                cities = cities + city+ "; ";
//            })
//        }
//        var fullName = req.body.firstName +" "+req.body.lastName;
//        var budget = req.body.setBudget?req.body.budget:"No budget";
//        var emailText = "<!DOCTYPE html><html><body><table class='email-wrapper' width='100%' cellpadding='0' cellspacing='0' role='presentation'><tr><td align='center'><table class='email-content' width='100%' cellpadding='0' cellspacing='0' role='presentation'><tr><td class='email-masthead'> </td></tr><!-- Email Body --><tr><td class='email-body' width='100%' cellpadding='0' cellspacing='0'><table class='email-body_inner' align='center' width='570' cellpadding='0' cellspacing='0' role='presentation'><!-- Body content --><tr> <td class='content-cell'> <div class='f-fallback'> <h1>New Customized Tour Booking</h1> <table class='body-action' align='center' width='100%' cellpadding='0' cellspacing='0' role='presentation'> <tr> <td align='center'> <table width='100%' border='0' cellspacing='0' cellpadding='0' role='presentation'> <tr> </tr> </table> </td> </tr> </table> <p>Hey Team! A new customized tour booking has been made.</p> <table class='attributes' width='100%' cellpadding='0' cellspacing='0' role='presentation'> <tr> <td class='attributes_content'> <table width='100%' cellpadding='0' cellspacing='0' role='presentation'> <tr> <td class='attributes_item'> <span class='f-fallback'> <strong>Full Name:</strong> " + fullName + " </span> </td> </tr> <tr> <td class='attributes_item'> <span class='f-fallback'> <strong>Phone Number:</strong> " + req.body.phoneNumber + " </span> </td> </tr> <tr> <td class='attributes_item'> <span class='f-fallback'> <strong>Email:</strong> " + req.body.email + "</span> </td> </tr><tr> <td class='attributes_item'>_______________________________________ </td></tr><tr><td class='attributes_item'><br/></td></tr> <tr> <td class='attributes_item'> <span class='f-fallback'> <strong>Selected Cities:</strong> " + cities + " </span> </td> </tr> <tr> <td class='attributes_item'> <span class='f-fallback'> <strong>Budget: </strong> " + budget + " </span> </td> </tr><tr> <td class='attributes_item'> <span class='f-fallback'> <strong>Adults Number:</strong> " + req.body.adultsNumber + " </span> </td> </tr><tr> <td class='attributes_item'> <span class='f-fallback'> <strong>Infants Number:</strong> " + req.body.infantsNumber + " </span> </td> </tr><tr> <td class='attributes_item'> <span class='f-fallback'> <strong>Description: </strong> " + req.body.description + " </span> </td> </tr><tr> <td class='attributes_item'> <span class='f-fallback'> <strong>Begin Date:</strong> " + req.body.beginDate + " </span> </td> </tr> <tr> <td class='attributes_item'> <span class='f-fallback'> <strong>End Date: </strong> " + req.body.endDate + " </span> </td> </tr> <tr> <td class='attributes_item'> <span class='f-fallback'> <strong>Vehicle: </strong> " + req.body.vehicle + " </span> </td> </tr> <tr></tr></table> </td> </tr> </table> <table class='attributes' width='100%' cellpadding='0' cellspacing='0' role='presentation'> </div> </td></tr></table></td></tr><tr> </tr></table></td></tr></table></body></html>";
//    }
//    else if (req.body.stay != undefined && req.body.stay != null) {
//        subject = "New Stay Booking";
//        var emailText = "<!DOCTYPE html><html><body><table class='email-wrapper' width='100%' cellpadding='0' cellspacing='0' role='presentation'><tr><td align='center'><table class='email-content' width='100%' cellpadding='0' cellspacing='0' role='presentation'><tr><td class='email-masthead'> </td></tr><!-- Email Body --><tr><td class='email-body' width='100%' cellpadding='0' cellspacing='0'><table class='email-body_inner' align='center' width='570' cellpadding='0' cellspacing='0' role='presentation'><!-- Body content --><tr> <td class='content-cell'> <div class='f-fallback'> <h1>New Stay Booking</h1> <table class='body-action' align='center' width='100%' cellpadding='0' cellspacing='0' role='presentation'> <tr> <td align='center'> <!-- Border based button https://litmus.com/blog/a-guide-to-bulletproof-buttons-in-email-design --> <table width='100%' border='0' cellspacing='0' cellpadding='0' role='presentation'> <tr> </tr> </table> </td> </tr> </table> <p>Hey Team! A new stay booking has been made.</p> <table class='attributes' width='100%' cellpadding='0' cellspacing='0' role='presentation'> <tr> <td class='attributes_content'> <table width='100%' cellpadding='0' cellspacing='0' role='presentation'> <tr> <td class='attributes_item'> <span class='f-fallback'> <strong>Full Name:</strong> " + req.body.fullName + " </span> </td> </tr> <tr> <td class='attributes_item'> <span class='f-fallback'> <strong>Phone Number:</strong> " + req.body.phoneNumber + " </span> </td> </tr> <tr> <td class='attributes_item'> <span class='f-fallback'> <strong>Email:</strong> " + req.body.email + "</span> </td> </tr> <tr> <td class='attributes_item'> <span class='f-fallback'> <strong>Stay:</strong> " + req.body.stay + " </span> </td> </tr> <tr> <td class='attributes_item'> <span class='f-fallback'> <strong>Check In Date:</strong> " + req.body.checkInDate + " </span> </td> </tr> <tr> <td class='attributes_item'> <span class='f-fallback'> <strong>Check Out Date:</strong> " + req.body.checkOutDate + " </span> </td> </tr> <tr> <td class='attributes_item'> <span class='f-fallback'> <strong>Number of Guests:</strong> " + req.body.numberOfGuests + " </span> </td> </tr> <tr></tr>";
//        var additional = "";
//        if (req.body.housekeepingService == true) {
//            additional += "• Housekeeping Service<br/>";
//        }
//        if (req.body.breakfast == true) {
//            additional += "• Breakfast<br/>";
//        }
//        if (req.body.airportPickup == true) {
//            additional += "• Airport Pickup<br/>";
//        }
//        if (req.body.airportDropoff == true) {
//            additional += "• Airport Dropoff<br/>";
//        }
//        if (req.body.packedFridge == true) {
//            additional += "• Packed Fridge<br/>";
//        }
//        if (req.body.extraPillows == true) {
//            additional += "• Extra Pillows<br/>";
//        }
//        if (req.body.spotifyNetflix == true) {
//            additional += "• Spotify & Netflix<br/>";
//        }
//        if (req.body.laundryServices == true) {
//            additional += "• Laundry Services<br/>";
//        }
//        if (req.body.tours == true) {
//            additional += "• Tours<br/>";
//        }
//        if (additional != "") {
//            emailText += " <tr> <td class='attributes_item'> <span class='f-fallback'> <strong><br/>Including: </strong></span> </td> </tr> <tr> <td class='attributes_item'> <span class='f-fallback'></span>" + additional + "</td> </tr>";
//        }
//        emailText += " </table> </td> </tr> </table> <table class='attributes' width='100%' cellpadding='0' cellspacing='0' role='presentation'> </div> </td></tr></table></td></tr><tr> </tr></table></td></tr></table></body></html>";
//    }
//    /*for tours*/
//    else {
//        subject = "New Tour Booking";
//        var emailText = "<!DOCTYPE html><html><body><table class='email-wrapper' width='100%' cellpadding='0' cellspacing='0' role='presentation'><tr><td align='center'><table class='email-content' width='100%' cellpadding='0' cellspacing='0' role='presentation'><tr><td class='email-masthead'> </td></tr><!-- Email Body --><tr><td class='email-body' width='100%' cellpadding='0' cellspacing='0'><table class='email-body_inner' align='center' width='570' cellpadding='0' cellspacing='0' role='presentation'><!-- Body content --><tr> <td class='content-cell'> <div class='f-fallback'> <h1>New Tour Booking</h1> <table class='body-action' align='center' width='100%' cellpadding='0' cellspacing='0' role='presentation'> <tr> <td align='center'> <!-- Border based button https://litmus.com/blog/a-guide-to-bulletproof-buttons-in-email-design --> <table width='100%' border='0' cellspacing='0' cellpadding='0' role='presentation'> <tr> </tr> </table> </td> </tr> </table> <p>Hey Team! A tour booking has been made.</p> <table class='attributes' width='100%' cellpadding='0' cellspacing='0' role='presentation'> <tr> <td class='attributes_content'> <table width='100%' cellpadding='0' cellspacing='0' role='presentation'> <tr> <td class='attributes_item'> <span class='f-fallback'> <strong>Full Name:</strong> " + req.body.fullName + " </span> </td> </tr> <tr> <td class='attributes_item'> <span class='f-fallback'> <strong>Phone Number:</strong> " + req.body.phoneNumber + " </span> </td> </tr> <tr> <td class='attributes_item'> <span class='f-fallback'> <strong>Email:</strong> " + req.body.email + "</span> </td> </tr> <tr> <td class='attributes_item'> <span class='f-fallback'> <strong>Tour:</strong> " + req.body.tour + " </span> </td> </tr> <tr> <td class='attributes_item'> <span class='f-fallback'> <strong>Date:</strong> " + req.body.date + " </span> </td> </tr><tr> <td class='attributes_item'> <span class='f-fallback'> <strong>Number of Guests:</strong> " + req.body.numberOfGuests + " </span> </td> </tr><tr> <td class='attributes_item'> <span class='f-fallback'> <strong>Vehicle:</strong> " + req.body.vehicle + " </span> </td> </tr> <tr></tr>";
//        var additional = "";
//        if (req.body.breakfast == true) {
//            additional += "• Breakfast<br/>";
//        }
//        if (additional != "") {
//            emailText += " <tr> <td class='attributes_item'> <span class='f-fallback'> <strong><br/>Including: </strong></span> </td> </tr> <tr> <td class='attributes_item'> <span class='f-fallback'></span>" + additional + "</td> </tr>";
//        }
//        emailText += " </table> </td> </tr> </table> <table class='attributes' width='100%' cellpadding='0' cellspacing='0' role='presentation'> </div> </td></tr></table></td></tr><tr> </tr></table></td></tr></table></body></html>";
//    }
//    console.log("about to mail");
//    generalServices.sendEmailToUser(emailText, res, subject);
//});
//
//
//
//
///* @api {POST} /v1/email/piano
///* Visit: fullName, email, phoneNumber, message, formTitle: visit
// Valuation: fullName, email, phoneNumber, message, images = [], formTitle: valuation
// Service: fullName, email, phoneNumber, message, address, formTitle: service, service : 1 2 3 (tuning, maintenance, restoration)
//*/
//router.post('/piano/', function (req, res) {
//    var body = req.body;
//    var formTitle = body.formTitle.toLowerCase();
//    var emailText = "";
//    console.log("HEY!");
//    switch (formTitle) {
//        case "visit":
//            emailText = "<!DOCTYPE html><html> <body> <table class='email-wrapper' width='100%' cellpadding='0' cellspacing='0' role='presentation'> <tr> <td align='center'> <table class='email-content' width='100%' cellpadding='0' cellspacing='0' role='presentation'> <tr> <td class='email-masthead'> </td> </tr> <!-- Email Body --> <tr> <td class='email-body' width='100%' cellpadding='0' cellspacing='0'> <table class='email-body_inner' align='center' width='570' cellpadding='0' cellspacing='0' role='presentation'> <!-- Body content --> <tr> <td class='content-cell'> <div class='f-fallback'> <h1>A " + formTitle + " has been booked. </h1> <table class='body-action' align='center' width='100%' cellpadding='0' cellspacing='0' role='presentation'> <tr> <td align='center'> <table width='100%' border='0' cellspacing='0' cellpadding='0' role='presentation'> <tr> </tr> </table> </td> </tr> </table> <p>Someone has made a request for a " + formTitle + ".</p> <table class='attributes' width='100%' cellpadding='0' cellspacing='0' role='presentation'> <tr> <td class='attributes_content'> <table width='100%' cellpadding='0' cellspacing='0' role='presentation'> <tr> <td class='attributes_item'> <span class='f-fallback'> <strong>Name:</strong> " + body.fullName + " </span> </td> </tr> <tr> <td class='attributes_item'> <span class='f-fallback'> <strong>Email: </strong> " + body.email + " </span> </td> </tr> <tr> <td class='attributes_item'> <span class='f-fallback'> <strong>Phone Number:</strong> " + body.phoneNumber + "</span> </td> </tr></table> </td> </tr> </table> <p> <strong>Message:</strong></br> " + body.message + "</p> <table class='attributes' width='100%' cellpadding='0' cellspacing='0' role='presentation'> </div> </td> </tr> </table> </td> </tr> <tr> </tr> </table> </td> </tr> </table> </body></html>";
//            break;
//        case "valuation":
//            if (body.images) {
//                emailText = "<!DOCTYPE html><html> <body> <table class='email-wrapper' width='100%' cellpadding='0' cellspacing='0' role='presentation'> <tr> <td align='center'> <table class='email-content' width='100%' cellpadding='0' cellspacing='0' role='presentation'> <tr> <td class='email-masthead'> </td> </tr> <!-- Email Body --> <tr> <td class='email-body' width='100%' cellpadding='0' cellspacing='0'> <table class='email-body_inner' align='center' width='570' cellpadding='0' cellspacing='0' role='presentation'> <!-- Body content --> <tr> <td class='content-cell'> <div class='f-fallback'> <h1>A " + formTitle + " has been booked. </h1> <table class='body-action' align='center' width='100%' cellpadding='0' cellspacing='0' role='presentation'> <tr> <td align='center'> <table width='100%' border='0' cellspacing='0' cellpadding='0' role='presentation'> <tr> </tr> </table> </td> </tr> </table> <p>Someone has made a request for a " + formTitle + ".</p> <table class='attributes' width='100%' cellpadding='0' cellspacing='0' role='presentation'> <tr> <td class='attributes_content'> <table width='100%' cellpadding='0' cellspacing='0' role='presentation'> <tr> <td class='attributes_item'> <span class='f-fallback'> <strong>Name:</strong> " + body.fullName + " </span> </td> </tr> <tr> <td class='attributes_item'> <span class='f-fallback'> <strong>Email: </strong> " + body.email + " </span> </td> </tr> <tr> <td class='attributes_item'> <span class='f-fallback'> <strong>Phone Number:</strong> " + body.phoneNumber + "</span> </td> </tr> </table> </td> </tr> </table> <p> <strong>Message:</strong></br> " + body.message + "</p> <table class='attributes' width='100%' cellpadding='0' cellspacing='0' role='presentation'> </div> </td> </tr> </table> </td> </tr> <tr> </tr> </table> </td> </tr> <tr> <td class='attributes_item'> <span class='f-fallback'> <strong>Images:</strong>";
//                if (body.images.length > 1) {
//                    for (var i = 0; i < body.images.length; i++) {
//                        var cid = "attachedImage" + i;
//                        emailText += "<img src='cid:" + cid + "'/>";
//                    }
//
//
//                }
//                emailText += " </span> </td> </tr> </table> </body></html>";
//            }
//            else {
//                emailText = "<!DOCTYPE html><html> <body> <table class='email-wrapper' width='100%' cellpadding='0' cellspacing='0' role='presentation'> <tr> <td align='center'> <table class='email-content' width='100%' cellpadding='0' cellspacing='0' role='presentation'> <tr> <td class='email-masthead'> </td> </tr> <!-- Email Body --> <tr> <td class='email-body' width='100%' cellpadding='0' cellspacing='0'> <table class='email-body_inner' align='center' width='570' cellpadding='0' cellspacing='0' role='presentation'> <!-- Body content --> <tr> <td class='content-cell'> <div class='f-fallback'> <h1>A " + formTitle + " has been booked. </h1> <table class='body-action' align='center' width='100%' cellpadding='0' cellspacing='0' role='presentation'> <tr> <td align='center'> <table width='100%' border='0' cellspacing='0' cellpadding='0' role='presentation'> <tr> </tr> </table> </td> </tr> </table> <p>Someone has made a request for a " + formTitle + ".</p> <table class='attributes' width='100%' cellpadding='0' cellspacing='0' role='presentation'> <tr> <td class='attributes_content'> <table width='100%' cellpadding='0' cellspacing='0' role='presentation'> <tr> <td class='attributes_item'> <span class='f-fallback'> <strong>Name:</strong> " + body.fullName + " </span> </td> </tr> <tr> <td class='attributes_item'> <span class='f-fallback'> <strong>Email: </strong> " + body.email + " </span> </td> </tr> <tr> <td class='attributes_item'> <span class='f-fallback'> <strong>Phone Number:</strong> " + body.phoneNumber + "</span> </td> </tr> </table> </td> </tr> </table> <p> <strong>Message:</strong></br> " + body.message + "</p> <table class='attributes' width='100%' cellpadding='0' cellspacing='0' role='presentation'> </div> </td> </tr> </table> </td> </tr> <tr> </tr> </table> </td> </tr> </table> </body></html>";
//            }
//            break;
//        case "service":
//            var service = "";
//            console.log("IN HERE", body.service);
//            if (body.service) {
//                service = (body.service == 1) ? "tuning" : ((body.service == 2) ? ("maintenance") : ("restoration"));
//            }
//            console.log("IN HERE", service);
//
//            emailText = "<!DOCTYPE html><html> <body> <table class='email-wrapper' width='100%' cellpadding='0' cellspacing='0' role='presentation'> <tr> <td align='center'> <table class='email-content' width='100%' cellpadding='0' cellspacing='0' role='presentation'> <tr> <td class='email-masthead'> </td> </tr> <!-- Email Body --> <tr> <td class='email-body' width='100%' cellpadding='0' cellspacing='0'> <table class='email-body_inner' align='center' width='570' cellpadding='0' cellspacing='0' role='presentation'> <!-- Body content --> <tr> <td class='content-cell'> <div class='f-fallback'> <h1>A " + formTitle + " has been booked. </h1> <table class='body-action' align='center' width='100%' cellpadding='0' cellspacing='0' role='presentation'> <tr> <td align='center'> <table width='100%' border='0' cellspacing='0' cellpadding='0' role='presentation'> <tr> </tr> </table> </td> </tr> </table> <p>Someone has made a request for a " + formTitle + ".</p> <table class='attributes' width='100%' cellpadding='0' cellspacing='0' role='presentation'> <tr> <td class='attributes_content'> <table width='100%' cellpadding='0' cellspacing='0' role='presentation'> <tr> <td class='attributes_item'> <span class='f-fallback'> <strong>Name:</strong> " + body.fullName + " </span> </td> </tr> <tr> <td class='attributes_item'> <span class='f-fallback'> <strong>Email: </strong> " + body.email + " </span> </td> </tr> <tr> <td class='attributes_item'> <span class='f-fallback'> <strong>Phone Number:</strong> " + body.phoneNumber + "</span> </td> </tr> <tr> <td class='attributes_item'> <span class='f-fallback'> <strong>Service:</strong> " + service + " </span> </td> </tr> <tr> <td class='attributes_item'> <span class='f-fallback'> <strong>Address:</strong> " + body.address + " </span> </td> </tr> </table> </td> </tr> </table> <p> <strong>Message:</strong></br> " + body.message + "</p> <table class='attributes' width='100%' cellpadding='0' cellspacing='0' role='presentation'> </div> </td> </tr> </table> </td> </tr> <tr> </tr> </table> </td> </tr> </table> </body></html>";
//            break;
//    }
//    var resp = generalServices.sendPianoEmailToUser(emailText, res, body.images);
//
//});
//module.exports = router;
