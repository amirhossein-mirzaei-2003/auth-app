const app = require('./app');
const dotenv = require('dotenv');
dotenv.config({ path: `${__dirname}/config.env` });
const mongoose = require('mongoose');

const DB = process.env.DATABASE.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(console.log('connected to DB successfully'));

port = process.env.PORT;

const server = app.listen(port, () => {
  console.log(`we are on port ${port}`);
});
