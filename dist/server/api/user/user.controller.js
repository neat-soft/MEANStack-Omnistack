'use strict';

var User = require('./user.model');
var BetaKey = require('../betaKey/betaKey.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var fs = require('fs');
var wordListPath = require('word-list');
var Blockuser = require('../blockuser/blockuser.model');
var Exam = require('../exam/exam.model');
var _ = require('lodash');
var emailService = require('../email/email.controller');
var Settings = require('../settings/settings.model');
var UserAnalytic = require('../userAnalytic/userAnalytic.controller');
var async = require('async');
var validationError = function (res, err) {
  return res.status(422).json(err);
};
var genNewPassword = function () {
  var wordArray = fs.readFileSync(wordListPath, 'utf8').split('\n');
  var pass = "";
  for (var i = 0; i < 2; i++) {
    var num = Math.random() * wordArray.length;
    num = Math.floor(num);
    var wordToAdd = wordArray[num]
    wordToAdd = wordToAdd.charAt(0).toUpperCase() + wordToAdd.slice(1)
    pass = pass + wordToAdd;
  }
  var numToAdd = Math.floor(Math.random() * 1000)
  numToAdd = numToAdd.toString();
  numToAdd = '0' * (3 - numToAdd.length) + numToAdd;
  pass = pass + numToAdd;
  return pass;
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function (req, res) {
  User.find({}, '-salt -hashedPassword', function (err, users) {
    if (err) return res.send(500, err);
    res.status(200).json(users);
  });
};

/**
 * Checks to see if user exists. Takes email address as input string
 */
exports.exists = function (req, res, next) {
  User.findOne({
    email: req.body.email
  }, function (err, user) {
    if (err) return next(err);
    if (!user) return res.json(false);
    res.json(true);
  });
}

/**
  * Allows user to set their own academic role if currently unset.
  */
exports.giveUserAcademicRole = function(req, res) {
  User.findById(req.user._id, function(err, user) {
    if (err) { return res.send(500, err); }
    if (!user) { return res.send(404, 'User not found.'); }
    if (user.academicRole) { return res.send(403, 'Your academic role has already been set.') }
    if (["Student", "Teacher"].indexOf(req.body.academicRole) > -1) {
      user.academicRole = req.body.academicRole;
      user.save(function(err, user) {
        if (err) { return res.send(500, err); }
        return res.send(user);
      });
    } else {
      return res.send(403, 'Invalid academic role.');
    }
  })
}
var createUserKey = function(user, cb) {
  var email = user.email;
  if (!email) {
    return cb("Email invalid.");
  }
  var betaKey = new BetaKey();
  betaKey.name = email;
  betaKey.expires = new Date(Date.now() + 1000*60*60*24*365.25*100);
  betaKey.approved = true;
  betaKey.massKey = true;

  betaKey.save(function(err, betaKey) {
    if (err) {
      return cb(err);
    }
    //Update referral key (if exists)
    BetaKey.findOneAndUpdate({"name": user.referral.referrer}, { $inc: {"numClaimed": 1}}, function(err) {
      if (err) {
        return cb(err);
      }
      //Update owner of referral key
      User.findOneAndUpdate({"email": user.referral.referrer}, { $push: { "referral.usersReferred": email }, $inc: {"referral.usersReferredCount": 1}}, function(err) {
        if (err) {return cb(err);}

        //Deal with connection level
        if(user.referral.connectionLevel !== -1) {
          //No referral code. (Happens for seeded accounts)
          return cb();
        }
        var connectionLevel = 0;
        if(user.referral.referrer === undefined) {
          //Organic User
          connectionLevel = 3;
          User.update({"email": email}, { "referral.connectionLevel": connectionLevel }, function () {
            return cb();
          });
        } else if (user.referral.referrer.indexOf("@") === -1){
          //Got here with a Top level beta key. Connection level is 1, and they get a free subject.
          connectionLevel = 1;
          User.update({"email": email}, { "referral.connectionLevel": connectionLevel, "numFreeSubjects": 1 }, function () {
            return cb();
          });
        } else if(user.referral.referrer.indexOf("@") > -1) {
          //Got here with an invite from another user
          User.findOne({"email": user.referral.referrer}, function (err, retUser) {
            //Increment referrer's discount if applicable
            if (!retUser) {
              return cb('No user found with that email.');
            }
            if (retUser.discountPercent < 0.5) {
              var increment = 0.05
              //Top Level referrers get 5x bonus.
              if (retUser.referral.connectionLevel === 1) {
                increment *= 5;
              }
              User.update({"email": retUser.email}, {$inc: {"discountPercent": increment}}, function(err) {
                if (err) {
                  console.log(err);
                }
              });
            }
            if (err) return cb(err);
            //Rest of code used to update new user (not referrer)
            connectionLevel = retUser.referral.connectionLevel + 1;
            var discountPercent = 0;
            var numFreeSubjects = 0;
            //If user is top level, they get a free subject
            if (connectionLevel === 1) {
              discountPercent = 0;
              numFreeSubjects = 1;
            }
            if (connectionLevel === 2) {
              discountPercent = 0.25;
            }
            else if (connectionLevel > 2) {
              discountPercent = 0.05;
            }
            User.update({"email": email}, { "referral.connectionLevel": connectionLevel, "discountPercent": discountPercent, "numFreeSubjects": numFreeSubjects }, function () {
              return cb();
            });
          });
        }
      });
    });
  });
};

var createUser = function(user, cb) {
  var newUser = new User(user);
  newUser.save(function(err, savedUser) {
    if (err) return cb(err, savedUser)
    createUserKey(savedUser, function(err) {
      if (err) {
        savedUser.remove();
        return cb(err, savedUser);
      }
      else {
        // send welcome email
        var userData = {
          name: savedUser.name,
          email: savedUser.email,
          role: savedUser.academicRole
        };

        // import to AC
        emailService.addToActiveCampaign(userData, function(response) {
          return;
        });

        return cb(false, savedUser);
      }
    });
  });
};

exports.createUser = createUser;

/**
 * Creates a new user (from signup page)
 */
exports.create = function (req, res, next) {
  var userInfo = req.body;
  userInfo.lastLogin = new Date(Date.now());
  createUser(userInfo, function(err, user) {
    if (err) return validationError(res, err);
    var token = jwt.sign({_id: user._id}, config.secrets.session, {expiresIn: 60 * 60 * 5});
    res.json({token: token});
  });
};

exports.createUserKey = createUserKey;
/**
 * Creates a paid user. Inputs: 1) email address and 2) list of subjects
 */
exports.createPaidAccount = function (req, res, next) {
  var email = req.body.email;
  var pass = genNewPassword();
  var subjects = req.body.subjects || [];
  // Eventually email this password to the newly created account. In the meantime, log it to the console
  console.log(pass);
  var name = email.substr(0, email.indexOf('@') || email.length);
  var userInfo = {
    email: email,
    password: pass,
    name: name,
    subjects: subjects,
    dateCreated: Date.now(),
    provider: 'purchaser',
    role: 'customer'
  };
  createUser(userInfo, function(err, user) {
    if (err) return validationError(res, err);
    return res.json(user);
  });
};

/**
 * Get Account Stats
 */
exports.getAccountsSince = function (req, res, next) {
  Settings.findOne({'name': 'accountTrackerDate'}, function(err, settings) {
    if (err) { return validationError(res, err); }
    var resetDate;
    if (!settings) {
      resetDate = new Date(Date.now() - 1000*60*60*24*7);
    }
    else {
      resetDate = settings.info.date;
    }
    var resetMS = Date.parse(resetDate);
    var diff = Date.now() - Date.parse(resetDate);
    var days = Math.floor(diff / (1000.0 * 60.0 * 60.0 * 24.0));
    User.find({"dateCreated": {"$gte": resetDate}}, "_id", function (err, users) {
      if (err) {
        console.log("Error:" + err);
      }
      res.json({numUsers: users.length, daysSince: days});
    });
  });
}

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.send(401);
    res.json(user.profile);
  });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function (req, res) {
  User.findByIdAndRemove(req.params.id, function (err, user) {
    if (err) return res.send(500, err);
    return res.send(204);
  });
};

/**
 * Change a users role
 * restriction: 'admin'
 */
exports.changeRole = function (req, res, next) {
  var userId = String(req.body.id);
  var newRole = String(req.body.newRole);
  User.findById(userId, function (err, user) {
    user.role = newRole;
    user.save(function (err) {
      if (err) return res.send(500, err);
      res.send(200);
    });
  });
};

/**
 * Change a users password
 */
exports.changePassword = function (req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);
  User.findById(userId, function (err, user) {
    if (user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function (err) {
        if (err) return validationError(res, err);
        res.send(200);
      });
    } else {
      res.send(403);
    }
  });
};

exports.updateUser = function(req, res, next) {
  var userId = req.user._id;
  var newName = String(req.body.userName.$modelValue);
  var newEmail = String(req.body.email.$modelValue).toLowerCase();
  User.findById(userId, function(err, user) {
    //Check to see if anything changed
    if (user.name !== newName || user.email !== newEmail) {
      if (user.email !== newEmail) {
        //Trying to update email. Validate email not in use:
        User.find({"email": newEmail}, function(err, users) {
          if (err) {
            return validationError(res, err);
          }
          if (users.length > 0) {
            return validationError(res, "Email in use.");
          }
          else {
            //No user with new email: Update user accordingly.
            var oldEmail = user.email;
            user.email = newEmail;
            //Track name change, if any
            if (user.name !== newName) {
              if (user.nameChanged) {
                return validationError(res, "Name already changed!");
              }
              user.name = newName;
              user.nameChanged = true;
            }
            user.save(function(err, newUser) {
              if (err) {
                return validationError(res, err);
              }
              //Now update Beta key of user
              BetaKey.findOne({"name": oldEmail}, function(err, betaKey) {
                if (err) {
                  //Error updating beta key
                  user.email = oldEmail;
                  user.save();
                  return validationError(res, err);
                }
                else if (!betaKey) {
                  user.email = oldEmail;
                  user.save();
                  return validationError(res, "No beta key to update.");
                }
                betaKey.name = newEmail;
                betaKey.save(function(err, savedKey) {
                  if (err) {
                    user.email = oldEmail;
                    user.save();
                    return validationError(res, err);
                  }
                  res.send(200);
                  // New info is valid. Change AC email
                  emailService.findAndUpdate(oldEmail, newUser, function (err, result) {
                    if (err) {
                      console.log(err);
                      console.log(result);
                      return validationError(res, err);
                    }
                  });
                });
              });
            });
          }
        });
      }
      else {
        //Make sure name hasn't been changed already
        if (user.nameChanged) {
          return validationError(res, "Name already changed!");
        }

        //Just updating name. No biggie.
        user.name = newName
        user.nameChanged = true;
        user.save(function(err, newUser) {
          if (err) {
            return validationError(res, err);
          }
          res.send(200);
        });
      }
    }
    else {
      //Nothing changed.
      res.send(304);
    }
  });
};
/**
 * Get my info
 */
exports.me = function (req, res, next) {
  var userId = req.user._id;

  //check for and delete expired subjects from user
  User.findOneAndUpdate({
    _id: userId
  }, { // don't ever give out the password or salt
    $pull: {subjects: {expires: {$lt: new Date(Date.now())}}}
  }, function (err, user) {
    if (err) return next(err);
    if (!user) return res.json(401);

    user.salt = null;
    user.hashedPassword = null;

    res.json(user);
  });
};

/**
 * Authentication callback
 */
exports.authCallback = function (req, res, next) {
  res.redirect('/');
};

/**
 * Return list of roles from config files
 */
exports.giveRoles = function (req, res, next) {
  res.status(200).json(config.userRoles);
};


//Got from Stack Exchange - filters list of duplicates
var getUniques = function (a) {
  var seen = {};
  return a.filter(function (item) {
    return seen.hasOwnProperty(item) ? false : (seen[item] = true);
  });
}

/**
 * Add a subject to a user
 */
exports.addSubjects = function(req, res, next) {
  var userId = req.user._id;
  var subjects = req.body.subjects;
  var roles = config.userRoles;
  var validSubjects = config.subjects;

  //Check validity of subject(s)
  for (var i = 0; i < subjects.length; i++) {
    if (validSubjects.indexOf(subjects[i]) === -1) {
      return validationError(res, 'Invalid Subject: \'' + subjects[i] + '\'');
    }
  }

  // Add/update expiration the subject(s)
  User.findById(userId, function(err, user) {
    for (var i = 0; i < subjects.length; i++) {

      var result = user.subjects.filter(function( subject ) {
        return subject.subjectName === subjects[i];
      });

      if (result.length > 0) {
        res.set({ 'existingSubjects': user.subjects });
        return validationError(res, 'Subject already owned');
      }

      user.subjects.push({ subjectName: subjects[i]});
      if (user.numFreeSubjects > 1) {
        user.numFreeSubjects -= 1;
      } else {
        user.numFreeSubjects = 0;
      }

      if (user.academicRole === 'Teacher') {
        // See if teacher has subject in subjectsTaught
        var hasAlready = false;
        for (var j = 0; j < user.subjectsTaught.length; j++) {
          if (user.subjectsTaught[j].subjectName === subjects[i]) {
            hasAlready = true;
          }
        }
        if (!hasAlready) {
          user.subjectsTaught.push({subjectName: subjects[i]})
        }
      }
    }

    if (roles.indexOf(user.role) < roles.indexOf('customer')) {
      user.role = 'customer';
    }

    user.save(function(err) {
      if (err) return validationError(res, err);
      res.send(200);
    });
  });
};

//  Update OmniPoints
exports.updateOmniPoints = function (req, res, next) {
  var userId = req.params.id;
  var points = parseFloat(req.body.points);
  User.findById(userId, function (err, user) {
    user.omnipoints = user.omnipoints + (points);
    user.save(function (err) {
      if (err) return validationError(res, err);
      res.send(200);
    });
  });
};

//  Update OmniPoints by Email
exports.updateOmniPointsByEmail = function (req, res, next) {
  var email = req.body.email;
  var points = parseFloat(req.body.points);
  var downvoted=false;
  if(typeof req.body.downvoted !=='undefined'){
    downvoted= req.body.downvoted;
  }
  User.findOne({email: email}, function (err, user) {
    user.omnipoints = user.omnipoints + (points);
    if (points === 0 && !downvoted) {
      ++user.downvotes;
    }else if(points === 0 && downvoted){
      --user.downvotes;
    }
    if(user.downvotes<0){
      user.downvotes=0;
    }
    if (user.downvotes >= 3) {
      user.downvotes = 0;
      var blockUser = {email: email, type: 1, message: req.body.message, name: req.body.name, timestamp:req.body.timestamp};
      Blockuser.find({email:email})
        .count()
        .exec(function (err, count) {
          if(err) { return validationError(res, err); }
          if(count<=0) {
            Blockuser.create(blockUser, function(err, block) {
              if(err) { return validationError(res, err); }
              if (user.omnipoints < 0) {
                user.omnipoints = 0;
              }
              user.save(function (err) {
                if (err) return validationError(res, err);
                res.send(200);
              });
            });
          }
        });
    } else {
      if (user.omnipoints < 0) {
        user.omnipoints = 0;
      }
      user.save(function (err) {
        if (err) return validationError(res, err);
        res.send(200);
      });
    }
  });
};


//  Update Exams Stats
exports.updateExamStats = function (req, res, next) {
  var email = req.body.email;
  var score = parseFloat(req.body.score);
  var examId = req.body.examId;
  var attempts = 0;
  User.findOne({email: email}, function (err, user) {
    if (err) {
      return validationError(res, err);
    }
    var exam = {};
    if (!user) return res.json(404);
    if (!user.exams.length) {
      exam = {examId: examId, score: score, attempts: ++attempts};
      user.exams.push(exam);
      user.save(function (err) {
        if (err) {
          return validationError(res, err);
        }
        UserAnalytic.create(req, res);
      });
    } else {
      User.findOne({'email': email, 'exams.examId': examId}, function (err, exam) {
        if (err) {
          return validationError(res, err);
        }
        if (!exam) {
          exam = {examId: examId, score: score, attempts: ++attempts};
          user.exams.push(exam);
          user.save(function (err) {
            if (err) {
              return validationError(res, err);
            }
            UserAnalytic.create(req, res);
          });
        } else {
          for (var i = 0; i < exam.exams.length; ++i) {
            if (exam.exams[i]['examId'] == examId) {
              attempts = parseInt(exam.exams[i]['attempts']);
              score = score > (exam.exams[i]['score']) ? score : exam.exams[i]['score'];
              User.update({'email': email, 'exams.examId': examId}, {
                $set: {
                  'exams.$.score': score,
                  'exams.$.attempts': ++attempts
                }
              }, function (err, numAffected) {
                UserAnalytic.create(req, res);
              });
              break;
            }
          }
        }
      });
    }
  });
};


//Get Exams List
exports.getExamsList = function (req, res, next) {
  var userId = req.params.id;
  User.findById(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.send(401);
    var allExams = {};
    allExams.freeExams = {};
    allExams.premiumExams = {};
    //return res.status(200).json({});
    Exam.find({}, 'subject _id examNumber', function (err, exams) {
      if (err) return next(err);
      /**
      var returnedExams = {};
      //Testing some code for replacing this function:
      for (var i = 0; i < exams.length; i++) {
        var examId = exams[i]._id.str;
        //build exam object
        var tempExam = {
          examId: exams[i]._id,
          examNumber: exams[j].examNumber,
          subjectName: exams[i].subject
        };
        //see if user has taken exam already
        if (examId in user.exams) {
          tempExam.stats = user.exams[examId];
        }
        var isPremium = false;
        //check to see if user has exam's subject
        if (tempExam.subject in user.subjects) {
          if (user.subjects[tempExam.subject].expires > Date.now()) {
            isPremium = true;
          }
        }
        //If user has access to exam, pass it in
        if (isPremium || tempExam.examNumber === 0) {
          if (tempExam.subject in returnedExams) {
            returnedExams[tempExam.subject].push(tempExam);
          }
          else {
            returnedExams[tempExam.subject] = [tempExam];
          }
        }
      }
      //return exams
      return res.status(200).json(returnedExams);
      */
      for (var j = 0; j < exams.length; ++j) {
        for (var i = 0; i < user.subjects.length; ++i) {
          if (user.subjects[i].subjectName === exams[j].subject) {
            if (typeof allExams.premiumExams[user.subjects[i].subjectName] === 'undefined') {
              allExams.premiumExams[user.subjects[i].subjectName] = [];
            }
            var premiumExamStats = {};
            for (var l = 0; l < user.exams.length; ++l) {
              // Need this == as is. DO NOT CHANGE.
              if (user.exams[l].examId == exams[j]._id) {
                premiumExamStats = user.exams[l];
              }
            }
            allExams.premiumExams[user.subjects[i].subjectName].push({
              examId: exams[j]._id,
              examNumber: exams[j].examNumber,
              subjectName: user.subjects[i].subjectName,
              expires: user.subjects[i].expires,
              stats: premiumExamStats
            });
          }
        }

        if (exams[j].examNumber === 0 && typeof allExams.premiumExams[exams[j].subject] === 'undefined') {
          if (typeof allExams.freeExams[exams[j].subject] === 'undefined') {
            allExams.freeExams[exams[j].subject] = [];
          }
          var freeExamStats = {};
          for (var m = 0; m < user.exams.length; ++m) {
            if (user.exams[m].examId == exams[j]._id) {
              freeExamStats = user.exams[m];
            }
          }
          allExams.freeExams[exams[j].subject].push({
            examId: exams[j]._id,
            examNumber: exams[j].examNumber,
            subjectName: exams[j].subject,
            expires: 0,
            stats: freeExamStats
          });
        }
      }
      return res.status(200).json(allExams);
    });
  });
};

//  Update SubjectsTaught
exports.updateSubjectsTaught = function (req, res, next) {
  var userId = req.params.id;
  var subjectsTaught = JSON.parse(req.body.subjectsTaught);
  User.findById(userId, function (err, user) {
    user.subjectsTaught = subjectsTaught;
    user.save(function (err) {
      if (err) return validationError(res, err);
      res.send(200);
    });
  });
};

//Get Students
exports.getStudents = function (req, res, next) {
  var limit = parseInt(req.params.limit);
  var page = parseInt(req.params.page) - 1;
  var subject = req.params.subject;
  var query ={};

  if (typeof(req.params.name) !== 'undefined') {
    var name = (req.params.name).replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"); //escape RegExp
  }

  var skip = (limit * page);
  if (req.user.role === 'admin') {
    query = {'academicRole': 'Student', 'subjects.subjectName': subject};
    if (typeof(name) !== 'undefined' && name !== '') {
      query = {'academicRole': 'Student','subjects.subjectName': subject, name: new RegExp(name, 'i') };
    }
  } else if (req.user.academicRole === 'Teacher') {
    query = {'referral.referrer': req.user.email, 'subjects.subjectName': subject};
    if (typeof(name) !== 'undefined' && name !== '') {
      query = {'referral.referrer': req.user.email, 'subjects.subjectName': subject, name: new RegExp(name, 'i') };
    }
  }

  User.find(query).count().exec(function (err, count) {
    if (err) {
      return res.send(500, err);
    }
    User.find(query, '-salt -hashedPassword')
      .limit(limit)
      .skip((skip > 0) ? skip : 0)
      .sort({dateCreated: 1})
      .exec(function (err, users) {
        if (err) return res.send(500, err);
        var exams = [];
        async.forEach(users, function (user, callback1) {
          var userCounter = 0;
          async.forEach(user.exams, function (exam, callback2) {
            var examCounter = 0;
            Exam.findById(exam.examId, 'subject').exec(function (err, examDetails) {
              if (err) return res.send(500, err);
              exams.push({_id: examDetails._id, subject: examDetails.subject});
              examCounter++;
              callback2();
            });
          }, function (err) {
            if (err) {
              return res.send(500, err);
            } else {
              callback1();
            }
          });
        }, function (err) {
          if (err) {
            return res.send(500, err);
          } else {
            res.status(200).json({count: count, users: users, examDetails: exams});
          }
        });
      });
  });
};
