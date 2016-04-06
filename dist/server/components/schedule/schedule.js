/**
 * Controls scheduled jobs
 */

'use strict';

var scheduler = require('node-schedule');
var jsonfile = require('jsonfile');
var Classroom = require('../../api/classroom/classroom.model');
var User = require('../../api/user/user.model');
var mongoose = require('mongoose'),
    ObjectId = mongoose.Types.ObjectId;

// List of recurring jobs
var emailUpdates = scheduler.scheduleJob({second: 0, minute: 0, hour: 17}, function(){
  console.log('Searching for updates...');
  // look for classroom requesting updates every day.
  Classroom.find({'updates.interval': 1}).exec(function(err, classrooms){
    if (err) {
      console.log(err);
      return false;
    }
    if (!classrooms) {
      console.log('No classes with updates found.' );
      return false;
    }
    var updatesToSend = [];
    for (var i = 0; i < classrooms.length; i++) {
      var classUpdates = [];
      for (var j = 0; j < classrooms[i].updates.length; j++) {
        if (classrooms[i].updates[j].newScores.length > 0) {
          classUpdates.push({
            assignment: classrooms[i].updates[j].classAssignmentCode,
            submissions: classrooms[i].updates[j].newScores
          });
          // Clear updates from class.
          classrooms[i].updates[j].newScores = [];
          classrooms[i].save(function(err){
            if (err) { console.log(err); }
          });
        }
      }
      for (var k = 0; k < classUpdates.length; k++) {
        // Look up assignments and submissions
        for (var l = 0; l < classrooms[i].assignments.length; l++) {
          if (classUpdates[k].assignment === classrooms[i].assignments[l].code) {
            // Found assignment, look up submissions
            var updateToSend = {
              assignmentName: classrooms[i].assignments[l].name,
              teacherEmail: classrooms[i].teacherEmail,
              subject: classrooms[i].subject,
              scores: []
            };
            for (var m = 0; m < classrooms[i].assignments[l].submissions.length; m++) {
              if (classUpdates[k].submissions.indexOf(classrooms[i].assignments[l].submissions[m].studentId) > -1) {
                // Submission is new
                updateToSend.scores.push({
                  studentId: classrooms[i].assignments[l].submissions[m].studentId,
                  score: classrooms[i].assignments[l].submissions[m].get('score')
                });
              }
            }
            if (updateToSend.scores.length > 0) {
              updatesToSend.push(updateToSend);
            }
            break;
          }
        }
      }

    }
    if (updatesToSend.length === 0) {
      console.log('No updates to send.');
      return false;
    }
    // Collected all updates. Time to populate user names.
    var userIds = [];
    for (var n = 0; n < updatesToSend.length; n++) {
      for (var p = 0; p < updatesToSend[n].scores.length; p++) {
        if (userIds.indexOf(updatesToSend[n].scores[p].studentId) === -1) {
          userIds.push(updatesToSend[n].scores[p].studentId);
        }
      }
    }
    User.find({'_id': {$in: userIds}}, {'name': 1}, function(err, users) {
      if (err) {
        console.log(err);
        return false; }
      if (!users) {
        console.log('Invalid users.');
        return false;
      }
      var userNames = {};
      for (var q = 0; q < users.length; q++) {
        userNames[users[q]._id] = users[q].name;
      }
      for (var r = 0; r < updatesToSend.length; r++) {
        for (var s = 0; s < updatesToSend[r].scores.length; s++) {
          updatesToSend[r].scores[s].studentName = userNames[updatesToSend[r].scores[s].studentId];
        }
      }
      var updateEmailInfo = {
        updates: updatesToSend,
        timeCompiled: new Date(Date.now())
      };

      jsonfile.writeFile('./server/components/dynamicJSONS/updateEmailInfo.json', updateEmailInfo, {spaces: 2}, function(err) {
        if (err) {
          console.log(err);
          return false;
        }
        console.log('Wrote updates.');
        return true;
      });
    })
  });
});
