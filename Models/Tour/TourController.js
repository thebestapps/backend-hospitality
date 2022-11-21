const express = require("express");
const router = express.Router();
const Tour = require("./Tour");
const jwtAuth = require("../../Services/jwtAuthorization");
const XLSX = require("xlsx");
const AdminView = require("./adminView");
const TourView = require("./TourView");

/********************************** Admin **********************************/
router.get("/admin", jwtAuth.checkAuth, AdminView.getTours);

router.get("/admin/:id", jwtAuth.checkAuth, AdminView.getTourById);

router.post("/", jwtAuth.checkAuth, AdminView.createTour);

router.post("/dates", jwtAuth.checkAuth, AdminView.createTourDates);

router.put("/dates", jwtAuth.checkAuth, AdminView.editTourDate);

router.delete("/dates", jwtAuth.checkAuth, AdminView.deleteDate);

router.put("/:id", jwtAuth.checkAuth, AdminView.editTour);

router.delete("/:id", jwtAuth.checkAuth, AdminView.deleteTour);

router.post("/convert-currency/:id", jwtAuth.checkAuth, AdminView.ConvertCurrency);

router.delete("images/:id", jwtAuth.checkAuth, AdminView.deleteAllImages);

/********************************** User **********************************/
router.get("/", jwtAuth.changeCurrency, TourView.getExperiences);

router.get("/map", jwtAuth.changeCurrency, TourView.getExperiencesForMap);

router.get("/new", jwtAuth.changeCurrency, TourView.getExperiences);

router.get("/details/:id", jwtAuth.changeCurrency, TourView.getExperiencesById);

router.get("/details/slug/:urlName", jwtAuth.changeCurrency, TourView.getExperiencesById)

router.post('/add-remove-favorites', jwtAuth.checkUser, TourView.addOrRemoveFromFavorites);

router.post('/review', jwtAuth.checkUser, TourView.reviewTour);

router.get('/user/search', jwtAuth.changeCurrency, TourView.search);

module.exports = router;
