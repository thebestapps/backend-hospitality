var express = require("express");
var path = require("path");
var admin = require("firebase-admin");
var db = require("./dbConnection.js");
var jwtAuth = require("./Services/jwtAuthorization");
const bookingService = require("./Services/checkbookingHold");
const NotificationService = require("./Services/autoSendNotifications");
const EmailsService = require("./Services/autoSendEmail");
var cors = require("cors");
var app = express();
const cron = require("node-cron");

app.use(express.json());
//app.use(express.urlencoded({ extended: true }));

// var messages = require('./messages.json');
var CONF = require("./constants");

// Set up the routing.
// app.options('*', cors()); // include before other routes
app.use(cors());

var v1 = express.Router();
console.log("__dirname ", __dirname);
if (CONF.MAINTENANCE == "T") {
  console.log("--------------- Maintenance ---------------");
  app.use((request, response, next) => {
    let err = new Error("Maintenance");
    err.status = 777;
    var msg =
      messages.en.App_Title +
      " is currently under maintenance. Please check back soon.";
    response.status(777).send({ message: msg });
  });
} else {
  var firebaseConfig = {
    apiKey: "AIzaSyDA_BjxkhMueNhoCNcPF11__sHUUtQb5ig",
    authDomain: "cheez-hospitality.firebaseapp.com",
    databaseURL: "https://cheez-hospitality.firebaseio.com",
    projectId: "cheez-hospitality",
    storageBucket: "cheez-hospitality.appspot.com",
    messagingSenderId: "864179586667",
    appId: "1:864179586667:web:9fe7e232954d072d71d32e",
    measurementId: "G-928TPEKR6D",
  };
  // Initialize Firebase
  admin.initializeApp(firebaseConfig);

  var PropertyController = require("./Models/Property/PropertyController");
  var PropertyCategoryController = require("./Models/PropertyCategory/CategoryController");
  var BedsController = require("./Models/Beds/BedsController");
  var BathController = require("./Models/Bathrooms/BathroomController");
  var CountryController = require("./Models/Country/CountryController");
  var CityController = require("./Models/City/CityController");
  var AreaController = require("./Models/Area/AreaController");
  var CurrencyController = require("./Models/Currency/CurrencyController");
  var AmenitiesController = require("./Models/Amenities/AmenitiesController");
  var RulesController = require("./Models/Rules/RulesController");
  var HighlightController = require("./Models/Highlights/HighlightController");
  var SearchHistoryController = require("./Models/Search/searchController");
  var TourController = require("./Models/Tour/TourController");
  var TourCategoryController = require("./Models/TourCategory/CategoryController");
  //var AddressController = require("./Models/Address/AddressController");
  var ProductController = require("./Models/Product/ProductController");
  var ProductCategoryController = require("./Models/ProductCategories/CategoryController");
  var ProductSupplierController = require("./Models/ProductSupplier/ProductSupplierController");
  var CartController = require("./Models/Cart/cartController");
  var OrderController = require("./Models/Order/OrderController");
  var BlogController = require("./Models/Blog/BlogController");
  var PaymentMethodController = require("./Models/PaymentMethod/PaymentMethodController");
  var PropertyBookingController = require("./Models/PropertyBooking/PropertyBookingController");
  var TourBookingController = require("./Models/TourBooking/TourBookingController");
  var EmailController = require("./Models/Email/EmailController");
  var CareersController = require("./Models/Career/CareerController");
  //var SignUp = require("./Models/User/SignUp");
  var AdminController = require("./Models/User/AdminController");
  var GuestController = require("./Models/User/GuestsController");
  var Login = require("./Models/User/LoginController");
  var ProfileController = require("./Models/User/UserProfileController");
  var ForgetPassword = require("./Models/User/ForgetPasswordController");
  var Count = require("./Models/Collections/Count");
  var PropertyInquiryController = require("./Models/PropertyInquiry/PropertyInquiryController");
  var OwnerController = require("./Models/PropertyOwners/OwnersController");
  var TourInquiryController = require("./Models/TourInquiry/TourInquiryController");
  //var CustomTourInquiryController = require("./Models/CustomTourInquiry/CustomTourInquiryController");
  var TeamController = require("./Models/Team/TeamController");
  var CompanyController = require("./Models/Companies/CompanyController");
  var StoryController = require("./Models/Story/StoryController");
  var MissionController = require("./Models/Mission/MissionController");
  var VisionController = require("./Models/Vision/VisionController");
  var ConversionController = require("./Models/Conversion/ConversionController");
  var NotificationController = require("./Models/Notifications/NotificationController");
  var TaskController = require("./Models/Task/TaskController");

  var CheezTermsController = require("./Models/CheezTerms/CheezTermsController");
  var PrivacyPolicyController = require("./Models/PrivacyPolicy/PrivacyPolicyController");
  var GuesthousesController = require("./Models/Guesthouse/GuesthouseController");
  var EventsController = require("./Models/GuestHouseEvents/EventController");
  //var PackagesController = require("./Models/Package/PackageController");
  var AnalyticsController = require("./Models/Analytics/analyticsController");
  var CalendarController = require("./Models/Calendar/CalendarController");
  var CancelPolicyController = require("./Models/CancellationPolicy/CancelPolicyController");
  var MediaContoller = require("./Models/Media/MediaContoller");
  var StayDetailsContoller = require("./Models/propertyDetails/DetailsController");
  var ContactDetailsController = require("./Models/ContactDetails/ContactDetailsController");
  var ShippingCostController = require("./Models/ShippingCost/ShippingCostController");
  var AppVersionController = require("./Models/AppVersion/VersionController");

  v1.use(function (req, res, next) {
    req.header("Access-Control-Allow-Origin", "*");
    next();
  });

  v1.use("/properties", PropertyController);
  v1.use("/search-history", SearchHistoryController);
  v1.use("/propertycategories", PropertyCategoryController);
  v1.use("/beds", BedsController);
  v1.use("/bathrooms", BathController);
  v1.use("/countries", CountryController);
  v1.use("/cities", CityController);
  v1.use("/areas", AreaController);
  v1.use("/currencies", CurrencyController);
  v1.use("/amenities", AmenitiesController);
  v1.use("/rules", RulesController);
  v1.use("/highlight", HighlightController);
  v1.use("/tours", TourController);
  v1.use("/tourcategories", TourCategoryController);
  v1.use("/productcategories", ProductCategoryController);
  //v1.use("/address", jwtAuth.checkAuth, AddressController);
  v1.use("/products", ProductController);
  v1.use("/cart", CartController);
  v1.use("/productSupplier", ProductSupplierController);
  v1.use("/order", OrderController);
  v1.use("/payment", PaymentMethodController);
  v1.use("/propertyBooking", PropertyBookingController);
  v1.use("/tourBooking", TourBookingController);
  v1.use("/blogs", BlogController);
  v1.use("/careers", CareersController);
  v1.use("/notifications", NotificationController);

  v1.use("/email", EmailController);
  //v1.use("/signup", SignUp);
  v1.use("/admin", AdminController);
  v1.use("/guest", GuestController);
  v1.use("/login", Login);
  v1.use("/user", ProfileController);
  v1.use("/forgetpassword", ForgetPassword);
  //v1.use("/counts", jwtAuth.checkAuth, Count);
  v1.use("/tasks", TaskController);

  v1.use("/propertyInquiry", PropertyInquiryController);
  v1.use("/owners", OwnerController);
  v1.use("/tourInquiry", TourInquiryController);
  //v1.use("/customTourInquiry", CustomTourInquiryController);

  v1.use("/team", TeamController);
  v1.use("/companies", CompanyController);
  v1.use("/story", StoryController);
  v1.use("/mission", MissionController);
  v1.use("/vision", VisionController);
  v1.use("/rate", ConversionController);

  v1.use("/terms", CheezTermsController);
  v1.use("/privacy-policy", PrivacyPolicyController);
  v1.use("/guesthouses", GuesthousesController);
  v1.use("/events", EventsController);
  //v1.use("/packages", PackagesController);
  v1.use("/analytics", AnalyticsController);
  v1.use("/calendardata", CalendarController);
  v1.use("/cancelpolicy", CancelPolicyController);
  v1.use("/media", MediaContoller);
  v1.use("/stay-extra-details", StayDetailsContoller);
  v1.use("/contact-details", ContactDetailsController);
  v1.use("/shipping-cost", ShippingCostController);

  v1.use("/app-version", AppVersionController);

  // Api doc path
  v1.get("/apidoc", function (req, res) {
    req.headers["if-none-match"] = "no-match-for-this";
    console.log("indexpath apidoc:" + __dirname + "/apidoc/index.html");
    res.sendFile(path.join(__dirname + "/apidoc/index.html"));
  });

  app.use("/apidoc", express.static(path.join(__dirname, "apidoc")));
  app.use("/files", express.static(path.join(__dirname, "files")));
  app.use("/v1", v1);

  cron.schedule(
    "55 11 * * *",
    function () {
      NotificationService.sendCheckInReminderNotification();

      console.log("running on 3pm every day");
    },
    { scheduled: true, timezone: "UTC" }
  );

  cron.schedule(
    "58 11 * * *",
    function () {
      EmailsService.sendCheckInDetails();

      console.log("running on 3pm every day");
    },
    { scheduled: true, timezone: "UTC" }
  );

  cron.schedule(
    "55 4 * * *",
    function () {
      NotificationService.sendCheckOutReminderNotification();

      console.log("running on 9am every day");
    },
    { scheduled: true, timezone: "UTC" }
  );

  cron.schedule(
    "58 4 * * *",
    function () {
      EmailsService.sendCheckOutEmail();

      console.log("running on 9am every day");
    },
    { scheduled: true, timezone: "UTC" }
  );

  cron.schedule(
    "0 11 * * *",
    function () {
      EmailsService.sendCompleteInfoEmailReminder();

      console.log("running on 3");
    },
    { scheduled: true, timezone: "UTC" }
  );

  app.use((request, response, next) => {
    let err = new Error("Not Found");
    err.status = 404;
    response.status(404).send({ error: "Page not found." });
  });
}

module.exports = app;
