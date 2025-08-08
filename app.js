const express = require('express');
const path = require('path');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const errorController = require('./controllers/errorController');
const viewRoutes = require('./routes/viewRoutes');
const userRoutes = require('./routes/userRoutes');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const app = express();
app.set('trust proxy', 1);

// Set view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// set limit for amout of request of same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'too many request please try again one hour later',
});
app.use('/api', limiter);

// set scurity HTTP headers
if (process.env.NODE_ENV === 'production') {
  app.use(helmet());
}

// body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// data sanitization against NoSQL query injection
app.use(mongoSanitize());

//data sanitization against XSS
app.use(xss());

// development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(compression());
//========================================== routes

app.use('/', viewRoutes);
app.use('/api/v1/users', userRoutes);

app.all('*', (req, res, next) => {
  next(new AppError(`can not find ${req.originalUrl} on this server!`, 404));
});

app.use(errorController);

module.exports = app;
