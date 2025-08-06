exports.getHome = (req, res, next) => {
  res.status(200).render('home', {
    title: 'home page',
  });
};

exports.getSignup = (req, res, next) => {
  res.status(200).render('signup', {
    title: 'signup',
  });
};

exports.getLogin = (req, res, next) => {
  res.status(200).render('login', {
    title: 'login',
  });
};

exports.getVerificationCode = (req, res, next) => {
  res.status(200).render('verify', {
    title: 'verification code',
  });
};

exports.getForgotPassword = (req, res, next) => {
  res.status(200).render('forgotPassword', {
    title: 'forgot password',
  });
};

exports.getResetPassword = (req, res, next) => {
  res.status(200).render('resetPassword', {
    title: 'reset password',
  });
};
