var express = require('express');
var router = express.Router();
var CustomTourInquiryView = require('./CustomTourInquiryView');
var jwt = require('../../Services/jwtAuthorization');


router.get('/', jwt.checkAuth,  CustomTourInquiryView.getCustomTourInquiries);

router.get('/:id', jwt.checkAuth, CustomTourInquiryView.getCustomTourInquiries);

router.post('/', CustomTourInquiryView.createCustomTourInquiry);

router.put('/:id', jwt.checkAuth, CustomTourInquiryView.updateCustomTourInquiry);

module.exports = router;