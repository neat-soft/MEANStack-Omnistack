'use strict';

angular.module('fsaApp')
  .controller('AcademicRoleModalCtrl', function ($scope, $http, toastr, ngDialog) {
    $scope.submitChoice = function(choice) {
      $http.post('/api/users/setAcademicRole', {academicRole: choice})
        .success(function() {
          $scope.closeThisDialog();
        }).error(function(err){
          toastr.error(err, {
            timeOut: 1000
          });
        });
    };
  });
