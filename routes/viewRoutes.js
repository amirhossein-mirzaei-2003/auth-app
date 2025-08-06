const express = require('express');
const viewController = require('./../controllers/viewController');
const authController = require('./../controllers/authcontroller');

const router = express.Router();

// check there is a loged in user
router.use(authController.isLogedIn);

router.get('/', viewController.getHome);
router.get('/signup', viewController.getSignup);
router.get('/login', viewController.getLogin);
router.get('/verificationCode', viewController.getVerificationCode);
router.get('/forgotPassword', viewController.getForgotPassword);
router.get('/resetPassword/:token', viewController.getResetPassword);

module.exports = router;
