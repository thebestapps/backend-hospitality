const express = require("express");
const router = express.Router();
const XLSX = require("xlsx");
const PaymentMethodView = require("./PaymentMethodView");
const AdminView = require("./AdminView")
const jwtAuth = require("../../Services/jwtAuthorization");

router.get("/", jwtAuth.checkAuth, AdminView.getPaymentIntenstRecords);

router.get("/stripe/check-user-exist", jwtAuth.checkUser, PaymentMethodView.checkIfUserExistInStripe);

router.get("/stripe/user-method", jwtAuth.checkUser, PaymentMethodView.getMyPaymentMethods);

router.post("/stripe/user-method", jwtAuth.checkUser, PaymentMethodView.createPaymentMethod);

router.post("/stripe/user-method/website", jwtAuth.checkUser, PaymentMethodView.createPaymentMethodForWebsite);

router.delete("/stripe/user-method/:id", jwtAuth.checkUser, PaymentMethodView.deletePaymentMethod);

router.delete("/stripe/website/user-method/:id", jwtAuth.checkUser, PaymentMethodView.deletePaymentMethodForWebsite);

router.post("/stripe/stay", jwtAuth.checkUser, PaymentMethodView.createPaymentRecordForStays_stripe);

router.post("/stripe/tour", jwtAuth.checkUser, PaymentMethodView.createPaymentRecordForTours_stripe);

router.post("/stripe/product", jwtAuth.checkUser, PaymentMethodView.createPaymentRecordForOrders_stripe);

router.post("/stripe/create-checkout-session", jwtAuth.checkUser, PaymentMethodView.paymentInWebsite);

//router.post("/stripe/success", jwtAuth.checkUser, PaymentMethodView.succesOnWebsitePayment);

module.exports = router;
