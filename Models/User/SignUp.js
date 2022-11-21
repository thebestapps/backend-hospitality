var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const saltRounds = 10;
var salt = bcrypt.genSaltSync(saltRounds);
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
var User = require('./User');
var messages = require('../../messages.json');
var ObjectID = require('mongodb').ObjectID;


/** fullName: String,
  email: String,
  phoneNumber: String,
  password: String,
  role: Number, 
  timeZone: Number,
  country: String,
   */

/* CREATES A NEW USER*/
router.post('/', async function (req, res) {
    var status;
    var msg; 
    try {

        console.log("\n\n----- sign up request -----\n", req.body);
        var role = req.body.role;
        // if(req.body=={}){
        //     console.log()
        // }
        var newUser = new User();
        newUser.setUser(req.body);

        console.log("newUser", newUser);
        var exists = await User.findOne({ phoneNumber: req.body.phoneNumber });
        if(!exists){
            await newUser.save();
            msg = newUser;
            status = 200;
        }
        else{
            msg = "User with this phone number exists"
            status = 401;
        }
        return res.status(status).send(msg);
        
        // var result = await createAuthorization(userAndPhone, newUser, req);

    }
    catch (error) {
        if (!error.status) {
            console.log("error in creating new user: ", error);
            status = 500;
            msg = error;
        }

        else {
            status = error.status;
            msg = error.msg;
        }
        return res.status(status).send(msg);
    }

});

module.exports = router;