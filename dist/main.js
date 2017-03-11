import chalk   from 'chalk';
import mongoose from 'mongoose';
import app from './myexpress';
import config from './config/config';
import mongoutil from './util/mongo'

mongoutil.connectToServer( function( err ) {
  // start the rest of your app here
  console.log("Mongoclient got connected");
} );

mongoose.connect(config.db.url);
console.log(chalk.green.bold('MONGO-DB CONNECTED'));

app.listen(config.port, () => {
  console.log(chalk.green.bold.underline('Listening on port ', chalk.magenta(config.port)));
});
