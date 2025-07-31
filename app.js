const express = require('express');
const path = require('path');

const app = express();

// Set view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

module.exports = app;
