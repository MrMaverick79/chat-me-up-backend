// config.js
const dotenv = require('dotenv');
dotenv.config();
module.exports = {
  NODE_ENV: process.env.NODE_ENV,
  SERVER_SECRET_KEY: process.env.SERVER_SECRET_KEY,
  PORT: process.env.PORT
};