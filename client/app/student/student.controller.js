'use strict';

angular.module('fsaApp')
  .controller('StudentCtrl', function ($scope, $http, toastr, $location, classroomHelper) {
    $scope.goToClass = function(classroom){
      $location.path('/student/classroom/' + classroom.code);
    };

    $scope.checkIfToday = function(dateThing) {
      var today = new Date(Date.now());
      var dateObj = new Date(dateThing);
      return dateObj.toDateString() === today.toDateString();
    };

    $scope.signUp = function(newClass) {
      $http.post('/api/classrooms/signUpByCode/' + newClass.code, {})
        .success(function(classroom) {
          $scope.classrooms.push(classroom);
          $scope.messages = $scope.messages.concat(classroom.messages);
          classroomHelper.addNewClass(classroom);
        }).error(function(err) {
          toastr.error(err);
        });
    };

    var setupClasses = function (classes) {
      $scope.classrooms = classes;
      // render messages sent to class
      for (var i = 0; i < classes.length; i++) {
        $scope.messages = $scope.messages.concat(classes[i].messages);
        for (var j = 0; j < classes[i].assignments.length; j++) {
          var newAssignment = classes[i].assignments[j]
          if (!newAssignment.submission) {
            newAssignment.subject = classes[i].subject;
            $scope.assignments.push(newAssignment);
          }
        }
      }
    };

    $scope.messages = [];
    // set scope.assignments to assignment service so assignment data is preserved client side
    $scope.assignments = [];
    var storedClasses = classroomHelper.getClasses();
    // minimize load time by making a request only if no classrooms found
    if (storedClasses.length == 0) {
      $http.get('/api/classrooms/byStudent')
        .success(function(classes) {
          // console.log(classes);
          // store classes persistently in classroomHelper
          classroomHelper.setClasses(classes);
          setupClasses(classroomHelper.getClasses());
        }).error(function(err) {
          toastr.error(err);
        });
    } else {
      setupClasses(classroomHelper.getClasses());
    }
  });
