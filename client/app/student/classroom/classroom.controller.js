'use strict';

angular.module('fsaApp')
  .controller('StudentClassroomCtrl', function ($scope, $http, toastr, $location, User, ngDialog, $routeParams, classroomHelper) {
    var me;

    // set up classroom
    var setUpClassroom = function(classroom) {
      $scope.classroom = classroom;
      // new is assignments yet to be taken
      $scope.new = [];
      // old is past due or taken assignments
      $scope.old = [];
      $scope.myPeerGrades;
      // loop through all assignments
      for (var i = 0; i < classroom.assignments.length; i++ ){
        classroom.assignments[i].canView = false;
        if (classroom.assignments[i].submission) {
          // check to see if user can see their grade
          if (classroom.assignments[i].submission.allMult) {
            // if the assignment is all multiple choice, student can view grade
            classroom.assignments[i].canView = true;
          } else if (classroom.peerGrades) {
            // If a student's assignment has received at least 5 peer grades, and this student has given 5 grades, then the student can view the grade for this assignment
            if (classroom.peerGrades[String(me._id)]) {
              if (classroom.assignments[i].code in $scope.classroom.peerGrades[String(me._id)]) {
                if ($scope.classroom.peerGrades[String(me._id)][classroom.assignments[i].code].length >= Math.min(5, $scope.classroom.students.length-1)) {
                  classroom.assignments[i].canView = true;
                }
              }
            }
          }
          $scope.old.push(classroom.assignments[i]);
          continue;
        }
        // add assignment to old assignment if past due or taken, otherwise keep assignment accessible
        if ($scope.hasPassed(classroom.assignments[i])) {
          $scope.old.push(classroom.assignments[i]);
        } else if (classroom.assignments[i].submission) {
          $scope.old.push(classroom.assignments[i]);
        } else {
          $scope.new.push(classroom.assignments[i]);
        }
      }
      // track number of peer-graded assignments left to grade to notify student
      $scope.myPeerGrades = classroom.peerGrades[String(me._id)];
    };

    // First get user, then set up classroom according to the user's unique ID
    User.get(function(response) {
      me = response;
      // console.log(classroomHelper.getClasses());
      var matchingClassroom;
      matchingClassroom = classroomHelper.findMatchingClassroom($routeParams.classCode);
      if (matchingClassroom === false) {
        // only make a request if classroom is not set up or found in classroomHelper to optimize performance
        $http.get('/api/classrooms/byStudent/byCode/' + $routeParams.classCode)
          .success(function(classroom) {
            // add classroom to classroom helper so it's preserved, then set up classroom
            classroomHelper.addNewClass(classroom);
            setUpClassroom(classroom);
          }).error(function(err) {
            toastr.error(err);
          });
      } else {
        setUpClassroom(matchingClassroom);
      }
    });

    $scope.peerGrade = function(assignmentCode) {
      var peerGrade = ngDialog.open({
        template: 'app/student/classroom/peerGradeModal.html',
        controller: 'StudentClassroomPeerGradeModalCtrl',
        className: 'lgModal',
        data: {
          assignmentCode: assignmentCode,
          classCode: $routeParams.classCode
        }
      });

      peerGrade.closePromise.then(function(data){
        if ((data.value === '$document') || (!data.value)) {
          // Closed without submitting
          return false;
        } else if (data.value && data.value.assignments) {
          // User submitted their vote properly.
          setUpClassroom(data.value);
          return true;
        }
      });
    }

    $scope.hasPassed= function(assignment) {
      var now = new Date(Date.now());
      var dateObj = new Date(assignment.dueDate);
      return now > dateObj;
    };

    $scope.goToAssignment = function(assignment) {
      console.log(assignment);
      // go to assignment view
      $location.path('student/classroom/' + $routeParams.classCode + '/assignment/' + assignment.code);
    }

    $scope.checkIfToday = function(dateThing) {
      var today = new Date(Date.now());
      var dateObj = new Date(dateThing);
      return dateObj.toDateString() === today.toDateString();
    };

    $scope.addMessage = function() {
      var message = {
        message: $scope.newMessage,
        type: 'message',
        date: new Date(Date.now())
      };

      if ($scope.newMessage) {
        $http.post('/api/classrooms/message/' + $scope.classroom._id, message)
          .success(function(message) {
            message.isToday = $scope.checkIfToday(message.date);
            $scope.classroom.messages.push(message);
            $scope.newMessage = undefined;
            $scope.$broadcast('messages_updated');
          }).error(function(err){
            toastr.error(err);
          });
      }
    };
  });
