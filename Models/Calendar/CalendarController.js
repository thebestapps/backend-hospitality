const Utils = require("../../Utils");
const environment = Utils.getEnvironment();
const PropertyInquiryView = require("../PropertyInquiry/PropertyInquiryView");
const TourInquiryView = require("../TourInquiry/TourInquiryView");
const Property = require("../Property/PropertyView");
const Tour = require("../Tour/TourView");
const HoldEventView = require("./HoldEventView");
const PropertyAdminView = require("../Property/adminView");
const jwtAuth = require("../../Services/jwtAuthorization");
const express = require("express");
const HoldEvent = require("./HoldEvent");
const router = express.Router();

router.get("/", jwtAuth.checkAuth, HoldEventView.getHoldEvents);

router.get("/:id", jwtAuth.checkAuth, HoldEventView.getEventById);

router.get("/stays/all", jwtAuth.checkAuth, HoldEventView.getStaysAndEvents);

router.get("/stays/summury", jwtAuth.checkAuth, HoldEventView.getStaysSummury);

router.get("/stay/upcoming", jwtAuth.checkAuth, HoldEventView.getUpcomingStaysBooking);

router.get("/stay/departure", jwtAuth.checkAuth, HoldEventView.getUpcomingDepartures);

router.post("/stay/ratebydate/:id", jwtAuth.checkAuth, PropertyAdminView.SetRateByDateRanges);

router.post('/stay/ratebyweekdays/:id', jwtAuth.checkAuth, PropertyAdminView.SetRateByWeekDays);

router.post('/stay/ratebyweekends/:id', jwtAuth.checkAuth, PropertyAdminView.SetRateByWeekends);

router.post('/stay/blockedDates', jwtAuth.checkAuth, HoldEventView.createBlockedDates);

router.put('/stay/blockedDates/:id', jwtAuth.checkAuth, HoldEventView.editBlockedDates);

router.delete('/stay/blockedDates/:id', jwtAuth.checkAuth, HoldEventView.cancelBlockedDates);

router.get('/stay/blockedDates', jwtAuth.checkAuth, HoldEventView.getBlockedDates);

router.get('/stay/blockedDates/summury', jwtAuth.checkAuth, HoldEventView.getBlockedDatesSummury);

router.get("/tour/upcoming", jwtAuth.checkAuth, HoldEventView.getUpcomingTours);

//router.get('/propertyInquiries',PropertyInquiryView.getInquiriesForCalendar);
//router.get('/tourInquiries',TourInquiryView.getInquiriesForCalendar);
//router.get('/properties',Property.getPropertiesForCalendar);
//router.get('/tours',Tour.getToursForCalendar);
//router.post('/properties/hold',PropertyInquiryView.holdDatesForProperty)
//router.post('/properties/unhold',PropertyInquiryView.unholdDatesForProperty)
//router.post('/tours/hold',TourInquiryView.holdDatesForTour)
//router.post('/tours/unhold',TourInquiryView.unholdDatesForTour)
//
//router.post('/holdEvents',HoldEventView.createHoldEvent)
//router.get('/holdEvents', HoldEventView.getHoldEvents );
//router.put('/holdEvents/:id', HoldEventView.editHoldEvent );
//router.delete('/holdEvents/:id', HoldEventView.deleteHoldEvent );

module.exports = router;
