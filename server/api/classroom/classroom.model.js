'use strict';
var shortId = require('shortid');
var Assignment = require('../assignment/assignment.model');
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ClassMessageSchema = new Schema({
  authorId: Schema.Types.ObjectId,
  authorName: String,
  message: String,
  type: String,
  date: Date
});

var ClassAssignmentSubmissionSchema = new Schema({
  studentId: Schema.Types.ObjectId,
  code: {
    type: String,
    unique: true,
    sparse: true,
    'default': shortId.generate
  },
  topicScores: {},
  possible: Number,
  submission: []
}, // following required to use virtuals client-side
{
  toObject: {
  virtuals: true
  },
  toJSON: {
  virtuals: true
  }
});

var ClassAssignmentSchema = new Schema({
  assignmentId: Schema.ObjectId,
  name: String,
  submissions: [ClassAssignmentSubmissionSchema],
  submission: {},
  pointsPossible: Number,
  dueDate: Date,
  code: {
    type: String,
    unique: true,
    sparse: true,
    'default': shortId.generate
  }
}, // following required to use virtuals client-side
{
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
});


// Tracks who wants to get updates.
var ClassUpdatesSchema = new Schema( {
  classAssignmentCode: {
    type: String,
    sparse: true,
    unique: true
  },
  newScores: [Schema.Types.ObjectId], // list of users who submitted this assignment since last update
  interval: Number
});

var ClassroomSchema = new Schema({
  name: String,
  messages: [ClassMessageSchema],
  teacherId: Schema.Types.ObjectId,
  teacherEmail: String,
  updates: [ClassUpdatesSchema],
  peerGrades: {
    type: Object,
    'default': {}
  },
  students: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  code: {
    type: String,
    unique: true,
    'default': shortId.generate
  },
  unclaimedStudents: [String],
  assignments: [ClassAssignmentSchema],
  subject: {}
}, // following required to use virtuals client-side
{
  toObject: {
  virtuals: true
  },
  toJSON: {
  virtuals: true
  }
});

// Virtual for checking if assignment submission is fully graded
ClassAssignmentSubmissionSchema.virtual('fullyGraded')
  .get(function(){
    for (var i = 0; i < this.submission.length; i++) {
      // if question is short or mult, it should have a 'correct'. If it's a long, it'll have a 'score'.
      if ((this.submission[i].correct === undefined) && (this.submission[i].score === undefined)) {
        return false;
      }
    }
    return true;
  });

// Virtual for checking if assignment is only multiple choice
ClassAssignmentSubmissionSchema.virtual('allMult')
  .get(function(){
    for (var i = 0; i < this.submission.length; i++) {
      // if it's been graded without peer input, then it's a multiple choice question
      if (!((this.submission[i].correct !== undefined) && (this.submission[i].peerGrades === undefined))) {
        return false;
      }
    }
    return true;
  });


// virtuals can't utilize eachother, thus these are local functions
var getScoreFromSubmission = function(thisSubmission) {
  var score = 0;
  for (var i = 0; i < thisSubmission.submission.length; i++) {
    if (thisSubmission.submission[i].score) {
      score += thisSubmission.submission[i].score;
    } else if (thisSubmission.submission[i].correct) {
      score += 1;
    }
  }
  var assignment = thisSubmission.parent();
  return score / assignment.pointsPossible;
}

var getAverageForAssignment = function(thisAssignment) {
  if (thisAssignment.submissions.length > 0) {
    var runningTotal = 0;
    for (var i = 0; i < thisAssignment.submissions.length; i++) {
      runningTotal = runningTotal + getScoreFromSubmission(thisAssignment.submissions[i]);
    }
    return runningTotal / thisAssignment.submissions.length;
  } else {
    return false;
  }
}

// Virtual for getting assignment's score
ClassAssignmentSubmissionSchema.virtual('score')
  .get(function() {
    return getScoreFromSubmission(this);
  });

// Virtual for getting assignment's average
ClassAssignmentSchema.virtual('classAverage')
  .get(function(){
    return getAverageForAssignment(this);
  });


// Virtual for getting class average
ClassroomSchema.virtual('average')
  .get(function() {
    if (this.assignments.length > 0) {
      var runningEarned = 0;
      var runningPossible = 0;
      for (var i = 0; i < this.assignments.length; i++) {
        var score = getAverageForAssignment(this.assignments[i])
        if (score) {
          runningEarned += score * this.assignments[i].pointsPossible;
          runningPossible += this.assignments[i].pointsPossible;
        }
      }
      if (runningPossible > 0) {
        return runningEarned / runningPossible;
      }
    }
    return 'N/A';
  });


module.exports = mongoose.model('Classroom', ClassroomSchema);
