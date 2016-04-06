'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var authTypes = ['github', 'twitter', 'facebook', 'google', 'edmodo'];

var SubjectSchema = new Schema({
  subjectName: {
    type: String,
    required: true
  },
  expires: {
    type: Date,
    default: function() {
      var expirationDate = new Date(Date.now());
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);
      return expirationDate;
    }
  }
});

var SubjectTaughtSchema = new Schema({
  subjectName: {
    type: String,
    required: true
  }
});

var ExamStatsSchema = new Schema({
  examId: String,
  score: Number,
  attempts: Number
});

var UserSchema = new Schema({
  name: String,
  email: {type: String, lowercase: true, required: true, unique: true},
  role: {
    type: String,
    default: 'user'
  },
  academicRole: {
    type: String
  },
  nameChanged: {
    type: Boolean,
    default: false
  },
  hashedPassword: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  provider: {
    type: String,
    default: 'local'
  },
  salt: String,
  period: String,
  facebook: {},
  google: {},
  edmodo: {},
  subjects: [SubjectSchema],
  subjectsTaught: [SubjectTaughtSchema],
  lastLogin: {
    type: Date,
    default: null
  },
  omnipoints: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  exams:[ExamStatsSchema],
  dateCreated: {
    type: Date,
    default: function() {
      return new Date(Date.now())
    }
  },
  referral: {
    referrer: String, // representing an invitation code / beta key or a referrer's email address
    connectionLevel: {
      type: Number,
      default: -1
    }, // a positive Int representing a user's connection level* to the admin
    usersReferred: [], // [array of email addresses],
    usersReferredCount: {
      type: Number,
      default: 0
    }
  },
  numFreeSubjects: {
    type: Number,
    default: 0
  },
  discountPercent: {
    type: Number,
    default: 0
  }
});

/**
 * Virtuals
 */
UserSchema
  .virtual('password')
  .set(function (password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

// Public profile information
UserSchema
  .virtual('profile')
  .get(function () {
    return {
      'name': this.name,
      'role': this.role
    };
  });

// Non-sensitive info we'll be putting in the token
UserSchema
  .virtual('token')
  .get(function () {
    return {
      '_id': this._id,
      'role': this.role
    };
  });

/**
 * Validations
 */

// Validate empty email
UserSchema
  .path('email')
  .validate(function (email) {
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return email.length;
  }, 'Email cannot be blank');

// Validate empty password
UserSchema
  .path('hashedPassword')
  .validate(function (hashedPassword) {
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return hashedPassword.length;
  }, 'Password cannot be blank');

// Validate email is not taken
UserSchema
  .path('email')
  .validate(function (value, respond) {
    var self = this;
    this.constructor.findOne({email: value}, function (err, user) {
      if (err) throw err;
      if (user) {
        if (self.id === user.id) return respond(true);
        return respond(false);
      }
      respond(true);
    });
  }, 'The specified email address is already in use.');

var validatePresenceOf = function (value) {
  return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema
  .pre('save', function (next) {
    if (!this.isNew) return next();

    if (!validatePresenceOf(this.hashedPassword) && authTypes.indexOf(this.provider) === -1)
      next(new Error('Invalid password'));
    else
      next();
  });

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function () {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword: function (password) {
    if (!password || !this.salt) return '';
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  }
};

module.exports = mongoose.model('User', UserSchema);
