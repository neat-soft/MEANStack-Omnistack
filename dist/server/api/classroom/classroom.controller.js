'use strict';

var shortId = require('shortid');
var _ = require('lodash');
var Classroom = require('./classroom.model');
var Question = require('../question/question.model');
var Assignment = require('../assignment/assignment.model');
var User = require('../user/user.model');

function handleError(res, err) {
  return res.status(500).send(err);
}

// Get list of classrooms
exports.index = function(req, res) {
  Classroom.find(function (err, classrooms) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(classrooms);
  });
};

// Set an assignment for updates
exports.setUpdate = function(req, res) {
  Classroom.find({'code': req.params.classCode, 'assignments.code': req.params.assignmentCode}, function(err, classrooms) {
    if (err) { return handleError(res, err); }
    if (classrooms.length !== 1) { return handleError(res, 'Invalid number of classes found.'); }
    var isAlreadyThere = false;
    for (var i = 0; i < classrooms[0].updates.length; i++) {
      if (String(classrooms[0].updates[i].classAssignmentCode) === String(req.params.assignmentCode)) {
        classrooms[0].updates[i].interval = req.params.interval;
        isAlreadyThere = true;
        break;
      }
    }
    if (!isAlreadyThere) {
      classrooms[0].updates.push({
        classAssignmentCode: req.params.assignmentCode,
        interval: req.params.interval
      });
    }
    classrooms[0].save(function(err, classroom) {
      if (err) { return handleError(res, err); }
      return res.send(classroom);
    });
  });
};

// Unset an assignment for updates
exports.unsetUpdate = function(req, res) {
  Classroom.find({'code': req.params.classCode}, function(err, classrooms) {
    if (err) { return handleError(res, err); }
    if (classrooms.length !== 1) { return handleError(res, 'Invalid number of classes found.'); }
    var removed = false;
    for (var i = 0; i < classrooms[0].updates.length; i++) {
      if (String(classrooms[0].updates[i].classAssignmentCode) === String(req.params.assignmentCode)) {
        classrooms[0].updates.splice(i, 1);
        removed = true;
        break;
      }
    }
    if (!removed) {
      return res.status(404).send('Update not found.');
    }
    classrooms[0].save(function(err, classroom) {
      if (err) { return handleError(res, err); }
      return res.send(classroom);
    });
  });
};

// Get a teacher's classrooms
exports.showTeacher = function(req, res) {
  Classroom.find({'teacherId': req.user._id}, function(err, classrooms) {
    if (err) { return handleError(res, err); }
    if (!classrooms) { return res.status(404).send('No classrooms found.'); }
    return res.status(200).json(classrooms);
  });
};

exports.getSubmissionForPeer = function(req, res) {
    Classroom.find({'code': req.params.classCode}, function(err, classrooms){
    var foundInfo = {
      found: false
    };
    if (err) { return handleError(res, err); }
    if (classrooms.length !== 1) { return handleError(res, 'Invalid number of classes found.'); }
    for (var i = 0; i < classrooms[0].assignments.length; i++) {
      if (classrooms[0].assignments[i].code === req.params.assignmentCode) {
        //Found the assignment.
        var toGrade = [];
        for (var j = 0; j < classrooms[0].assignments[i].submissions.length; j++) {
          // prevent user from grading their own assignment
          if (String(classrooms[0].assignments[i].submissions[j].studentId) === String(req.user._id)) {
            continue;
          }
          // prevent user from grading same assignment twice
          if (classrooms[0].peerGrades) {
            if (classrooms[0].peerGrades[String(req.user._id)]) {
              if (classrooms[0].assignments[i].code in classrooms[0].peerGrades[req.user._id]) {
                if (classrooms[0].peerGrades[req.user._id][classrooms[0].assignments[i].code].indexOf(String(classrooms[0].assignments[i].submissions[j].studentId)) > -1) {
                  continue;
                }
              }
            }
          }
          for (var k = 0; k < classrooms[0].assignments[i].submissions[j].submission.length; k++) {
            if (classrooms[0].assignments[i].submissions[j].submission[k].correct === undefined) {
              toGrade.push(classrooms[0].assignments[i].submissions[j].submission[k]);
            }
          }
          if (toGrade.length === 0) {
            // assignment was already graded
            continue;
          }
          foundInfo.submissions = classrooms[0].assignments[i].submissions[j];
          foundInfo.found = true;
          foundInfo.code = classrooms[0].assignments[i].code;
          foundInfo.submission = toGrade;
        }
      }
    }
    if (foundInfo.found) {
      var ids = [];
      for (var m = 0; m < foundInfo.submission.length; m++) {
        ids.push(foundInfo.submission[m].questionId);
      }
      Question.find({'_id': {'$in': ids}}, function(err, qs) {
        if (err) {return handleError(res, err)}
        // collect responses
        foundInfo.responses = {};
        for (var n = 0; n < foundInfo.submission.length; n++) {
          foundInfo.responses[foundInfo.submission[n].questionId] = foundInfo.submission[n].response;
        }
        return res.json({
          studentId: foundInfo.submissions.studentId,
          questions: qs,
          responses: foundInfo.responses,
          assignmentCode: foundInfo.code
        });
      });
    } else {
      return res.status(404).json('Not enough submissions.');
    }
  });
}

exports.postSubmissionForPeer = function(req, res) {
  var found = {
    class: false,
    assignment: false,
    submission: false,
    question: false
  };
  Classroom.find({'code': req.params.classCode}, function(err, classrooms){
    if (err) { return handleError(res, err); }
    if (classrooms.length !== 1) { return handleError(res, 'Invalid number of classes found.'); }
    found.class = true;
    for (var i = 0; i < classrooms[0].assignments.length; i++) {
      if (classrooms[0].assignments[i].code === req.params.assignmentCode) {
        found.assignment = true;
        // Found the assignment
        for (var j = 0; j < classrooms[0].assignments[i].submissions.length; j++) {
          if (String(classrooms[0].assignments[i].submissions[j].studentId) === String(req.body.studentId)) {
            found.submission = true;
            // Found the submission
            for (var h = 0; h < req.body.graded.length; h++) {
              // parse through questions that were graded
              for (var k = 0; k < classrooms[0].assignments[i].submissions[j].submission.length; k++) {
                if (String(classrooms[0].assignments[i].submissions[j].submission[k].questionId) === String(req.body.graded[h].questionId)) {
                  found.question = true;
                  // Found the question
                  if ('peerGrades' in classrooms[0].assignments[i].submissions[j].submission[k]) {
                    classrooms[0].assignments[i].submissions[j].submission[k].peerGrades.push(req.body.graded[h].grade);
                  }  else {
                    classrooms[0].assignments[i].submissions[j].submission[k].peerGrades = [req.body.graded[h].grade];
                  }
                  if (classrooms[0].assignments[i].submissions[j].submission[k].peerGrades.length >= Math.min(classrooms[0].students.length - 1, 5)) {
                    // Enough grades to average out student's grade
                    if (typeof classrooms[0].assignments[i].submissions[j].submission[k].peerGrades[0] === 'boolean') {
                      // short answer
                      var numYay = 0;
                      var numNay = 0;
                      for (var l = 0; l < classrooms[0].assignments[i].submissions[j].submission[k].peerGrades.length; l++) {
                        if (classrooms[0].assignments[i].submissions[j].submission[k].peerGrades[l]) {
                          numYay++;
                        } else {
                          numNay++;
                        }
                      }
                      // apply peer grade
                      classrooms[0].assignments[i].submissions[j].submission[k].correct = (numYay >= numNay);
                    } else if (typeof classrooms[0].assignments[i].submissions[j].submission[k].peerGrades[0] === 'number') {
                      // long answer
                      var runningTotal = 0;
                      for (var m = 0; m < classrooms[0].assignments[i].submissions[j].submission[k].peerGrades.length; m++) {
                        runningTotal += classrooms[0].assignments[i].submissions[j].submission[k].peerGrades[m];
                      }
                      // apply peer grade
                      classrooms[0].assignments[i].submissions[j].submission[k].score = runningTotal/classrooms[0].assignments[i].submissions[j].submission[k].peerGrades.length;

                    } else {
                      return handleError(res, 'Invalid peer grade type: ' + (typeof classrooms[0].assignments[i].submissions[j].submission[k].peerGrades[0]));
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    if (!found.class) {
      return res.status(404).json('Classroom not found.');
    } else if (!found.assignment) {
      return res.status(404).json('Assignment not found.');
    } else if (!found.submission) {
      return res.status(404).json('Submission not found.');
    } else if (!found.question) {
      return res.status(404).json('Question not found.');
    }
    // Peer grade applied. Now to give student credit for peer grading on this assignment
    if (!classrooms[0].peerGrades) {
      classrooms[0].peerGrades = {};
    }
    if (String(req.user._id) in classrooms[0].peerGrades) {
      if (req.params.assignmentCode in classrooms[0].peerGrades[String(req.user._id)]) {
        classrooms[0].peerGrades[String(req.user._id)][req.params.assignmentCode].push(req.body.studentId);
      } else {
        classrooms[0].peerGrades[String(req.user._id)][req.params.assignmentCode] = [req.body.studentId];
      }
    } else {
      if (!classrooms[0].peerGrades) {
        classrooms[0].peerGrades = {};
      }
      classrooms[0].peerGrades[req.user._id] = {};
      classrooms[0].peerGrades[req.user._id][req.params.assignmentCode] = [req.body.studentId];
    }
    var newClassroom = classrooms[0];
    classrooms[0].markModified('peerGrades');
    classrooms[0].markModified('assignments');
    classrooms[0].save(function(err, c) {
      if (err) { return handleError(res, err); }
      // Highlight student's submission for use client-side
      for (var i = 0; i < classrooms[0].assignments.length; i++) {
        for (var j = 0; j < classrooms[0].assignments[i].submissions.length; j++) {
          if (String(classrooms[0].assignments[i].submissions[j].studentId) === String(req.user._id)) {
            classrooms[0].assignments[i].submission = classrooms[0].assignments[i].submissions[j];
            classrooms[0].assignments[i].taken = true;
          }
        }
      }
      return res.status(200).json(classrooms[0]);
    });
  });
}

exports.getClassUpdates = function(req, res) {
    Classroom.find({'code': req.params.classCode}, function(err, classrooms){
      if (err) { return handleError(res, err); }
      if (classrooms.length !== 1) { return handleError(res, 'Invalid number of classes found.'); }
      var newUpdates = [];
      for (var i = 0; i < classrooms[0].updates.length; i++) {
        newUpdates.push({
          assignment: classrooms[0].updates[i].classAssignmentCode,
          scores: classrooms[0].updates[i].newScores
        });
        classrooms[0].updates[i].newScores = [];
      }
      return newUpdates;
    });
}

exports.studentAssignment = function(req, res) {
  Classroom.find({'code': req.params.classCode}, function(err, classrooms){
    if (err) { return handleError(res, err); }
    if (classrooms.length !== 1) { return handleError(res, 'Invalid number of classes found.'); }
    for (var i = 0; i < classrooms[0].assignments.length; i++) {
      if (classrooms[0].assignments[i].code === req.params.assignmentCode) {
        var newSubmission = {
          submission: req.body
        };
        if (req.user) {
          // attach user to new submission.
          newSubmission.studentId = req.user._id;
          // check for double-submission
          for (var j = 0; j < classrooms[0].assignments[i].submissions.length; j++) {
            if (String(classrooms[0].assignments[i].submissions[j].studentId) === String(req.user._id)) {
              return res.send(403, 'You\'ve already submitted something for this assignment.');
            }
          }
        }
        classrooms[0].assignments[i].submissions.push(newSubmission);
        // Add user to updates for this assignment, if applicable.
        if (req.user) {
          for (var k = 0; k < classrooms[0].updates.length; k++) {
            if (String(classrooms[0].updates[k].classAssignmentCode) === String(req.params.assignmentCode)) {
              classrooms[0].updates[k].newScores.push(req.user._id)
            }
          }
        }
        classrooms[0].save(function(err) {
          if (err) { return handleError(res, err); }
          return res.send(200, newSubmission);
        });
      }
    }
  });
};

// assign assignment to a particular classroom
exports.assign = function(req, res) {
  if (!req.body.classroom) { return handleError(res, 'No class supplied!');}
  if (!req.body.assignment) { return handleError(res, 'No assignment supplied!');}

  // compile assigment from request
  var assignment = {
    assignmentId: req.body.assignment._id,
    dueDate: req.body.dueDate,
    name: req.body.assignment.name,
    pointsPossible: req.body.assignment.pointsPossible,
    code: req.body.assignment.code
  };

  Classroom.findById(req.body.classroom._id, function(err, classroom) {
    if (err) { return handleError(res, err); }
    if (!classroom) { return res.status(404).json('Classroom not found.'); }

    // check to see if assignment has already been assigned to this class
    for (var i = 0; i < classroom.assignments.length; i++) {
      if (String(classroom.assignments[i].assignmentId) === String(assignment.assignmentId)) {
        return res.status(403).json('You have already assigned that assignment to that class.')
      }
    }
    classroom.assignments.push(assignment)
    classroom.save(function(err, newClassroom) {
      if (err) { return res.status(403).json(err); }
      return res.json(classroom);
    });
  });
  //Classroom.findByIdAndUpdate(req.body.classroom._id, {$push: {assignments: assignment}}, function(err, classroom) {
  //});
};

exports.signUpByCode = function(req, res) {
  Classroom.find({'code': req.params.code}, function(err, classrooms) {
    if (err) { return handleError(res, err); }
    if (!classrooms || classrooms.length === 0) { return res.status(404).send('No classrooms found.'); }
    if (classrooms.length > 1) { return handleError(res, 'Too many classes by that code.'); }
    if (req.user.academicRole !== 'Student') { return res.status(403).send('Only students can sign up this way.'); }
    var classroom = classrooms[0];
    if (classroom.students.indexOf(req.user._id) > -1) {
      return handleError(res, 'You have already signed up for that class!');
    }
    classroom.students.push(req.user._id);
    classroom.save(function(err, updatedClassroom) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(updatedClassroom);
    });
  });
};

// Get a teacher's classroom by name
exports.showTeacherByName = function(req, res) {
  Classroom.find({'teacherId': req.user._id, 'name': decodeURI(req.params.name)}, function(err, classrooms) {
    if (err) { return handleError(res, err); }
    if (!classrooms || classrooms.length === 0) { return res.status(404).send('No classrooms found.'); }
    if (classrooms.length === 1) {
      return res.status(200).json(classrooms[0]);
    } else {
      return handleError(res, 'Multiple Classrooms by that name! Error!');
    }
  });
};

// Add a teacher's email to a classroom
exports.addEmailByCode = function(req, res) {
  Classroom.find({'code': req.params.code}, function(err, classrooms) {
    if (err) { return handleError(res, err); }
    if (!classrooms || classrooms.length !== 1) { return res.status(404).send('No classroom found.'); }
    if (classrooms[0].teacherEmail) { return res.status(401).send('This classroom already has a teacher.'); }
    classrooms[0].teacherEmail = req.body.email;
    classrooms[0].save(function(err, classroom){
      if (err) { return handleError(res, err); }
      return res.send(classroom);
    });
  });
};


// Add a teacher to a classroom
exports.addTeacherByCode = function(req, res) {
  Classroom.find({'code': req.params.code}, function(err, classrooms) {
    if (err) { return handleError(res, err); }
    if (!classrooms || classrooms.length !== 1) { return res.status(404).send('No classroom found.'); }
    if (classrooms[0].teacherId) { return res.status(401).send('This classroom already has a teacher.'); }
    classrooms[0].teacherId = req.user._id;
    classrooms[0].save(function(err, classroom){
      if (err) { return handleError(res, err); }
      return res.send(classroom);
    });
  });
};

// Get a teacher's classroom by code
exports.showTeacherByCode = function(req, res) {
  Classroom.find({'teacherId': req.user._id, 'code': decodeURI(req.params.code)}).populate('students', 'name').exec(function(err, classrooms) {
    if (err) { return handleError(res, err); }
    if (!classrooms || classrooms.length === 0) { return res.status(404).send('No classrooms found.'); }
    if (classrooms.length === 1) {
      return res.status(200).json(classrooms[0]);
    } else {
      return handleError(res, 'Multiple Classrooms by that name! Error!');
    }
  });
};

exports.showTeacherTagsByCode = function(req, res) {
  Classroom.find({'teacherId': req.user._id, 'code': decodeURI(req.params.code)}, function(err, classrooms) {
    if (err) { return handleError(res, err); }
    if (classrooms.length !== 1) {return res.status(404).send('No classrooms found.'); }
    var assignmentsToFind = [];
    for (var i = 0; i < classrooms[0].assignments.length; i++) {
      if (classrooms[0].assignments[i].submissions.length > 0) {
        assignmentsToFind.push(classrooms[0].assignments[i].assignmentId);
      }
    }
    if (assignmentsToFind.length > 0) {
      Assignment.find({'_id': {'$in': assignmentsToFind}}).populate('questions', 'tags type value').exec(function(err, assignments) {
        if (err) { return handleError(res, err); }
        if (assignments.length > 0) {
          var questionDict = {};
          var tagDict = {};
          // make an object of the questions to look them up via id.
          for (var j = 0; j < assignments.length; j++) {
            for (var k = 0; k < assignments[j].questions.length; k++) {
              if (!questionDict[assignments[j].questions[k]._id]) {
                questionDict[assignments[j].questions[k]._id] = assignments[j].questions[k];
                for (var l = 0; l < assignments[j].questions[k].tags.length; l++) {
                  if (!tagDict[assignments[j].questions[k].tags[l]]) {
                    tagDict[assignments[j].questions[k].tags[l]] = {
                      possible: 0,
                      earned: 0
                    };
                  }
                }
              }
            }
          }
          // now go through submissions and organize tags
          for (var x = 0; x < classrooms[0].assignments.length; x++) {
            for (var y = 0; y < classrooms[0].assignments[x].submissions.length; y++) {
              for (var z = 0; z < classrooms[0].assignments[x].submissions[y].submission.length; z++) {
                if (questionDict[classrooms[0].assignments[x].submissions[y].submission[z].questionId]) {
                  // goes through all answered questions for the class
                  if (questionDict[classrooms[0].assignments[x].submissions[y].submission[z].questionId].type === "long") {
                    if (classrooms[0].assignments[x].submissions[y].submission[z].score) {
                      for (var tagTracker = 0; tagTracker < questionDict[classrooms[0].assignments[x].submissions[y].submission[z].questionId].tags.length; tagTracker++) {
                        tagDict[questionDict[classrooms[0].assignments[x].submissions[y].submission[z].questionId].tags[tagTracker]].possible += questionDict[classrooms[0].assignments[x].submissions[y].submission[z].questionId].value;
                        tagDict[questionDict[classrooms[0].assignments[x].submissions[y].submission[z].questionId].tags[tagTracker]].earned += classrooms[0].assignments[x].submissions[y].submission[z].score
                      }
                    }
                  } else if (questionDict[classrooms[0].assignments[x].submissions[y].submission[z].questionId].type === "short") {
                    if (classrooms[0].assignments[x].submissions[y].submission[z].correct !== undefined) {
                      for (var tagTracker = 0; tagTracker < questionDict[classrooms[0].assignments[x].submissions[y].submission[z].questionId].tags.length; tagTracker++) {
                        tagDict[questionDict[classrooms[0].assignments[x].submissions[y].submission[z].questionId].tags[tagTracker]].possible += 1;
                        if (classrooms[0].assignments[x].submissions[y].submission[z].correct) {
                          tagDict[questionDict[classrooms[0].assignments[x].submissions[y].submission[z].questionId].tags[tagTracker]].earned += 1;
                        }
                      }
                    }
                  } else {
                    for (tagTracker = 0; tagTracker < questionDict[classrooms[0].assignments[x].submissions[y].submission[z].questionId].tags.length; tagTracker++) {
                      tagDict[questionDict[classrooms[0].assignments[x].submissions[y].submission[z].questionId].tags[tagTracker]].possible += 1;
                      if (classrooms[0].assignments[x].submissions[y].submission[z].correct) {
                        tagDict[questionDict[classrooms[0].assignments[x].submissions[y].submission[z].questionId].tags[tagTracker]].earned += 1;
                      }
                    }
                  } //finish going through each question type
                } //finish checking if submission exists
              } //end for loop going through each submission's questions
            } //end for loop going through each submission
          } //end for loop going through each assignment
          return res.send(tagDict);
        } else {
          return res.status(404).send('No topic data found.')
        }

      })
    } else {
      return res.status(404).send('No topic data found.')
    }
  });
}

// Get a student's classrooms
exports.showStudent = function(req, res) {
  Classroom.find({'students': req.user._id}, function(err, classrooms) {
    if (err) { return handleError(res, err); }
    if (!classrooms) { return res.status(404).send('No classrooms found.'); }

    // Highlight student's submission for use client-side
    for (var x = 0; x < classrooms.length; x++) {
      for (var i = 0; i < classrooms[x].assignments.length; i++) {
        for (var j = 0; j < classrooms[x].assignments[i].submissions.length; j++) {
          if (String(classrooms[x].assignments[i].submissions[j].studentId) === String(req.user._id)) {
            classrooms[x].assignments[i].submission = classrooms[x].assignments[i].submissions[j];
            classrooms[x].assignments[i].submissions = [];
            classrooms[x].assignments[i].taken = true;
          }
        }
      }
    }
    // return an array of classrooms with assignments and student's submission highlighted in assignment submissions
    return res.status(200).json(classrooms);
  });
};

// Get a student's classroom by code
exports.showStudentByCode = function(req, res) {
  Classroom.find({'code': req.params.code}, function(err, classrooms) {
    if (err) { return handleError(res, err); }
    // Make sure code only found one classroom.
    if (!classrooms || classrooms.length === 0) { return res.status(404).send('No classrooms found.'); }
    if (classrooms.length > 1) { return handleError(res, 'Too many classes found.'); }

    // Highlight student's submission for use client-side
    for (var i = 0; i < classrooms[0].assignments.length; i++) {
      for (var j = 0; j < classrooms[0].assignments[i].submissions.length; j++) {
        if (String(classrooms[0].assignments[i].submissions[j].studentId) === String(req.user._id)) {
          classrooms[0].assignments[i].submission = classrooms[0].assignments[i].submissions[j];
          classrooms[0].assignments[i].submissions = [];
          classrooms[0].assignments[i].taken = true;
        }
      }
    }
    // returns ONE classroom specific to the code found
    return res.status(200).json(classrooms[0]);
  });
};

// Add students by their emails
exports.addStudentsByEmail = function(req, res) {
  Classroom.findById(req.params.classId, function(err, classroom) {
    if(err) { return handleError(res, err); }
    if(!classroom) { return res.status(404).send('Not Found'); }
    User.find({'email': {'$in': req.body.emails}}, function(err, students) {
        if(err) { return handleError(res, err); }
        if(!students) { return res.status(404).send('No students Found'); }
        var studentIds = [];
        for (var i = 0; i < students.length; i++) {
          studentIds.push(students[i]._id);
        }
        classroom.students += studentIds;
        classroom.save(function(err, newClass) {
            if(err) { return handleError(res, err); }
            return res.status(200).json(newClass);
        });
    });
  });
};

// Get a single classroom
exports.show = function(req, res) {
  Classroom.findById(req.params.id, function (err, classroom) {
    if(err) { return handleError(res, err); }
    if(!classroom) { return res.status(404).send('Not Found'); }
    return res.json(classroom);
  });
};

exports.announce = function(req, res) {
  var message = req.body;
  message.authorId = req.user._id;
  message.authorName = req.user.name;
  Classroom.find({teacherId: req.user._id}, function(err, classrooms){
    if (err) { return handleError(res, err); }
    if (!classrooms) { res.send(404); }
    var classIds = [];
    for (var i = 0; i < classrooms.length; i++) {
      classIds.push(classrooms[i]._id);
    }
    Classroom.update({'_id': {'$in': classIds}}, {'$push': {'messages': message}}, {multi: true}, function(err) {
      if (err) { return handleError(res, err); }
      return res.json(message);
    });
  });
};

exports.message = function(req, res) {
  var newMessage = req.body;
  newMessage.authorId = req.user._id;
  newMessage.authorName = req.user.name;
  Classroom.update({'_id': req.params.classId}, {'$push': {'messages': newMessage}}, function(err) {
    if (err) { return handleError(res, err); }
    return res.json(newMessage);
  });
};

// Creates a new classroom in the DB.
exports.create = function(req, res) {
  req.body.teacherId = req.user._id;
  var foundStudentIds = [];
  User.find({'email': {'$in': req.body.unclaimedStudents}}, function(err, users) {
    if (err) { return handleError(res, err); }
    for (var i = 0; i < users.length; i++) {
      var index = req.body.unclaimedStudents.indexOf(users[i].email);
      if (index > -1) {
        foundStudentIds.push(users[i]._id);
        req.body.unclaimedStudents.splice(index, 1);
      }
    }
    req.body.students = foundStudentIds;
    Classroom.find({name: req.body.name, teacherId: req.body.teacherId}, function(err, classrooms) {
      if (err) { return handleError(res, err); }
      if (classrooms && classrooms.length > 0) {
        return handleError(res, 'You already have a class by that name.');
      } else {
        Classroom.create(req.body, function(err, classroom) {
          if(err) { return handleError(res, err); }
          return res.status(201).json(classroom);
        });
      }
    })
  });
};

// Updates an existing classroom in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Classroom.findById(req.params.id, function (err, classroom) {
    if (err) { return handleError(res, err); }
    if(!classroom) { return res.status(404).send('Not Found'); }
    var updated = _.merge(classroom, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(classroom);
    });
  });
};

// Deletes a classroom from the DB.
exports.destroy = function(req, res) {
  Classroom.findById(req.params.id, function (err, classroom) {
    if(err) { return handleError(res, err); }
    if(!classroom) { return res.status(404).send('Not Found'); }
    classroom.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};
