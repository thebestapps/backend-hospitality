
var CONF = require('./constants');
module.exports.getEnvironment = function () {
    var environment = CONF.ENVIRONMENT_VAR;
    var configuration_variables = {};
    if (environment == "L") { // Localhost
        configuration_variables = CONF.config_localhost;

    } else if (environment == "D") {// Development
        configuration_variables = CONF.config_development;

    } else if (environment == "P") {//production
        configuration_variables = CONF.config_production;
    }
    return configuration_variables;
}

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

module.exports.getDates  = function(startDate, stopDate){
    var dateArray = new Array();
    var currentDate = startDate;
    while (currentDate <= stopDate) {
        dateArray.push(new Date (currentDate));
        currentDate = currentDate.addDays(1);
    }
    return dateArray;
}
