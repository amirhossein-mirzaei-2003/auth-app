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
