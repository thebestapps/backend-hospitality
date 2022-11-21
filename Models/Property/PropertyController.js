const express = require("express");
const router = express.Router();
const Property = require("./Property");
const XLSX = require("xlsx");
const jwtAuth = require("../../Services/jwtAuthorization");
const PropertyView = require("./PropertyView");
const AdminView = require('./adminView')

/********************************** Admin **********************************/

router.get("/admin/all/dates", jwtAuth.checkAuth, AdminView.getAllWithDates);

router.get("/admin", jwtAuth.checkAuth, AdminView.getProperties);

router.get("/admin/:id", jwtAuth.checkAuth, AdminView.getProperties);

router.post("/", jwtAuth.checkAuth, AdminView.createProperty);

router.post('/duplicate/:id', jwtAuth.checkAuth, AdminView.duplicateProperty)

router.put("/:id", jwtAuth.checkAuth, AdminView.editProperty);

router.delete("/:id", jwtAuth.checkAuth, AdminView.deleteProperty);

router.delete("images/:id", jwtAuth.checkAuth, AdminView.deleteAllImages);

/********************************** User **********************************/
router.get("/", jwtAuth.changeCurrency, PropertyView.GetProperties);

router.get("/details/:id", jwtAuth.changeCurrency, PropertyView.GetPropertyById);

router.get("/details/slug/:urlName", jwtAuth.changeCurrency, PropertyView.GetPropertyById);

router.get("/map", jwtAuth.changeCurrency, PropertyView.GetPropertiesMap);

router.get("/most-booked", jwtAuth.changeCurrency, PropertyView.GetMostBooked);

router.get('/new', jwtAuth.changeCurrency, PropertyView.GetProperties);

router.post('/review', jwtAuth.checkUser, PropertyView.reviewStay);

router.post('/add-remove-favorites', jwtAuth.checkUser, PropertyView.addOrRemoveFromFavorites);

router.get('/user/search', jwtAuth.changeCurrency, PropertyView.search);

router.get('/user/search/suggest', jwtAuth.changeCurrency, PropertyView.getAreasForSearch);



module.exports = router;
