var Utils = require("./Utils");
var app = require("./app");
var https = require("https");
var http = require("http");
var fs = require("fs");
var path = require("path");
const bodyParser = require("body-parser");

var key = fs.readFileSync(__dirname + "/certs/privekey.pem");
var cert = fs.readFileSync(__dirname + "/certs/fullchain.pem");
var options = {
  key: key,
  cert: cert,
};

var configuration_variables = Utils.getEnvironment();

// Create an HTTP service.
http.createServer(app).listen(3222, () => {
  console.log("server listening on port:" + 3222);
});

// Create an HTTPS service identical to the HTTP service.
https.createServer(options, app).listen(configuration_variables.port, () => {
  console.log("server listening on port:" + configuration_variables.port);
});

//var server = app.listen(configuration_variables.port, function () {
//  console.log(
//    "Express server listening on port:" + configuration_variables.port
//  );
//});
