var express = require('express');
var router = express.Router();
var CustomTourInquiry = require('./CustomTourInquiry');
const nodemailer = require("nodemailer");
var path = require('path')
var Handlebars = require('handlebars');
var fs = require('fs');


var CustomTourTransporter = nodemailer.createTransport({
    service: 'gmail',
    secure: false,
    port: 25,
    auth: {
        user: 'replyn85@gmail.com',
        pass: 'fadeljoe'
    },
    tls: {
        rejectUnauthorized: false
    }
});

sendMail = async (fullName,email,phoneNumber,beginDate,endDate,cities,type,budget,target) => {
    var source = await fs.readFileSync(path.join(__dirname, '../../Email/custom-tour-booking-template.html'), 'utf8');
    var template = await Handlebars.compile(source);

    var options = {
        from: 'replyn85@gmail.com',
        to: 'info@cheezhospitality.com',
        subject: 'Cheez Custom Tour Inquiry',
        html: template({
           fullName: fullName,
           email: email,
           phoneNumber:phoneNumber,
           beginDate:beginDate,
           endDate:endDate,
           cities:cities,
           type:type,
           budget:budget,
           target: target
        }) 
    }
    CustomTourTransporter.sendMail(options, function (error, response) {
        if (error) {
            console.log(error);
            callback(error);
        }
    })
}

async function createCustomTourInquiry(req, res) {
    var newCustomTourInquiry = new CustomTourInquiry();
    req.body.status = "New"
    req.body.fullName = req.body.firstName+ ' '+ req.body.lastName
    newCustomTourInquiry.setCustomTourInquiry(req.body);
    await newCustomTourInquiry.save();
    var createdCustomTourInquiry = await CustomTourInquiry.findOne({ _id: newCustomTourInquiry._id }).populate('customTour');
    target = "https://admin.cheezhospitality.com/#/tours/custom-inquiries/"+ createdCustomTourInquiry._id
    var email = await sendMail(createdCustomTourInquiry.fullName,createdCustomTourInquiry.email,createdCustomTourInquiry.phoneNumber ,createdCustomTourInquiry.beginDate,createdCustomTourInquiry.endDate,
    createdCustomTourInquiry.selectedCities,createdCustomTourInquiry.budget, target)

    console.log("Custom Tour Inquiry successfully created");
    res.status(200).send(newCustomTourInquiry);
}


async function getCustomTourInquiries(req, res) {
    var customTourInquiries;
    try {
        if (req.params.id) {
            var query = { _id: req.params.id };
            customTourInquiries = await CustomTourInquiry.findOne(query).populate('customTour');
        }
        else {
            customTourInquiries = await CustomTourInquiry.find({}).sort({createdAt: -1});
        }
        if (customTourInquiries)
            res.status(200).send(customTourInquiries);
        else
            res.status(200).send({ "message": "No customTour bookings" });
    }
    catch (error) {
        res.status(500).send({ "message": error.message });
    }
};

async function updateCustomTourInquiry(req, res) {
    var inquiry = await CustomTourInquiry.findOne({_id:req.params.id});
    if (inquiry == undefined || inquiry == null) {
        console.log("ERROR -- inquiry not found");
        status = 422;
        response.message = msg;
        return res.status(status).send(response);
    } else {
        var updated = await CustomTourInquiry.update({_id:req.params.id}, req.body)
        return res.status(200).send(updated)
    }
};


async function getInquiriesForCalendar(req,res){
  
    var customTourInquiries;
    try {
        customTourInquiries = await CustomTourInquiry.find({"status" : "Booked"}).select('_id fullName date vehicle').sort({createdAt: -1});
        res.status(200).send(customTourInquiries);
    }
    catch (error) {
        res.status(500).send({ "message": error.message });
    }
}


module.exports = { createCustomTourInquiry, getCustomTourInquiries, updateCustomTourInquiry, getInquiriesForCalendar }