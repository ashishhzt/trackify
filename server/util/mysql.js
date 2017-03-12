
import mysql   from 'mysql';
import chalk   from 'chalk';
import config  from '../config/config';

let connection = mysql.createConnection(config.mysqldb);

// connection.connect(function(err) {
//   if (err) {
//     console.log(chalk.red.bold('Error connecting MySQL DB: ' + err));
//   } else {
//       console.log(chalk.green.bold('MySQL DB Connected as ID: ' + connection.threadId));
//   }
// });

export default connection;