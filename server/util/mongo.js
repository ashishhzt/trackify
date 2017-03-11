
import chalk   from 'chalk';
import config  from '../config/config';
import MongoClient from 'mongodb'

// let connection = mysql.createConnection(config.mysqldb);

// connection.connect(function(err) {
//   if (err) {
//     console.log(chalk.red.bold('Error connecting MySQL DB: ' + err));
//   } else {
//       console.log(chalk.green.bold('MySQL DB Connected as ID: ' + connection.threadId));
//   }
// });

let connection;

MongoClient.connect(config.db.url, function(err, database) {

    if (err) {
        console.log(err);
    }
    console.log("MONGODB Connected correctly to server");
    connection = database;
});

export default connection;


// var MongoClient = require('mongodb').MongoClient;
// var fs = require('fs');
// var path = require('path');

// /**
//  * Import Config, Client and Collection String for DocumentDB Connection.
//  */
// var config = require('../config');
// var db;
// MongoClient.connect(config.connectionString, function(err, database) {

//     if (err) {
//         console.log(err);
//     }
//     console.log("Connected correctly to server");
//     db = database;
// });


