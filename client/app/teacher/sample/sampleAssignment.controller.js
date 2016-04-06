'use strict';

angular.module('fsaApp')
  .controller('TeacherSampleAssignmentCtrl', function ($scope, ngDialog, toastr,$http, persist, $location) {
    if (persist.nonUserAssignment) {
      $scope.assignment = persist.nonUserAssignment;
      delete persist.nonUserAssignment;
    } else {
      $location.path('/');
    }
    $scope.saveUserEmail = function(user) {
      $http.put('/api/classrooms/addEmailByCode/' + $scope.assignment.classroom.code, {
        email: user.email
      }).success(function(classroom) {
        $http.put('/api/classrooms/setUpdate/' + classroom.code + '/' + $scope.assignment.classAssignment.code + '/1')
          .success(function() {
            toastr.success('Successfully subscribed to updates for this assignment.', {
              timeOut: 1000
            });
          }).error(function(err){
            toastr.error(err, {
              timeOut: 1000
            });
          });
      }).error(function(err){
        toastr.error(err, {
          timeOut: 1000
        });
      });
    };
  });
