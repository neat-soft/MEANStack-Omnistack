'use strict';

angular.module('fsaApp')
  .controller('BetaKeyCtrl', function ($scope, socket, Auth, $http, ngDialog, filterFilter) {

    $scope.today = new Date(Date.now());

    $scope.search = '';
    $scope.currentPage = 1;
    $scope.maxPage = 1;
    $scope.lim = 2;

    // Fetch All Keys
    $http.get('/api/betaKeys').success(function (keys) {
      $scope.betaKeys = keys;
      $scope.filtered = keys;
      socket.syncUpdates('betaKey', $scope.betaKeys);
      $scope.maxPage = Math.ceil(keys.length/$scope.lim);
    });


    $scope.searchTypes = [
      {name: 'Any', value: '$'},
      {name: 'E-mail', value:'email'},
      {name: 'Name', value: 'name'},
      {name: 'Approved', value: 'approved'},
      {name: 'Claimed', value: 'numClaimed'}
    ];

    $scope.searchType = $scope.searchTypes[0].value;


    $scope.$watch('filtered', function(filtered) {
      if (filtered) {
        var filterLen = filtered.length;
        if (filterLen > 0) {
          $scope.maxPage = Math.ceil(filterLen/$scope.lim);
        }
        else {
          $scope.maxPage = 1;
        }
      }
    });

    //Changes the page of the users.
    $scope.page = function(step) {
      var newPage = $scope.currentPage + step;
      if ((newPage < 1 ) || (newPage > $scope.maxPage)) {
        return;
      }
      else {
        $scope.currentPage = newPage;
      }
    };

    $scope.updateFiltered = function() {
      var filt = {};
      filt[$scope.searchType] = $scope.search;
      $scope.currentPage = 1;
      $scope.filtered = filterFilter($scope.betaKeys, filt);
    };

    // Add BetaKey Modal
    $scope.addBetaKeyModal = function () {
      ngDialog.open({
        template: 'app/admin/components/betaKey/addBetaKey.html',
        controller: 'AddBetaKeyCtrl',
        className: 'ngDialog-theme-top',
        scope: $scope
      });
    };

    $scope.parseClaimed = function(key) {
      if (key.massKey) {
        return key.numClaimed;
      }
      else {
        return key.numClaimed === 1;
      }
    };

    $scope.parseDate = function(date) {
      var parsedDate = new Date(Date.parse(date));
      return parsedDate < $scope.today;
    };

    $scope.removeKey = function(keyId) {
      $http.delete('/api/betaKeys/' + keyId);
    };

    //Remove Claimed
    $scope.removeClaimed = function() {
      $http.delete('/api/betaKeys/claimed');
    };

    //Remove Expired
    $scope.removeExpired = function() {
      $http.delete('/api/betaKeys/expired');
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('betaKey');
    });

  });
