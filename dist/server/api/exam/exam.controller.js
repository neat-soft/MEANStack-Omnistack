'use strict';

var _ = require('lodash');
var Exam = require('./exam.model');
var Question = require('../question/question.model');

function addNotification(data, next) {
  Exam.emit('addNotification', data);
  if (typeof next == 'function') {
    next();
  }
}

function removeNotification(data, next) {
  Exam.emit('removeNotification', data);
  if (typeof next == 'function') {
    next();
  }
}

// Get list of exams
exports.index = function (req, res) {
  Exam.find(function (err, exams) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(exams);
  });
};

// Get a single exam
exports.show = function (req, res) {
  Exam.findById(req.params.id, function (err, exam) {
    if(err) { return handleError(res, err); }
    if(!exam) { return res.send(404); }
    Question.find({_id: {$in: exam.section1.part1.questionIds}}, function (err, questions) {
      if (err) {
        console.log(err);
        return handleError(res, err);
      }
      exam.section1.part1.fullQuestions = questions;
      Question.find({_id: {$in: exam.section1.part2.questionIds}}, function (err, questions) {
        if (err) {
          console.log(err);
          return handleError(res, err);
        }
        exam.section1.part2.fullQuestions = questions;
        return res.status(200).json(exam);
      })
    })
  });
};

// Creates a new exam in the DB.
exports.create = function (req, res) {
  Exam.create(req.body, function (err, exam) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(exam);
  });
};

// Updates an existing exam in the DB.
exports.update = function (req, res) {
  if(req.body._id) { delete req.body._id; }
  Exam.findById(req.params.id, function (err, exam) {
    if (err) { return handleError(res, err); }
    if(!exam) { return res.send(404); }
    var updated = _.merge(exam, req.body, function (a, b) {
      if (_.isArray(a)) {
        return b;
      }
    });
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(exam);
    });
  });
};


// TODO Updates an existing exam counters in the DB.
exports.updateAnsweredCounters = function (req, res) {
  Exam.findById(req.params.id, function (err, exam) {
    var ids = JSON.parse(req.body.ids);
    if(err) { return handleError(res, err); }
    if(!exam) { return res.send(404); }
    if (ids.length) {
      for (var i = 0; i < ids.length; ++i) {
        Exam.find({'section1.part1.questions.$._id': ids[i]}, function (err, question) {
          if(err) { return handleError(res, err); }
          if(!question) { return res.send(404); }
        });
      }
    }
    return res.json(exam);
  });
};


// Get Exam by subject, examnumber and partnumber
exports.getExam = function (req, res) {
  var canHas = false;
  for (var i = 0; i < req.user.subjects.length; i++) {
    if (req.user.subjects[i].subjectName === req.params.subject) {
      canHas = true;
    }
  }

  if (!canHas) {
    if (req.params.exam !== '0') {
      // User's can't access exams they can't access.
      return res.send(403, 'You do not have access to this exam.');
    }
  }

  Exam.findOne({examNumber: req.params.exam, subject: req.params.subject})
    .exec(function (err, exam) {
      if(err) { return handleError(res, err); }
      Question.find({_id: {$in: exam.section1.part1.questionIds}}, function (err, questions) {
        if (err) {
          console.log(err);
          return handleError(res, err);
        }
        exam.section1.part1.fullQuestions = questions;
        Question.find({_id: {$in: exam.section1.part2.questionIds}}, function (err, questions) {
          if (err) {
            console.log(err);
            return handleError(res, err);
          }
          exam.section1.part2.fullQuestions = questions;

          //Send Exam notification
          var _id = req.user._id + new Date().getTime();
          var name = req.user.name.split(' ');
          if ((name.length > 1)) {
            name = name[0] + ' ' + name[1].substr(0, 1) + '.';
          } else {
            name = req.user.name;
          }
          addNotification({_id: _id, notification: {type: 'exam:addNotification', for: 'chat'}, user: {_id: req.user._id, name: name}, exam: {subject: exam.subject}}, function () {
            return res.status(200).json(exam);
          });
        })
      })
    });
};

// Deletes a exam from the DB.
exports.destroy = function (req, res) {
  Exam.findById(req.params.id, function (err, exam) {
    if(err) { return handleError(res, err); }
    if(!exam) { return res.send(404); }
    exam.remove(function (err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

//wish good luck
exports.wishGoodluck = function (req, res) {
  var params = req.body.data;
  var _id = req.user._id + new Date().getTime();
  var name = req.user.name.split(' ');
  if ((name.length > 1)) {
    name = name[0] + ' ' + name[1].substr(0, 1) + '.';
  } else {
    name = req.user.name;
  }
  addNotification({_id: _id, notification: {type: 'exam:addNotification', for: 'exam'}, user: {_id: req.user._id, name: name}, exam: {subject: params.exam.subject}, to: params.to}, function () {
    return res.send(200);
  });
};

//Remove good luck Notifications
exports.removeNotifications = function (req, res) {
  var _id = req.user._id + new Date().getTime();
  removeNotification({_id: _id, notification: {type: 'exam:removeNotification', for: 'chat'}, user: {_id: req.user._id}}, function () {
    return res.send(200);
  });
};

//Remove good luck Notifications (For internal use)
exports.removeNotificationsInternally = function (data, next) {
  var _id = data.userId + new Date().getTime();
  addNotification({_id: _id, notification: {type: 'exam:addNotification', for: 'chat', examOver: true}, user: {_id: data.userId, name: data.name}, wellWishers: data.wellWishers, exam: data.exam}, next);
};

function handleError(res, err) {
  return res.send(500, err);
}
