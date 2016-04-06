'use strict';

angular.module('fsaApp')
  .controller('TeacherAdministerAssigmentCtrl', function ($scope, toastr, $http) {

    $scope.administerAssignment = function(administer) {
      $http.post('/api/classrooms/assign', administer)
        .success(function() {
          $scope.closeThisDialog();
          toastr.success('Successfully assigned ' + administer.assignment.name + ' to ' + administer.classroom.name, {
            timeOut: 3000
          });
        }).error(function(err) {
          toastr.error(err, {
            timeOut: 1000
          });
        });
    };

    $scope.administer = {
      assignment: $scope.ngDialogData.assignment,
      dueDate: new Date(Date.now() + 1000*60*60*24*7)
    };

    $scope.classrooms = $scope.ngDialogData.classrooms;

    $scope.dateOptions = {
      formatYear: 'yy',
      startingDay: 1
    };

    $scope.opened = false;

    $scope.open = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.opened = true;
    };

});
