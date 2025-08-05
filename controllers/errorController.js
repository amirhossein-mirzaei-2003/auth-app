const AppError = require('../utils/appError');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // programing error or unknown error: don't leak info
  if (!err.isOperational) {
    res.status(500).json({
      status: 'error',
      message: 'something went wery wrong!',
    });
  }

  // operational error
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

const handleCastError = (err) => {
  message = `invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldError = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/);
  const message = `Duplicate field value: ${value}. please use another one!`;
  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `invalid input data. ${errors.join('. ')}`;

  return new AppError(message, 400);
};

const handleJsonWebTokenError = () => {
  return new AppError('invalid token. please log in again!', 401);
};

const handkeTokenExpiredError = () => {
  return new AppError('token have been expired. please log in again!', 401);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  }

  if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    error.name = err.name;
    error.errmsg = err.errmsg;
    error.code = err.code;

    if (error.name === 'CastError') error = handleCastError(error);
    if (error.code === 11000) error = handleDuplicateFieldError(error);
    if (error.name === 'ValidationError') error = handleValidationError(error);
    if (error.name === 'JsonWebTokenError') error = handleJsonWebTokenError();
    if (error.name === 'TokenExpiredError') error = handkeTokenExpiredError();

    sendErrorProd(error, res);
  }
};
