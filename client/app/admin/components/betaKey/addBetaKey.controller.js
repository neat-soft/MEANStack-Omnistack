'use strict';

angular.module('fsaApp')
  .controller('AddBetaKeyCtrl', function ($scope, $window, $http, Auth, ngDialog) {
    $scope.currentUser = Auth.getCurrentUser();
    $scope.submitted = false;
    $scope.errors = {};
    var oneMonth = function () {
      return new Date(Date.now() + 1000*60*60*24*30);
    };
    $scope.format = 'dd-MMMM-yyyy';

    $scope.dateOptions = {
      formatYear: 'yy',
      startingDay: 1
    };

    $scope.academicRoles = [
      {name: 'Any', value: 'Any'},
      {name: 'Teacher', value: 'Teacher'},
      {name: 'Student', value: 'Student'},
      {name: 'Parent', value: 'Parent'}
    ];

    $scope.key = {
      expires: oneMonth(),
      academicRole: $scope.academicRoles[0].value
    };

    $scope.open = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.opened = true;
    };

    $scope.addNewBetaKey = function (form) {
      var key = $scope.key;
      key.approved = true;
      if (form.$valid) {
        Auth.addNewBetaKey(key);
        ngDialog.close();
      }
    };

  });
