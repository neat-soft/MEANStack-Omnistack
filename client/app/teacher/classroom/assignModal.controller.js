'use strict';

angular.module('fsaApp')
  .controller('TeacherClassroomAssignCtrl', function ($scope, $http, toastr) {
    $scope.types = ['Exam', 'Homework', 'Quiz', 'Other'];
    $scope.opened = false;
    $scope.classroom = $scope.ngDialogData.classroom;
    $scope.newAssignment = {
      type: $scope.types[0]
    };

    $scope.addType = function(newType) {
      $scope.types.push(newType);
      $scope.newAssignment.type = $scope.types[$scope.types.length-1];
      delete $scope.newAssignment.newType;
    };

    $scope.open = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.opened = true;
    };

    $scope.submitDate = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $http.put('/api/settings/byName/accountTrackerDate', {info: {date: $scope.accountTrackerDate}})
        .error(function(err) {
          console.error(err);
        })
        .success(function(data) {
          console.log(data);
        });
    };

    $scope.dateOptions = {
      formatYear: 'yy',
      startingDay: 1
    };

    $http.get('api/assignments/byAuthor/')
      .success(function(assignments) {
        if (assignments.length > 0) {
          $scope.assignments = assignments;
        }
      }).error(function(err) {
        toastr.error(err);
      });
  });
