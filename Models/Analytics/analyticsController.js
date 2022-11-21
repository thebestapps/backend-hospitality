const express = require("express");
const router = express.Router();
const jwtAuth = require("../../Services/jwtAuthorization");
const analyticsController = require("./analyticsView");

router.get("/monthly-revenu", jwtAuth.checkAuth, analyticsController.getMonthlyRevenu);

router.post("/monthly-revenu/downloadExcel", jwtAuth.checkAuth, analyticsController.getMonthlyRevenu);

router.get("/monthly-bookings", jwtAuth.checkAuth, analyticsController.getMonthlyBookings);

router.post("/monthly-bookings/downloadExcel", jwtAuth.checkAuth, analyticsController.getMonthlyBookings);

router.get("/occupancy", jwtAuth.checkAuth, analyticsController.getOccupancyRate);

router.post("/occupancy/downloadExcel", /*jwtAuth.checkAuth,*/ analyticsController.getOccupancyRate);

module.exports = router;

//var Utils = require("../../Utils");
//var environment = Utils.getEnvironment();
//const { google } = require("googleapis");
//const scopes = "https://www.googleapis.com/auth/analytics.readonly";
//var PropertyInquiryView = require("../PropertyInquiry/PropertyInquiryView");
//
//var express = require("express");
//var router = express.Router();
//
//var jwt = require("../../Services/jwtAuthorization");
//
//const view_id = "230855038";
//const private_key = environment.private_key.replace(/\\n/gm, "\n");
//const google_jwt = new google.auth.JWT(
//  environment.email,
//  null,
//  private_key,
//  scopes
//);
//
////Get the number of sessions in the last 30 days
//
//async function getUsersByMonth(start, end) {
//  const response = await google_jwt.authorize();
//  const result = await google.analytics("v3").data.ga.get({
//    auth: google_jwt,
//    ids: "ga:" + view_id,
//    "start-date": start,
//    "end-date": end,
//    metrics: "ga:users",
//  });
//  return result.data.rows[0][0];
//}
//
//async function getMonthlyUsersNumber(req, res) {
//  const nov20 = await getUsersByMonth("2020-11-01", "2020-11-30");
//  const dec20 = await getUsersByMonth("2020-12-01", "2020-12-31");
//  const jan21 = await getUsersByMonth("2021-01-01", "2021-01-31");
//
//  data2020 = [nov20, dec20];
//  data2021 = [jan21];
//
//  data = [
//    {
//      month: "Nov 20",
//      number: nov20,
//    },
//    {
//      month: "Dec 20",
//      number: dec20,
//    },
//    {
//      month: "Jan 21",
//      number: jan21,
//    },
//  ];
//  res.status(200).send(data);
//}
//
////Get the number of today sessions
//
//async function getTodaySessions(req, res) {
//  const response = await google_jwt.authorize();
//  const result = await google.analytics("v3").data.ga.get({
//    auth: google_jwt,
//    ids: "ga:" + view_id,
//    "start-date": "today",
//    "end-date": "today",
//    metrics: "ga:sessions",
//  });
//
//  res.status(200).send(result.data.rows[0][0]);
//}
//
//async function getActiveUsersPerDay(req, res) {
//  const response = await google_jwt.authorize();
//  const result = await google.analytics("v3").data.ga.get({
//    auth: google_jwt,
//    ids: "ga:" + view_id,
//    "start-date": "15daysAgo",
//    "end-date": "today",
//    metrics: "ga:1dayUsers",
//    dimensions: "ga:date",
//  });
//
//  res.status(200).send(result.data.rows);
//}
//
//async function getMostViewedStays(req, res) {
//  const response = await google_jwt.authorize();
//  var stays = [];
//  const result = await google.analytics("v3").data.ga.get({
//    auth: google_jwt,
//    ids: "ga:" + view_id,
//    "start-date": "30daysAgo",
//    "end-date": "today",
//    metrics: "ga:UniquePageviews",
//    dimensions: "ga:pageTitle,ga:pagePath",
//    sort: "-ga:UniquePageviews",
//  });
//
//  result.data.rows.forEach((r) => {
//    if (r[1].includes("stays/stay/")) {
//      if (r[0] !== "(not set)" && !stays.includes(r[0])) {
//        stays.push({ name: r[0], views: r[2] });
//      }
//    }
//  });
//
//  res.status(200).send(stays.slice(0, 10));
//}
//
//async function getVisitorsLast30Days(req, res) {
//  const response = await google_jwt.authorize();
//  const result = await google.analytics("v3").data.ga.get({
//    auth: google_jwt,
//    ids: "ga:" + view_id,
//    "start-date": "30daysAgo",
//    "end-date": "today",
//    metrics: "ga:newUsers",
//  });
//
//  res.status(200).send({ nb: result.data.rows[0][0] });
//}
//
//router.get("/usersbymonth", getMonthlyUsersNumber);
//router.get("/todaysessions", getTodaySessions);
//router.get("/userslast15days", getActiveUsersPerDay);
//
//router.get("/visitorslast30days", getVisitorsLast30Days);
//router.get("/userslast15days", getActiveUsersPerDay);
//router.get("/popularstays", getMostViewedStays);
////router.get('/mostinquiredstays',PropertyInquiryView.getMostInquiredStays)
////router.get('/inquiriesnb',PropertyInquiryView.getNbOfInquiriesLast30Days)
////router.get('/todaystaysdata', PropertyInquiryView.getTodaysData)
//
//module.exports = router;
