const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const pendingUserSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'name is required'],
    trim: true,
    minLength: [3, 'name must be more than 2 charactor'],
    maxLength: [30, 'name must be less than 30 charactor'],
  },
  email: {
    type: String,
    required: [true, 'email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'password is required'],
    minLength: [8, 'password must be more than 8 charactor'],
    maxLength: [40, 'password must be less than 40 charactor'],
  },
  passwordConfirm: {
    type: String,
    required: [true, 'confirm password is required'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'confirm password does not match',
    },
  },
  verificationCode: String,
  verificationCodeExpires: Date,
});

const PendingUser = mongoose.model('PendingUser', pendingUserSchema);

module.exports = PendingUser;
