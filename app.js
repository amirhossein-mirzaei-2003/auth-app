const express = require('express');
const path = require('path');
const AppError = require('./utils/appError');
const errorController = require('./controllers/errorController');
const viewRoutes = require('./routes/viewRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Set view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes

app.use('/', viewRoutes);
app.use('/api/users', userRoutes);

app.all('*', (req, res, next) => {
  next(new AppError(`can not find ${req.originalUrl} on this server!`, 404));
});

app.use(errorController);

module.exports = app;
