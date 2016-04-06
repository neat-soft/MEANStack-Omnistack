'use strict';

angular.module('fsaApp')
  .controller('CommunityLeadersCtrl', function ($scope, Auth, $http, usSpinnerService) {

    $scope.getCurrentUser = Auth.getCurrentUser;

    $http.get('/api/communityLeaders').success(function (communityLeaders) {
      $scope.communityLeaders = communityLeaders;

      angular.forEach(communityLeaders, function (leader, key) {
        if (key === 0)
          leader.index = 1;
        else if (communityLeaders[key - 1].referral.usersReferredCount === leader.referral.usersReferredCount)
          leader.index = communityLeaders[key - 1].index;
        else {
          leader.index = communityLeaders[key - 1].index + 1;
        }
      });
      //Stop Spinner
      $scope.stopSpin('spinner-1');
    });

    $http.get('/api/communityLeaders/myrank').success(function (data) {
      $scope.myrank = data.myrank;
    });

    //Spinner
    $scope.startSpin = function (spinner) {
      usSpinnerService.spin(spinner);
    };
    $scope.stopSpin = function (spinner) {
      usSpinnerService.stop(spinner);
    };
  });
