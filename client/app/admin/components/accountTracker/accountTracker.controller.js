'use strict';

angular.module('fsaApp')
  .controller('AccountTrackerCtrl', function ($scope, $http) {
    $http.get('/api/settings/byName/accountTrackerDate')
      .error(function(err) {
        console.error(err);
        $scope.accountTrackerDate = new Date(Date.now());
      })
      .success(function(data) {
        $scope.accountTrackerDate = data.info.date;
      })
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
  });
