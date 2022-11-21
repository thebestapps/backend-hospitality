const express = require("express");
const router = express.Router();
const PropertyBooking = require("./PropertyBooking");
const XLSX = require("xlsx");
const jwtAuth = require("../../Services/jwtAuthorization");
const PropertyBookingView = require("./PropertyBookingView");
const GuestView = require("../BookingsGuests/GuestView")
const AdminView = require('./adminView')

/********************************** Admin **********************************/
router.get('/', jwtAuth.checkAuth, AdminView.getPropertyBookings);

router.get('/:id', jwtAuth.checkAuth, AdminView.getPropertyBookingsById);

router.put('/admin/confirm-booking', jwtAuth.checkAuth, AdminView.confirmBooking);

router.post('/admin/new/booking', jwtAuth.checkAuth, AdminView.createBooking);

router.get('/admin/bookings/guests', GuestView.getGuestsInfo);

router.get('/admin/bookings/main/guests', jwtAuth.checkAuth, GuestView.getMainGuests);

router.post("/admin/check-availability", jwtAuth.checkAuth, PropertyBookingView.checkIfAvailable);

router.put("/admin/edit/booking", jwtAuth.checkAuth, PropertyBookingView.editBooking);

router.post("/admin/cancel/booking", jwtAuth.checkAuth, PropertyBookingView.cancelBooking)

/********************************** User **********************************/
router.post("/", jwtAuth.checkUser, PropertyBookingView.createPropertyBooking);

router.get('/user/bookings', jwtAuth.checkUser, PropertyBookingView.getMyBookings);

router.get('/user/bookings/:id', jwtAuth.changeCurrency, PropertyBookingView.getBookingById);

router.put('/user/bookings', PropertyBookingView.editBooking);

router.post('/user/bookings/guests', GuestView.addStayBookingGuests);

router.post('/user/confirm-booking', jwtAuth.checkUser, PropertyBookingView.confirmBooking);

router.post('/cancel', jwtAuth.checkUser, PropertyBookingView.cancelBooking);

router.get('/cancel/policy/:id', PropertyBookingView.cancelBookingDetails);

router.post("/user/check-availability", jwtAuth.changeCurrency, PropertyBookingView.checkIfAvailable);

router.post("/user/saved-details", jwtAuth.checkUser, PropertyBookingView.checkIfAvailable);

router.get("/user/saved-details", jwtAuth.checkUser, PropertyBookingView.getUnRegestierdBookingDetails);

router.delete("/user/saved-details", jwtAuth.checkUser, PropertyBookingView.deleteUnRegestierdBookingDetails);


module.exports = router;
