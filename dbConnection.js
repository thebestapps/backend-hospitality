const mongoose = require("mongoose");
const mongodbUri = require("mongodb-uri");
const Utils = require("./Utils");
const environment = Utils.getEnvironment();
const Fawn = require("fawn");
const mysql = require('mysql');
Fawn.init(mongoose);
const task = Fawn.Task();

const sqlConnect = mysql.createConnection({
  host: environment.host,
  user: environment.user,
  password: environment.passwordSql,
  database: environment.database,
  
})

sqlConnect.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL s!');
});

async function connect(mongoose) {
  mongoose.Promise = global.Promise;
  mongoose.set("useUnifiedTopology", true);
  mongoose.set("useNewUrlParser", true);
  mongoose.set("useFindAndModify", false);
  var log = "";
  const option = {
    socketTimeoutMS: 30000,
    keepAlive: true,
    reconnectTries: 30000,
  };

  var uri = mongodbUri.format({
    username: environment.username,
    password: environment.password,
    hosts: [
      {
        host: environment.MongoDB,
        host1: environment.MongoDB,
        port: environment.port_mongo,
        port1: environment.port_mongo,
      },
    ],
    database: environment.database_name,
  });

  //db.auth("admin","2z8b71!98&hKL#9S");
  // var connectionString = "mongodb://admin:2z8b71!98&hKL#9S@18.157.86.136:27017/cheez_db";
  var connectionString = uri;
  try {
    console.log("Trying to connect to db...");

    await mongoose.connect(connectionString, option);
    //Fawn.init(mongoose);
    log = "Database connected successfully";
  } catch (error) {
    console.log("error", error);
    log = "Database connection error";
  }
  return log;
}

connect(mongoose)
  .then(async (log) => {
    console.log("---cnx---", log);
  })
  .catch((log) => {
    console.log("error cnx", log);
  });

module.exports = {
  task,
  sqlConnect
};
