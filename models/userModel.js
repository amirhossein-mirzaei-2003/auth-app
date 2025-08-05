const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = mongoose.Schema({
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
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'password is required'],
    minLength: [8, 'password must be more than 8 charactor'],
    maxLength: [40, 'password must be less than 40 charactor'],
    select: false,
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
  passwordChangedAt: Date,
  passwordResetToken: String,
  resetTokenExpires: Date,
});

// ==================================== document middleware

userSchema.pre('save', async function (next) {
  // 1) do noting if password not modified
  if (!this.isModified('password')) return next();

  // 2) hash password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // 3) delete confirm password
  this.passwordConfirm = undefined;

  // 4) set passwordChangedAt
  this.passwordChangedAt = Date.now();
  -1000;

  next();
});

// ==================================== methods

userSchema.methods.comparePassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.passwordChangedAfter = function (jwtTimestamp) {
  const passwordChangedAtTimestamp = parseInt(
    this.passwordChangedAt.getTime() / 1000,
    10
  );
  return passwordChangedAtTimestamp > jwtTimestamp;
};

userSchema.methods.createPasswordResetToken = function () {
  // 1) create token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // 2) save hash version in DB
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // 3) set expires time to 10 min in DB
  this.resetTokenExpires = Date.now() + 10 * 60 * 1000;

  console.log(resetToken, this.passwordResetToken);
  // 4) return non hash version
  return resetToken;
};
// ==================================== instantce and exports

const User = mongoose.model('User', userSchema);

module.exports = User;
