const jwt = require("jsonwebtoken");
const CONF = require("../constants");
const messages = require("../messages.json");
const Admin = require("../Models/User/Admin");
// var User = require
const permission = require("./permissionService");
const util = require("util");
const User = require("../Models/User/User");
const { Currency } = require("../Models/Currency/Currency");
const Conversion = require("../Models/Conversion/Conversion");
const mongoose = require("mongoose");

async function checkAuth(request, response, next) {
  let authHeader = request.headers.authorization;

  try {
    if (!authHeader) {
      // no authorization header
      return response
        .status(401)
        .json({ message: messages.en.missingAuthorizationHeader });
    }
    jwt.verify(authHeader, CONF.secret_jwt, async function (err, decoded) {
      try {
        if (err) {
          response.status(403).json({
            message: err.message,
          });
        } else if (decoded) {
          let currentAdmin = await Admin.findOne({
            _id: mongoose.Types.ObjectId(decoded._id),
            deleted: false,
          });
          if (!currentAdmin) {
            return response
              .status(404)
              .send({ message: "No Admin Found", unAutherized: true });
          }
          request.user = currentAdmin;
          console.log("------------- JWTDecoded -------------");
          console.log(decoded);
          console.log("------------- End JWTDecoded -------------");
          next();
        }
      } catch (err) {
        console.log("err", err);
      }
    });
  } catch (error) {
    console.log("Error:", error);
    response
      .status(401)
      .send({ message: messages.en.invalidAuthorizationHeader });
  }
}

async function checkUser(request, response, next) {
  let authHeader = request.headers.authorization;
  let userCurrency = request.headers.currency;

  try {
    if (!authHeader) {
      // no authorization header
      return response
        .status(401)
        .json({ message: messages.en.missingAuthorizationHeader });
    }
    jwt.verify(authHeader, CONF.secret_jwt, async function (err, decoded) {
      try {
        if (err) {
          response.status(403).json({
            message: "Please sign in to continue",
          });
        } else if (decoded) {
          let currentUser = await User.findOne({
            _id: mongoose.Types.ObjectId(decoded._id),
            isDisactivated: false,
          });
          if (!currentUser) {
            return response
              .status(404)
              .send({ message: messages.en.noUserFound, unAutherized: true });
          }
          request.user = currentUser;

          //currency for different prices
          if (!userCurrency) {
            request.conversion = null;
          } else {
            let defautlCurrency = await Currency.findOne({
              isWebSiteDefault: true,
            });
            let conversion = await Conversion.findOne({
              from: defautlCurrency._id,
              to: mongoose.Types.ObjectId(userCurrency),
            }).populate("to", "_id name symbol");

            if (conversion) request.conversion = conversion;
            else request.conversion = null;
          }
          console.log("------------- JWTDecoded -------------");
          console.log(decoded);
          console.log("------------- End JWTDecoded -------------");
          next();
        }
      } catch (err) {
        console.log("err", err);
      }
    });
  } catch (error) {
    console.log("Error:", error);
    response
      .status(401)
      .send({ message: messages.en.invalidAuthorizationHeader });
  }
}

async function changeCurrency(request, response, next) {
  let userCurrency = request.headers.currency;
  let authHeader = request.headers.authorization;

  if (authHeader === "undefined" || authHeader === "null" || !authHeader) {
    request.user = null;
  } else {
    jwt.verify(authHeader, CONF.secret_jwt, async function (err, decoded) {
      try {
        if (err) {
          response.status(403).json({
            message: err.message,
          });
        } else if (decoded) {
          request.user = decoded._id;
        }
      } catch (err) {
        console.log("err", err);
      }
    });
  }

  if (userCurrency) {
    let defautlCurrency = await Currency.findOne({
      isWebSiteDefault: true,
    });

    if (
      userCurrency === "1234" ||
      userCurrency === "undefined" ||
      userCurrency === "null" ||
      !userCurrency
    ) {
      request.conversion = null;
    } else {
      let conversion = await Conversion.findOne({
        from: defautlCurrency._id,
        to: mongoose.Types.ObjectId(userCurrency),
      }).populate("to", "_id name symbol");

      if (conversion) request.conversion = conversion;
      else request.conversion = null;
    }
  }

  next();

  console.log("------------- Changed Currency -------------");
  console.log("------------- Changed -------------");
}

module.exports = {
  checkAuth,
  checkUser,
  changeCurrency,
};
