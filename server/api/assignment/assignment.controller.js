'use strict';

var _ = require('lodash');
var Assignment = require('./assignment.model');
var Classroom = require('../classroom/classroom.model');
var Question = require('../question/question.model');

// Get list of assignments
exports.index = function(req, res) {
  Assignment.find(function (err, assignments) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(assignments);
  });
};

exports.byAuthor = function(req, res) {
  var lookupId = req.params.id || req.user._id
  Assignment.find({author: lookupId}, function(err, assignments) {
    if(err) { return handleError(res, err); }
    if(!assignments) { return res.status(404).send('Not Found'); }
    return res.json(assignments);
  });
};

exports.showByClassAndCode = function(req, res) {
  Classroom.find({'code': req.params.classCode, 'assignments.code': req.params.assignmentCode}, function(err, classrooms) {
    if (err) { return handleError(res, err); }
    if (classrooms.length !== 1) { return handleError(res, "Invalid number of classes found."); }
    var matchedAssignment;
    for (var i = 0; i < classrooms[0].assignments.length; i++) {
      if (classrooms[0].assignments[i].code === req.params.assignmentCode) {
        matchedAssignment = classrooms[0].assignments[i];
        i = classrooms[0].assignments.length;
      }
    }

    if (matchedAssignment.assignmentId) {
      for (var j = 0; j < matchedAssignment.submissions.length; j++) {
        if (req.user) {
          if (String(matchedAssignment.submissions[j].studentId) === String(req.user._id)) {
            return res.send(403, 'You\'ve already taken this assignment.');
          }
        }
      }
      Assignment.findById(matchedAssignment.assignmentId).populate('questions').exec(function(err, assignment) {
        if (err) { return handleError(res, err); }
        return res.json(assignment);
      });
    } else {
      return handleError(res, 'Assignment not found.');
    }
  });
};

// Get a single assignment
exports.show = function(req, res) {
  Assignment.findById(req.params.id, function (err, assignment) {
    if(err) { return handleError(res, err); }
    if(!assignment) { return res.status(404).send('Not Found'); }
    return res.json(assignment);
  });
};

// Get a single assignment and populate questions.
exports.showWithQuestions = function(req, res) {
  Assignment
    .findById(req.params.assignmentId)
    .populate('questions')
    .exec(function(error, assignment) {
      if(error) {
        return handleError(res, error);
      }

      if(!assignment) {
        return res.status(404).send('Assignment not found.');
      }
      return res.json(assignment);
    });
};

// Creates a new assignment for a teacher.
exports.createForTeacher = function(req, res) {
  var newAssignment = {};

  // match properties from the request to newAssignment object
  for (var requestProperty in req.body) {
    if (requestProperty === 'topic' || requestProperty === 'questionNumber') {newAssignment[requestProperty] = req.body[requestProperty];/*console.log("TOPIC"+requestProperty); continue;*/ }//RG_MODIFIED_3_7
    if (requestProperty === 'subject') {
      newAssignment[requestProperty] = req.body.subject.dbName;
      continue;
    }
    newAssignment[requestProperty] = req.body[requestProperty];
  }
  newAssignment.author = req.user._id;

  var createAssignment = function () {
    Assignment.findOne({name: req.body.name, author: req.user._id}, function(err, duplicate) {
      if (err) { return handleError(res, err); }
      if (duplicate) { return handleError(res, 'You already have an assignment by that name.'); }
      Assignment.create(newAssignment, function(err, assignment) {
        if(err) { return handleError(res, err); }
        return res.status(201).json(assignment);
      });
    });
  };

  // search for questions found in the assignment and assign point value to the assignment
  if (newAssignment.questions) {
    Question.find({_id: {'$in': req.body.questions}}, function(err, questions) {
      if (err) { return handleError(res, err); }
      var pointsPossible = 0;
      // assign point value to assignment depending on question types
      for (var j = 0; j < questions.length; j++) {
        if ((questions[j].type === 'short') || (questions[j].type === 'mult')) {
          pointsPossible++;
        } else if (questions[j].value) {
          pointsPossible += questions[j].value;
        }
      }
      if (j !== newAssignment.questions.length) {
        return handleError(res, 'Invalid question supplied.');
      }
      newAssignment.pointsPossible = pointsPossible;
      createAssignment();
    });
  } else {
    createAssignment();
  }
};

// Creates a new assignment for someone who's not logged in
exports.createForNonUser = function(req, res) {
  var newAssignment = {
    subject: req.body.subject.dbName,
    name: req.body.name,
    questions: req.body.questions
  };
  Question.find({_id: {'$in': req.body.questions}}, function(err, questions) {
    if (err) { return handleError(res, err); }
    var pointsPossible = 0;
    for (var j = 0; j < questions.length; j++) {
      if ((questions[j].type === "short") || (questions[j].type === "mult")) {
        pointsPossible++;
      } else if (questions[j].value) {
        pointsPossible += questions[j].value;
      }
    }
    if (j !== newAssignment.questions.length) {
      return handleError(res, 'Invalid question supplied.');
    }
    newAssignment.pointsPossible = pointsPossible;
    Assignment.create(newAssignment, function(err, assignment) {
      if (err) { return handleError(res, err); }
      var classAssignment = {
        assignmentId: assignment._id,
        name: req.body.name,
        pointsPossible: assignment.pointsPossible
      };
      var newClassroom = {
        name: 'Sample Classroom',
        assignments: [classAssignment],
        subject: req.body.subject
      };
      Classroom.create(newClassroom, function(err, classroom) {
        if (err) { return handleError(res, err); }
        var toReturn = {
          URL: 'student/classroom/' + classroom.code + '/assignment/' + classroom.assignments[0].code,
          assignment: assignment,
          classroom: classroom,
          classAssignment: classroom.assignments[0]
        };
        return res.send(toReturn);
      });
    });
  });
};

// Creates a new assignment in the DB.
exports.create = function(req, res) {
  Assignment.create(req.body, function(err, assignment) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(assignment);
  });
};

// Updates an existing assignment in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Assignment.findOne({code: req.params.assignmentCode}, function (err, assignment) {
    if (err) { return handleError(res, err); }
    if(!assignment) { return res.status(404).send('Not Found'); }
    assignment.questions = req.body.questions;
    assignment.topic = req.body.topic;//RG_ADD_3_7
    assignment.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(assignment);
    });
  });
};

// Deletes a assignment from the DB.
exports.destroy = function(req, res) {
  Assignment.findById(req.params.id, function (err, assignment) {
    if(err) { return handleError(res, err); }
    if(!assignment) { return res.status(404).send('Not Found'); }
    assignment.remove(function(err) {
      if(err) { return handleError(res, err); }
      deleteAssignmentFromClassrooms(req.user._id,req.params.id);
      return res.status(204).send('No Content');
    });
  });
};

function deleteAssignmentFromClassrooms(teacherId,assignmentId){
  Classroom.find({'teacherId': teacherId}, function(err, classrooms) {
      if (classrooms.length !== 0) {
          for (var i = 0; i < classrooms.length; i++) {
             for (var j = 0; j < classrooms[i].assignments.length; j++){
                if (classrooms[i].assignments[j].assignmentId == assignmentId)
                  {
                    classrooms[i].assignments.splice(j,1);
                  }
             }
            classrooms[i].save(function(err, classroom) {
              if (err) {console.log(err) }
            });
          }
        }
  });
}

function handleError(res, err) {
  return res.status(500).send(err);
}
