const express = require("express");
const router = express.Router();
const jwtAuth = require("../../Services/jwtAuthorization");
const TourBookingView = require("./TourBookingView");
const adminView = require("./adminView");

/********************************** admin **********************************/
router.get("/", jwtAuth.checkAuth, adminView.getTourBookings);

router.get("/:id", jwtAuth.checkAuth, adminView.getTourBookingById);

router.put("/admin/confirm-booking", jwtAuth.checkAuth, adminView.confirmBooking);

/********************************** User **********************************/
router.post("/", jwtAuth.checkUser, TourBookingView.createTourBooking);

router.get("/user/bookings", jwtAuth.checkUser, TourBookingView.getMyBookings);

router.get("/user/bookings/:id", jwtAuth.checkUser, TourBookingView.getBookingDetails);

router.post("/details", jwtAuth.checkUser, TourBookingView.getTourDetails);

router.post('/user/confirm-booking', jwtAuth.checkUser, TourBookingView.confirmBooking);

router.post('/cancel', jwtAuth.checkUser, TourBookingView.cancelBooking);

router.get('/cancel/policy/:id', jwtAuth.checkUser, TourBookingView.cancelBookingDetails);

module.exports = router;
