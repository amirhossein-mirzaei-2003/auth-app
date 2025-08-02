const app = require('./app');
const dotenv = require('dotenv');
dotenv.config({ path: `${__dirname}/config.env` });
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION. SHUTING DOWN...');
  process.exit(1);
});

const DB = process.env.DATABASE.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => console.log('connected to DB successfully'));

port = process.env.PORT || 8000;

const server = app.listen(port, () => {
  console.log(`we are on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION. SHUTING DOWN...');
  server.close(() => {
    process.exit(1);
  });
});
