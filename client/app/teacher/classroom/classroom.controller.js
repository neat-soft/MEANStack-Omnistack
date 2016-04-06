'use strict';

angular.module('fsaApp')
  .controller('TeacherClassroomCtrl', function ($scope, ngDialog, $http, toastr, $location, $routeParams, classroomHelper) {
    $scope.gradebookView = 'students';

    var getAverage = function(student) {
      var totalAchieved = 0;
      var totalPossible = 0;
      for (var i = 0; i < $scope.classroom.assignments.length; i++) {
        for (var j = 0; j < $scope.classroom.assignments[i].submissions.length; j++) {
          if (String($scope.classroom.assignments[i].submissions[j].studentId) === String(student._id)) {
            totalAchieved += $scope.classroom.assignments[i].submissions[j].score * $scope.classroom.assignments[i].pointsPossible;
            totalPossible += $scope.classroom.assignments[i].pointsPossible;
          }
        }
      }
      if (totalPossible > 0) {
        return totalAchieved / totalPossible;
      } else {
        return "N/A";
      }
    };

    var setUpClassroom = function (classroom) {
      $scope.classroom = classroom;
      $scope.messages = classroom.messages;
      for (var i = 0; i < $scope.classroom.students.length; i++) {
        $scope.classroom.students[i].average = getAverage($scope.classroom.students[i]);
      }
      return;
    };

    var teacherClassroom = classroomHelper.findTeacherClassroom($routeParams.classCode);
    if (teacherClassroom) {
      setUpClassroom(teacherClassroom);
    } else {
      $http.get('/api/classrooms/byTeacher/byCode/' + $routeParams.classCode)
        .success(function(classroomFromServer) {
          console.log(classroomFromServer);
          console.log(classroomHelper.getTeacherClassrooms());
          classroomHelper.updateTeacherClassrooms(classroomFromServer);
          setUpClassroom(classroomFromServer);
        }).error(function(){$location.path('teacher');});
    }

    var analytics = false;
    if (analytics) {
      $http.get('/api/classrooms/byTeacher/tagAveragesForClass/' + $routeParams.classCode)
        .success(function(tagDict) {
          $scope.tagInfo = tagDict;
        }).error(function(e) {
          toastr.error(e, {
            timeOut: 1000
          });
        });
    }

    $scope.newMessage = undefined;

    $scope.goToTeacher = function() {
      $location.path('teacher');
    };

    $scope.goToClass = function() {
      $location.path('teacher/classroom/' + $routeParams.className);
    };

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
            $scope.messages.push(message);
            $scope.newMessage = undefined;
            $scope.$broadcast('messages_updated');
          }).error(function(err){
            toastr.error(err);
          });
      }
    };

    $scope.goToAssignment = function(assignment) {
      $location.path('teacher/classroom/' + encodeURI($scope.classroom.name) + '/' + encodeURI(assignment));
    };




    if ($routeParams.assignmentName) {
      $scope.currentAssignment = {
        name: decodeURI($routeParams.assignmentName)
      };
      for (var i = 0; i < $scope.classroom.assignments.length; i++) {
        if ($scope.classroom.assignments[i].name === $scope.currentAssignment.name) {
          $scope.currentAssignment.dueDate = $scope.classroom.assignments[i].dueDate;
          $scope.currentAssignment.classAvg = $scope.classroom.assignments[i].classAvg;
        }
      }
      if (!$scope.currentAssignment.classAvg){
        $scope.currentAssignment.classAvg = '75.4%';
      }
    }
    if ($routeParams.assignmentName) {
      $scope.currentAssignment = {
        name: decodeURI($routeParams.assignmentName)
      };
      for (var j = 0; j < $scope.classroom.assignments.length; j++) {
        if ($scope.classroom.assignments[j].name === $scope.currentAssignment.name) {
          $scope.currentAssignment.dueDate = $scope.classroom.assignments[j].dueDate;
          $scope.currentAssignment.classAvg = $scope.classroom.assignments[j].classAvg;
        }
      }
    }

    $scope.assignToClass = function(){
      var assignModal = ngDialog.open({
        template: 'app/teacher/classroom/assignModal.html',
        controller: 'TeacherClassroomAssignCtrl',
        data: {
          classroom: $scope.classroom
        }
      });

      assignModal.closePromise.then(function(data) {
        if(data.value) {
          $scope.classroom.assignments.push(data.value);
        }
      });
    };

    // Opens the gradebook for the specified assignment
    $scope.openGradebook = function(assignment) {
      $location.path('teacher/gradebook/' + encodeURI($scope.classroom.code) + '/' + encodeURI(assignment.assignmentId));
    };
  });
