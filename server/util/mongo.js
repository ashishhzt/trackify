
import chalk   from 'chalk';
import config  from '../config/config';
import MongoClient from 'mongodb'



// let connection;

// MongoClient.connect(config.db.url, function(err, database) {

//     if (err) {
//         console.log(err);
//     }
//     console.log("MONGODB Connection datbase object");

//     console.log(database)
//     connection = database;
// });

// export default connection;




var _db;

module.exports = {

  connectToServer: function( callback ) {
    MongoClient.connect( "mongodb://localhost:27017/trackify_db", function( err, db ) {
      _db = db;
      return callback( err );
    } );
  },

  getDb: function() {
    return _db;
  }
};
