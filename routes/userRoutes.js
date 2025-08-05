const express = require('express');
const authController = require('./../controllers/authcontroller');

const router = express.Router();

router.post('/signup', authController.signupPending);
router.post('/signup/verify', authController.signUpVerify);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

module.exports = router;
