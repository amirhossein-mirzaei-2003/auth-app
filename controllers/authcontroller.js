const User = require('../models/userModel');
const PendingUser = require('../models/pendingUserModel');
const cachAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const { promisify } = require('util');
const Email = require('./../utils/email');
const catchAsync = require('./../utils/catchAsync');
const crypto = require('crypto');

// helper

const tokenSign = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = tokenSign(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: 'lax',
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signupPending = cachAsync(async (req, res, next) => {
  // 0) Clean up expired pending users
  await PendingUser.deleteMany({
    email: req.body.email,
    verificationCodeExpires: { $lt: Date.now() },
  });
  // 1) check if email  exist already
  const user = await User.findOne({ email: req.body.email });
  if (user) return next(new AppError('email exists already', 400));
  // 1) generate verification code
  const code = crypto.randomInt(100000, 1000000).toString();
  const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

  // 2) create pendingUser
  const pendingUser = await PendingUser.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    verificationCode: hashedCode,
    verificationCodeExpires: Date.now() + 5 * 60 * 1000,
  });

  // 3) send email

  try {
    await new Email(pendingUser, 'url', code).sendVerificationCode();
  } catch (err) {
    await PendingUser.findByIdAndDelete(pendingUser._id);
    next(err);
  }

  // 3) create and send token

  createSendToken(pendingUser, 200, res);
});
exports.signUpVerify = cachAsync(async (req, res, next) => {
  // 1) get pending user by token
  let token = req.cookies.jwt;
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const pendingUser = await PendingUser.findById(decoded.id);
  if (!pendingUser) return next(new AppError('token is not valid', 401));

  // 2) verify code
  const code = req.body.code;
  const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

  if (Date.now() > pendingUser.verificationCodeExpires.getTime()) {
    await PendingUser.findByIdAndDelete(pendingUser._id);
    return next(new AppError('code is expired. please try again!', 401));
  }

  if (pendingUser.verificationCode !== hashedCode)
    return next(new AppError('code is not correct. please try again!', 401));
  // 3) create user in DB
  const user = await User.create({
    name: pendingUser.name,
    role: 'user',
    email: pendingUser.email,
    password: pendingUser.password,
    passwordConfirm: pendingUser.passwordConfirm,
  });

  // 4) delete pendingUser

  await PendingUser.findByIdAndDelete(pendingUser._id);

  // 5) send welcome email

  await new Email(user, 'url').sendWelcome();

  // 6) create and send token

  createSendToken(user, 200, res);
});

exports.login = cachAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) check there is email and password
  if (!email || !password)
    return next(new AppError('please provide email and password', 400));

  // 2) check email and password are valid
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password, user.password)))
    return next(new AppError('email or password is incorrect', 401));

  // 3) create jwt
  createSendToken(user, 200, res);
});

exports.isLogedIn = async (req, res, next) => {
  // 1) check token exist in client
  if (req.cookies.jwt) {
    try {
      // 2) verify token;
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 3) check user with this token still exists
      const user = await User.findOne({ _id: decoded.id });

      if (!user) {
        return next();
      }

      // 4) check if user changed the password after
      if (user.passwordChangedAfter(decoded.iat)) {
        return next();
      }

      // there is a loged in user, send it to template
      res.locals.user = user;
      return next();
    } catch (err) {
      return next();
    }
  }

  next();
};

exports.protect = cachAsync(async (req, res, next) => {
  let token;
  // 1) check if there is a token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token)
    return next(
      new AppError('you are not loged in. please log in first!', 401)
    );

  // 2) verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) check if user with this token still exists
  const user = await User.findById(decoded.id);
  if (!user)
    return next(
      new AppError('user that belong to this token does not exist anymore', 401)
    );

  // 4) check if user change password after token created
  if (user.passwordChangedAfter(decoded.iat)) {
    return next(
      new AppError('user recently changed password. please log in again!', 401)
    );
  }

  // 5) if everything ok set req and call next
  req.user = user;
  res.locals.user = user;

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('you do not have permission to perform this action', 403)
      );
    }

    return next();
  };
};

exports.forgotPassword = cachAsync(async (req, res, next) => {
  // 1) check if there is a email
  if (!req.body.email)
    return next(new AppError('please provide your email', 400));

  // 2) check email is valid
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError('email is not correct', 400));

  // 3) create reset password token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 4) send email
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  try {
    await new Email(user, resetUrl).sendResetPassword();
  } catch (err) {
    console.log(err);

    user.passwordResetToken = undefined;
    user.resetTokenExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'something went wrong in sending email. please try again later!',
        500
      )
    );
  }

  // 5) send response

  res.status(200).json({
    status: 'success',
    message: 'email sent successfully!',
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) get user by token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({ passwordResetToken: hashedToken });
  if (!user) return next(new AppError('token is not valid', 401));

  // 2) check if token is expires
  if (Date.now() > user.resetTokenExpires.getTime())
    return next(
      new AppError('token have been expired. please try again!', 401)
    );

  // 3) set new password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  user.passwordResetToken = undefined;
  user.resetTokenExpires = undefined;

  await user.save();

  // 4) create JWT
  createSendToken(user, 200, res);
});
