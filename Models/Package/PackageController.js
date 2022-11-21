var express = require('express');
var router = express.Router();
var Package = require('./Package')
var XLSX = require('xlsx');
var jwt = require('../../Services/jwtAuthorization');
var PackageView = require('./PackageView');


router.get('/', PackageView.getPackages);

router.get('/:id', PackageView.getPackages);

router.post('/', jwt.checkAuth, PackageView.createPackage);

router.post('/:id',jwt.checkAuth, PackageView.editPackage);

router.delete('/:id',jwt.checkAuth, PackageView.deletePackage);

module.exports = router;
