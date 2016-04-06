'use strict';

angular.module('fsaApp')
  .controller('CouponCtrl', function ($scope, socket, Auth, $http, ngDialog) {

    $scope.today = new Date(Date.now());

    // Fetch All Keys
    $http.get('/api/coupons').success(function (keys) {
      $scope.coupons = keys;
      socket.syncUpdates('coupon', $scope.coupons);
    });

    // Add Coupon Modal
    $scope.addCouponModal = function () {
      ngDialog.open({
        template: 'app/admin/components/couponManagement/addCoupon.html',
        controller: 'AddCouponCtrl',
        className: 'ngDialog-theme-top',
        scope: $scope
      });
    };

    $scope.removeCoupon = function(keyId) {
      $http.delete('/api/coupons/' + keyId);
    };

    //Remove Expired
    $scope.removeExpired = function() {
      $http.delete('/api/coupons/expired');
    };

    $scope.removeReachedLimit = function() {
      $http.delete('/api/coupons/limitReached');
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('coupon');
    });

  });
