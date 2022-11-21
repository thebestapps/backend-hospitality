
var express = require('express');
var router = express.Router();
var jwtAuth = require('../../Services/jwtAuthorization')
var Package = require("./Package");

async function createPackage(req, res) {
    var newPackage = new Package();
    newPackage.setPackage(req.body);
    await newPackage.save();
    console.log("New package created", newPackage);
    return res.status(200).send(newPackage);
}

async function getPackages(req, res) {
    var packages;
    try {
        if(!req.params.id)
        {
            packages = await Package.find({}).populate('products')
            res.status(200).send(packages);
        }
        else if (req.params.id !== "new") {
            var query = { _id: req.params.id };
            packages = await Package.findOne(query);
            res.status(200).send(packages);

        }
        else {
            res.status(200).send({ "message": "No packages" });
        }
    }
    catch (error) {
        res.status(500).send({ "message": error.message });
    }
};

async function editPackage(req,res){
    var package = await Package.findOne({_id:req.params.id});
    if (package == undefined || package == null) {
        console.log("ERROR -- Package not found");
        status = 422;
        response.message = msg;
        return res.status(status).send(response);
    } else {
        var updated = await Package.update({_id:req.params.id}, req.body)
        return res.status(200).send(updated)
    }
} 
 

async function deletePackage(req,res){
    var package = await Package.findOne({_id:req.params.id});
    if (package == undefined || package == null) {
        console.log("ERROR -- Package not found");
        status = 422;
        response.message = msg;
        return res.status(status).send(response);
    } else {
        var updated = await Package.deleteOne({_id:req.params.id}, req.body)
        return res.status(200).send(updated)
    }
} 


module.exports = { createPackage, getPackages, editPackage, deletePackage };